import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { AppConfig } from './config';

interface Ec2StackProps extends cdk.StackProps {
  readonly vpc: ec2.IVpc;
  readonly albSecurityGroup: ec2.ISecurityGroup;
  readonly config: AppConfig;
}

export class VoiceAgentEc2Stack extends cdk.Stack {
  public readonly targetGroup: elbv2.ApplicationTargetGroup;

  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);

    const { vpc, albSecurityGroup, config } = props;

    // 1. EC2 Security Group - Restrict to ALB
    const ec2Sg = new ec2.SecurityGroup(this, 'VoiceAgentEc2SG', {
      vpc,
      description: 'Restricted access for Backend Instances',
      allowAllOutbound: true,
    });
    ec2Sg.addIngressRule(albSecurityGroup, ec2.Port.tcp(3001), 'Allow traffic from ALB');
    ec2Sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access');

    // 2. IAM Role for EC2
    const role = new iam.Role(this, 'VoiceAgentInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));

    // 3. CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'VoiceAgentLogGroup', {
      logGroupName: `/aws/ec2/${config.projectName}/backend`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 4. Grant SSM GetParameter access for secrets
    role.addToPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: [
        `arn:aws:ssm:${config.region}:${config.account}:parameter/medhalabs/voice-agent/*`,
      ],
    }));

    // 5. User Data - Full app bootstrap
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      'exec > /var/log/user-data.log 2>&1',

      '# --- System Setup ---',
      'dnf update -y',
      'dnf install -y git',
      'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -',
      'dnf install -y nodejs',
      'npm install -g pm2 typescript',

      '# --- Fetch Secrets from SSM ---',
      `GEMINI_API_KEY=$(aws ssm get-parameter --name "/medhalabs/voice-agent/GEMINI_API_KEY" --with-decryption --region ${config.region} --query "Parameter.Value" --output text)`,

      '# --- Clone Repository ---',
      'cd /home/ec2-user',
      'git clone https://github.com/saicharangadamshetti/medhalabs-ai.git app || (cd app && git pull)',
      'cd /home/ec2-user/app/voice-agent',

      '# --- Write .env file ---',
      'cat > .env <<EOF',
      'NODE_ENV=production',
      'PORT=3001',
      `GEMINI_API_KEY=$GEMINI_API_KEY`,
      `ALLOWED_ORIGINS=${config.allowedOrigins.join(',')}`,
      'EOF',

      '# --- Install Dependencies & Build ---',
      'npm install',
      'npx tsc --project tsconfig.json || true',

      '# --- Start App with PM2 ---',
      'pm2 start src/index.js --name voice-agent --env production',
      'pm2 save',

      '# --- Configure PM2 to start on reboot ---',
      'env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user',
      'chown -R ec2-user:ec2-user /home/ec2-user',
      'echo "Bootstrap complete!"'
    );

    // 5a. Define the Launch Template (The modern way)
    const launchTemplate = new ec2.LaunchTemplate(this, 'VoiceAgentLaunchTemplate', {
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      instanceType: new ec2.InstanceType(props.config.instanceType),
      securityGroup: ec2Sg,
      role: role,
      userData: userData,
      // Launch Templates allow for versioning and newer features
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: ec2.BlockDeviceVolume.ebs(20),
      }],
    });

    // 5b. Update Auto Scaling Group to use the Template
    const asg = new autoscaling.AutoScalingGroup(this, 'VoiceAgentASG', {
      vpc,
      // Remove instanceType, machineImage, securityGroup, role, and userData from here
      // because they are now defined in the launchTemplate
      launchTemplate: launchTemplate,
      minCapacity: 1,
      maxCapacity: 2,
      desiredCapacity: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // 6. Define Target Group (The service owns this)
    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'VoiceAgentTargetGroup', {
      vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [asg],
      healthCheck: {
        path: '/',
        port: '3001',
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 5,
        interval: cdk.Duration.seconds(30),
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'LogGroupNameOutput', {
      value: logGroup.logGroupName,
    });
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceAgentEc2Stack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const autoscaling = require("aws-cdk-lib/aws-autoscaling");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
class VoiceAgentEc2Stack extends cdk.Stack {
    targetGroup;
    constructor(scope, id, props) {
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
        userData.addCommands('#!/bin/bash', 'set -e', 'exec > /var/log/user-data.log 2>&1', '# --- System Setup ---', 'dnf update -y', 'dnf install -y git', 'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -', 'dnf install -y nodejs', 'npm install -g pm2 typescript', '# --- Fetch Secrets from SSM ---', `GEMINI_API_KEY=$(aws ssm get-parameter --name "/medhalabs/voice-agent/GEMINI_API_KEY" --with-decryption --region ${config.region} --query "Parameter.Value" --output text)`, '# --- Clone Repository ---', 'cd /home/ec2-user', 'git clone https://github.com/saicharangadamshetti/medhalabs-ai.git app || (cd app && git pull)', 'cd /home/ec2-user/app/voice-agent', '# --- Write .env file ---', 'cat > .env <<EOF', 'NODE_ENV=production', 'PORT=3001', `GEMINI_API_KEY=$GEMINI_API_KEY`, 'EOF', '# --- Install Dependencies & Build ---', 'npm install', 'npx tsc --project tsconfig.json || true', '# --- Start App with PM2 ---', 'pm2 start src/index.js --name voice-agent --env production', 'pm2 save', '# --- Configure PM2 to start on reboot ---', 'env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user', 'chown -R ec2-user:ec2-user /home/ec2-user', 'echo "Bootstrap complete!"');
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
exports.VoiceAgentEc2Stack = VoiceAgentEc2Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWMyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUM3QywyREFBMkQ7QUFDM0QsZ0VBQWdFO0FBVWhFLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDL0IsV0FBVyxDQUErQjtJQUUxRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRWhELDBDQUEwQztRQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQzNELEdBQUc7WUFDSCxXQUFXLEVBQUUseUNBQXlDO1lBQ3RELGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3JGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRS9FLHNCQUFzQjtRQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3hELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztT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SUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDakYsR0FBRztZQUNILElBQUksRUFBRSxJQUFJO1lBQ1YsUUFBUSxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJO1lBQ3hDLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNkLFdBQVcsRUFBRTtnQkFDWCxJQUFJLEVBQUUsR0FBRztnQkFDVCxJQUFJLEVBQUUsTUFBTTtnQkFDWixxQkFBcUIsRUFBRSxDQUFDO2dCQUN4Qix1QkFBdUIsRUFBRSxDQUFDO2dCQUMxQixRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2FBQ25DO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsVUFBVTtRQUNWLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDNUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxZQUFZO1NBQzdCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWhJRCxnREFnSUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgKiBhcyBhdXRvc2NhbGluZyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXV0b3NjYWxpbmcnO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBBcHBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmludGVyZmFjZSBFYzJTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICByZWFkb25seSBhbGJTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IGNvbmZpZzogQXBwQ29uZmlnO1xufVxuXG5leHBvcnQgY2xhc3MgVm9pY2VBZ2VudEVjMlN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHRhcmdldEdyb3VwOiBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFYzJTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IHZwYywgYWxiU2VjdXJpdHlHcm91cCwgY29uZmlnIH0gPSBwcm9wcztcblxuICAgIC8vIDEuIEVDMiBTZWN1cml0eSBHcm91cCAtIFJlc3RyaWN0IHRvIEFMQlxuICAgIGNvbnN0IGVjMlNnID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdWb2ljZUFnZW50RWMyU0cnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Jlc3RyaWN0ZWQgYWNjZXNzIGZvciBCYWNrZW5kIEluc3RhbmNlcycsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pO1xuICAgIGVjMlNnLmFkZEluZ3Jlc3NSdWxlKGFsYlNlY3VyaXR5R3JvdXAsIGVjMi5Qb3J0LnRjcCgzMDAxKSwgJ0FsbG93IHRyYWZmaWMgZnJvbSBBTEInKTtcbiAgICBlYzJTZy5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCgyMiksICdBbGxvdyBTU0ggYWNjZXNzJyk7XG5cbiAgICAvLyAyLiBJQU0gUm9sZSBmb3IgRUMyXG4gICAgY29uc3Qgcm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnVm9pY2VBZ2VudEluc3RhbmNlUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlYzIuYW1hem9uYXdzLmNvbScpLFxuICAgIH0pO1xuICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0FtYXpvblNTTU1hbmFnZWRJbnN0YW5jZUNvcmUnKSk7XG4gICAgcm9sZS5hZGRNYW5hZ2VkUG9saWN5KGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZSgnQ2xvdWRXYXRjaEFnZW50U2VydmVyUG9saWN5JykpO1xuXG4gICAgLy8gMy4gQ2xvdWRXYXRjaCBMb2cgR3JvdXBcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdWb2ljZUFnZW50TG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2VjMi8ke2NvbmZpZy5wcm9qZWN0TmFtZX0vYmFja2VuZGAsXG4gICAgICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyA0LiBHcmFudCBTU00gR2V0UGFyYW1ldGVyIGFjY2VzcyBmb3Igc2VjcmV0c1xuICAgIHJvbGUuYWRkVG9Qb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgYWN0aW9uczogWydzc206R2V0UGFyYW1ldGVyJywgJ3NzbTpHZXRQYXJhbWV0ZXJzJ10sXG4gICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgYGFybjphd3M6c3NtOiR7Y29uZmlnLnJlZ2lvbn06JHtjb25maWcuYWNjb3VudH06cGFyYW1ldGVyL21lZGhhbGFicy92b2ljZS1hZ2VudC8qYCxcbiAgICAgIF0sXG4gICAgfSkpO1xuXG4gICAgLy8gNS4gVXNlciBEYXRhIC0gRnVsbCBhcHAgYm9vdHN0cmFwXG4gICAgY29uc3QgdXNlckRhdGEgPSBlYzIuVXNlckRhdGEuZm9yTGludXgoKTtcbiAgICB1c2VyRGF0YS5hZGRDb21tYW5kcyhcbiAgICAgICcjIS9iaW4vYmFzaCcsXG4gICAgICAnc2V0IC1lJyxcbiAgICAgICdleGVjID4gL3Zhci9sb2cvdXNlci1kYXRhLmxvZyAyPiYxJyxcblxuICAgICAgJyMgLS0tIFN5c3RlbSBTZXR1cCAtLS0nLFxuICAgICAgJ2RuZiB1cGRhdGUgLXknLFxuICAgICAgJ2RuZiBpbnN0YWxsIC15IGdpdCcsXG4gICAgICAnY3VybCAtZnNTTCBodHRwczovL3JwbS5ub2Rlc291cmNlLmNvbS9zZXR1cF8yMC54IHwgYmFzaCAtJyxcbiAgICAgICdkbmYgaW5zdGFsbCAteSBub2RlanMnLFxuICAgICAgJ25wbSBpbnN0YWxsIC1nIHBtMiB0eXBlc2NyaXB0JyxcblxuICAgICAgJyMgLS0tIEZldGNoIFNlY3JldHMgZnJvbSBTU00gLS0tJyxcbiAgICAgIGBHRU1JTklfQVBJX0tFWT0kKGF3cyBzc20gZ2V0LXBhcmFtZXRlciAtLW5hbWUgXCIvbWVkaGFsYWJzL3ZvaWNlLWFnZW50L0dFTUlOSV9BUElfS0VZXCIgLS13aXRoLWRlY3J5cHRpb24gLS1yZWdpb24gJHtjb25maWcucmVnaW9ufSAtLXF1ZXJ5IFwiUGFyYW1ldGVyLlZhbHVlXCIgLS1vdXRwdXQgdGV4dClgLFxuXG4gICAgICAnIyAtLS0gQ2xvbmUgUmVwb3NpdG9yeSAtLS0nLFxuICAgICAgJ2NkIC9ob21lL2VjMi11c2VyJyxcbiAgICAgICdnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL3NhaWNoYXJhbmdhZGFtc2hldHRpL21lZGhhbGFicy1haS5naXQgYXBwIHx8IChjZCBhcHAgJiYgZ2l0IHB1bGwpJyxcbiAgICAgICdjZCAvaG9tZS9lYzItdXNlci9hcHAvdm9pY2UtYWdlbnQnLFxuXG4gICAgICAnIyAtLS0gV3JpdGUgLmVudiBmaWxlIC0tLScsXG4gICAgICAnY2F0ID4gLmVudiA8PEVPRicsXG4gICAgICAnTk9ERV9FTlY9cHJvZHVjdGlvbicsXG4gICAgICAnUE9SVD0zMDAxJyxcbiAgICAgIGBHRU1JTklfQVBJX0tFWT0kR0VNSU5JX0FQSV9LRVlgLFxuICAgICAgJ0VPRicsXG5cbiAgICAgICcjIC0tLSBJbnN0YWxsIERlcGVuZGVuY2llcyAmIEJ1aWxkIC0tLScsXG4gICAgICAnbnBtIGluc3RhbGwnLFxuICAgICAgJ25weCB0c2MgLS1wcm9qZWN0IHRzY29uZmlnLmpzb24gfHwgdHJ1ZScsXG5cbiAgICAgICcjIC0tLSBTdGFydCBBcHAgd2l0aCBQTTIgLS0tJyxcbiAgICAgICdwbTIgc3RhcnQgc3JjL2luZGV4LmpzIC0tbmFtZSB2b2ljZS1hZ2VudCAtLWVudiBwcm9kdWN0aW9uJyxcbiAgICAgICdwbTIgc2F2ZScsXG5cbiAgICAgICcjIC0tLSBDb25maWd1cmUgUE0yIHRvIHN0YXJ0IG9uIHJlYm9vdCAtLS0nLFxuICAgICAgJ2VudiBQQVRIPSRQQVRIOi91c3IvYmluIHBtMiBzdGFydHVwIHN5c3RlbWQgLXUgZWMyLXVzZXIgLS1ocCAvaG9tZS9lYzItdXNlcicsXG4gICAgICAnY2hvd24gLVIgZWMyLXVzZXI6ZWMyLXVzZXIgL2hvbWUvZWMyLXVzZXInLFxuICAgICAgJ2VjaG8gXCJCb290c3RyYXAgY29tcGxldGUhXCInXG4gICAgKTtcblxuICAgIC8vIDVhLiBEZWZpbmUgdGhlIExhdW5jaCBUZW1wbGF0ZSAoVGhlIG1vZGVybiB3YXkpXG4gICAgY29uc3QgbGF1bmNoVGVtcGxhdGUgPSBuZXcgZWMyLkxhdW5jaFRlbXBsYXRlKHRoaXMsICdWb2ljZUFnZW50TGF1bmNoVGVtcGxhdGUnLCB7XG4gICAgICBtYWNoaW5lSW1hZ2U6IGVjMi5NYWNoaW5lSW1hZ2UubGF0ZXN0QW1hem9uTGludXgyMDIzKCksXG4gICAgICBpbnN0YW5jZVR5cGU6IG5ldyBlYzIuSW5zdGFuY2VUeXBlKHByb3BzLmNvbmZpZy5pbnN0YW5jZVR5cGUpLFxuICAgICAgc2VjdXJpdHlHcm91cDogZWMyU2csXG4gICAgICByb2xlOiByb2xlLFxuICAgICAgdXNlckRhdGE6IHVzZXJEYXRhLFxuICAgICAgLy8gTGF1bmNoIFRlbXBsYXRlcyBhbGxvdyBmb3IgdmVyc2lvbmluZyBhbmQgbmV3ZXIgZmVhdHVyZXNcbiAgICAgIGJsb2NrRGV2aWNlczogW3tcbiAgICAgICAgZGV2aWNlTmFtZTogJy9kZXYveHZkYScsXG4gICAgICAgIHZvbHVtZTogZWMyLkJsb2NrRGV2aWNlVm9sdW1lLmVicygyMCksXG4gICAgICB9XSxcbiAgICB9KTtcblxuICAgIC8vIDViLiBVcGRhdGUgQXV0byBTY2FsaW5nIEdyb3VwIHRvIHVzZSB0aGUgVGVtcGxhdGVcbiAgICBjb25zdCBhc2cgPSBuZXcgYXV0b3NjYWxpbmcuQXV0b1NjYWxpbmdHcm91cCh0aGlzLCAnVm9pY2VBZ2VudEFTRycsIHtcbiAgICAgIHZwYyxcbiAgICAgIC8vIFJlbW92ZSBpbnN0YW5jZVR5cGUsIG1hY2hpbmVJbWFnZSwgc2VjdXJpdHlHcm91cCwgcm9sZSwgYW5kIHVzZXJEYXRhIGZyb20gaGVyZVxuICAgICAgLy8gYmVjYXVzZSB0aGV5IGFyZSBub3cgZGVmaW5lZCBpbiB0aGUgbGF1bmNoVGVtcGxhdGVcbiAgICAgIGxhdW5jaFRlbXBsYXRlOiBsYXVuY2hUZW1wbGF0ZSxcbiAgICAgIG1pbkNhcGFjaXR5OiAxLFxuICAgICAgbWF4Q2FwYWNpdHk6IDIsXG4gICAgICBkZXNpcmVkQ2FwYWNpdHk6IDEsXG4gICAgICB2cGNTdWJuZXRzOiB7IHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBVQkxJQyB9LFxuICAgIH0pO1xuXG4gICAgLy8gNi4gRGVmaW5lIFRhcmdldCBHcm91cCAoVGhlIHNlcnZpY2Ugb3ducyB0aGlzKVxuICAgIHRoaXMudGFyZ2V0R3JvdXAgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cCh0aGlzLCAnVm9pY2VBZ2VudFRhcmdldEdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgcG9ydDogMzAwMSxcbiAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICB0YXJnZXRzOiBbYXNnXSxcbiAgICAgIGhlYWx0aENoZWNrOiB7XG4gICAgICAgIHBhdGg6ICcvJyxcbiAgICAgICAgcG9ydDogJzMwMDEnLFxuICAgICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiA1LFxuICAgICAgICBpbnRlcnZhbDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTG9nR3JvdXBOYW1lT3V0cHV0Jywge1xuICAgICAgdmFsdWU6IGxvZ0dyb3VwLmxvZ0dyb3VwTmFtZSxcbiAgICB9KTtcbiAgfVxufVxuIl19
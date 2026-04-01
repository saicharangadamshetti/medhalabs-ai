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
        userData.addCommands('#!/bin/bash', 'set -e', 'exec > /var/log/user-data.log 2>&1', '# --- System Setup ---', 'dnf update -y', 'dnf install -y git', 'curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -', 'dnf install -y nodejs', 'npm install -g pm2 typescript', '# --- Fetch Secrets from SSM ---', `GEMINI_API_KEY=$(aws ssm get-parameter --name "/medhalabs/voice-agent/GEMINI_API_KEY" --with-decryption --region ${config.region} --query "Parameter.Value" --output text)`, '# --- Clone Repository ---', 'cd /home/ec2-user', 'git clone https://github.com/saicharangadamshetti/medhalabs-ai.git app || (cd app && git pull)', 'cd /home/ec2-user/app/voice-agent', '# --- Write .env file ---', 'cat > .env <<EOF', 'NODE_ENV=production', 'PORT=3001', `GEMINI_API_KEY=$GEMINI_API_KEY`, `ALLOWED_ORIGINS=${config.allowedOrigins.join(',')}`, 'EOF', '# --- Install Dependencies & Build ---', 'npm install', 'npx tsc --project tsconfig.json || true', '# --- Start App with PM2 ---', 'pm2 start src/index.js --name voice-agent --env production', 'pm2 save', '# --- Configure PM2 to start on reboot ---', 'env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user', 'chown -R ec2-user:ec2-user /home/ec2-user', 'echo "Bootstrap complete!"');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWMyLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWMyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUM3QywyREFBMkQ7QUFDM0QsZ0VBQWdFO0FBVWhFLE1BQWEsa0JBQW1CLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDL0IsV0FBVyxDQUErQjtJQUUxRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRWhELDBDQUEwQztRQUMxQyxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQzNELEdBQUc7WUFDSCxXQUFXLEVBQUUseUNBQXlDO1lBQ3RELGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3JGLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRS9FLHNCQUFzQjtRQUN0QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHdCQUF3QixFQUFFO1lBQ3hELFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQztT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QUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7U0FDbEQsQ0FBQyxDQUFDO1FBRUgsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxLQUFLLENBQUMsc0JBQXNCLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQ2pGLEdBQUc7WUFDSCxJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSTtZQUN4QyxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDZCxXQUFXLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsSUFBSSxFQUFFLE1BQU07Z0JBQ1oscUJBQXFCLEVBQUUsQ0FBQztnQkFDeEIsdUJBQXVCLEVBQUUsQ0FBQztnQkFDMUIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQzthQUNuQztTQUNGLENBQUMsQ0FBQztRQUVILFVBQVU7UUFDVixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQzVDLEtBQUssRUFBRSxRQUFRLENBQUMsWUFBWTtTQUM3QixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqSUQsZ0RBaUlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgYXV0b3NjYWxpbmcgZnJvbSAnYXdzLWNkay1saWIvYXdzLWF1dG9zY2FsaW5nJztcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQXBwQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5pbnRlcmZhY2UgRWMyU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgcmVhZG9ubHkgdnBjOiBlYzIuSVZwYztcbiAgcmVhZG9ubHkgYWxiU2VjdXJpdHlHcm91cDogZWMyLklTZWN1cml0eUdyb3VwO1xuICByZWFkb25seSBjb25maWc6IEFwcENvbmZpZztcbn1cblxuZXhwb3J0IGNsYXNzIFZvaWNlQWdlbnRFYzJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRHcm91cDogZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogRWMyU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyB2cGMsIGFsYlNlY3VyaXR5R3JvdXAsIGNvbmZpZyB9ID0gcHJvcHM7XG5cbiAgICAvLyAxLiBFQzIgU2VjdXJpdHkgR3JvdXAgLSBSZXN0cmljdCB0byBBTEJcbiAgICBjb25zdCBlYzJTZyA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnVm9pY2VBZ2VudEVjMlNHJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdSZXN0cmljdGVkIGFjY2VzcyBmb3IgQmFja2VuZCBJbnN0YW5jZXMnLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcbiAgICBlYzJTZy5hZGRJbmdyZXNzUnVsZShhbGJTZWN1cml0eUdyb3VwLCBlYzIuUG9ydC50Y3AoMzAwMSksICdBbGxvdyB0cmFmZmljIGZyb20gQUxCJyk7XG4gICAgZWMyU2cuYWRkSW5ncmVzc1J1bGUoZWMyLlBlZXIuYW55SXB2NCgpLCBlYzIuUG9ydC50Y3AoMjIpLCAnQWxsb3cgU1NIIGFjY2VzcycpO1xuXG4gICAgLy8gMi4gSUFNIFJvbGUgZm9yIEVDMlxuICAgIGNvbnN0IHJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1ZvaWNlQWdlbnRJbnN0YW5jZVJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWMyLmFtYXpvbmF3cy5jb20nKSxcbiAgICB9KTtcbiAgICByb2xlLmFkZE1hbmFnZWRQb2xpY3koaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdBbWF6b25TU01NYW5hZ2VkSW5zdGFuY2VDb3JlJykpO1xuICAgIHJvbGUuYWRkTWFuYWdlZFBvbGljeShpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ0Nsb3VkV2F0Y2hBZ2VudFNlcnZlclBvbGljeScpKTtcblxuICAgIC8vIDMuIENsb3VkV2F0Y2ggTG9nIEdyb3VwXG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnVm9pY2VBZ2VudExvZ0dyb3VwJywge1xuICAgICAgbG9nR3JvdXBOYW1lOiBgL2F3cy9lYzIvJHtjb25maWcucHJvamVjdE5hbWV9L2JhY2tlbmRgLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gNC4gR3JhbnQgU1NNIEdldFBhcmFtZXRlciBhY2Nlc3MgZm9yIHNlY3JldHNcbiAgICByb2xlLmFkZFRvUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFsnc3NtOkdldFBhcmFtZXRlcicsICdzc206R2V0UGFyYW1ldGVycyddLFxuICAgICAgcmVzb3VyY2VzOiBbXG4gICAgICAgIGBhcm46YXdzOnNzbToke2NvbmZpZy5yZWdpb259OiR7Y29uZmlnLmFjY291bnR9OnBhcmFtZXRlci9tZWRoYWxhYnMvdm9pY2UtYWdlbnQvKmAsXG4gICAgICBdLFxuICAgIH0pKTtcblxuICAgIC8vIDUuIFVzZXIgRGF0YSAtIEZ1bGwgYXBwIGJvb3RzdHJhcFxuICAgIGNvbnN0IHVzZXJEYXRhID0gZWMyLlVzZXJEYXRhLmZvckxpbnV4KCk7XG4gICAgdXNlckRhdGEuYWRkQ29tbWFuZHMoXG4gICAgICAnIyEvYmluL2Jhc2gnLFxuICAgICAgJ3NldCAtZScsXG4gICAgICAnZXhlYyA+IC92YXIvbG9nL3VzZXItZGF0YS5sb2cgMj4mMScsXG5cbiAgICAgICcjIC0tLSBTeXN0ZW0gU2V0dXAgLS0tJyxcbiAgICAgICdkbmYgdXBkYXRlIC15JyxcbiAgICAgICdkbmYgaW5zdGFsbCAteSBnaXQnLFxuICAgICAgJ2N1cmwgLWZzU0wgaHR0cHM6Ly9ycG0ubm9kZXNvdXJjZS5jb20vc2V0dXBfMjAueCB8IGJhc2ggLScsXG4gICAgICAnZG5mIGluc3RhbGwgLXkgbm9kZWpzJyxcbiAgICAgICducG0gaW5zdGFsbCAtZyBwbTIgdHlwZXNjcmlwdCcsXG5cbiAgICAgICcjIC0tLSBGZXRjaCBTZWNyZXRzIGZyb20gU1NNIC0tLScsXG4gICAgICBgR0VNSU5JX0FQSV9LRVk9JChhd3Mgc3NtIGdldC1wYXJhbWV0ZXIgLS1uYW1lIFwiL21lZGhhbGFicy92b2ljZS1hZ2VudC9HRU1JTklfQVBJX0tFWVwiIC0td2l0aC1kZWNyeXB0aW9uIC0tcmVnaW9uICR7Y29uZmlnLnJlZ2lvbn0gLS1xdWVyeSBcIlBhcmFtZXRlci5WYWx1ZVwiIC0tb3V0cHV0IHRleHQpYCxcblxuICAgICAgJyMgLS0tIENsb25lIFJlcG9zaXRvcnkgLS0tJyxcbiAgICAgICdjZCAvaG9tZS9lYzItdXNlcicsXG4gICAgICAnZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9zYWljaGFyYW5nYWRhbXNoZXR0aS9tZWRoYWxhYnMtYWkuZ2l0IGFwcCB8fCAoY2QgYXBwICYmIGdpdCBwdWxsKScsXG4gICAgICAnY2QgL2hvbWUvZWMyLXVzZXIvYXBwL3ZvaWNlLWFnZW50JyxcblxuICAgICAgJyMgLS0tIFdyaXRlIC5lbnYgZmlsZSAtLS0nLFxuICAgICAgJ2NhdCA+IC5lbnYgPDxFT0YnLFxuICAgICAgJ05PREVfRU5WPXByb2R1Y3Rpb24nLFxuICAgICAgJ1BPUlQ9MzAwMScsXG4gICAgICBgR0VNSU5JX0FQSV9LRVk9JEdFTUlOSV9BUElfS0VZYCxcbiAgICAgIGBBTExPV0VEX09SSUdJTlM9JHtjb25maWcuYWxsb3dlZE9yaWdpbnMuam9pbignLCcpfWAsXG4gICAgICAnRU9GJyxcblxuICAgICAgJyMgLS0tIEluc3RhbGwgRGVwZW5kZW5jaWVzICYgQnVpbGQgLS0tJyxcbiAgICAgICducG0gaW5zdGFsbCcsXG4gICAgICAnbnB4IHRzYyAtLXByb2plY3QgdHNjb25maWcuanNvbiB8fCB0cnVlJyxcblxuICAgICAgJyMgLS0tIFN0YXJ0IEFwcCB3aXRoIFBNMiAtLS0nLFxuICAgICAgJ3BtMiBzdGFydCBzcmMvaW5kZXguanMgLS1uYW1lIHZvaWNlLWFnZW50IC0tZW52IHByb2R1Y3Rpb24nLFxuICAgICAgJ3BtMiBzYXZlJyxcblxuICAgICAgJyMgLS0tIENvbmZpZ3VyZSBQTTIgdG8gc3RhcnQgb24gcmVib290IC0tLScsXG4gICAgICAnZW52IFBBVEg9JFBBVEg6L3Vzci9iaW4gcG0yIHN0YXJ0dXAgc3lzdGVtZCAtdSBlYzItdXNlciAtLWhwIC9ob21lL2VjMi11c2VyJyxcbiAgICAgICdjaG93biAtUiBlYzItdXNlcjplYzItdXNlciAvaG9tZS9lYzItdXNlcicsXG4gICAgICAnZWNobyBcIkJvb3RzdHJhcCBjb21wbGV0ZSFcIidcbiAgICApO1xuXG4gICAgLy8gNWEuIERlZmluZSB0aGUgTGF1bmNoIFRlbXBsYXRlIChUaGUgbW9kZXJuIHdheSlcbiAgICBjb25zdCBsYXVuY2hUZW1wbGF0ZSA9IG5ldyBlYzIuTGF1bmNoVGVtcGxhdGUodGhpcywgJ1ZvaWNlQWdlbnRMYXVuY2hUZW1wbGF0ZScsIHtcbiAgICAgIG1hY2hpbmVJbWFnZTogZWMyLk1hY2hpbmVJbWFnZS5sYXRlc3RBbWF6b25MaW51eDIwMjMoKSxcbiAgICAgIGluc3RhbmNlVHlwZTogbmV3IGVjMi5JbnN0YW5jZVR5cGUocHJvcHMuY29uZmlnLmluc3RhbmNlVHlwZSksXG4gICAgICBzZWN1cml0eUdyb3VwOiBlYzJTZyxcbiAgICAgIHJvbGU6IHJvbGUsXG4gICAgICB1c2VyRGF0YTogdXNlckRhdGEsXG4gICAgICAvLyBMYXVuY2ggVGVtcGxhdGVzIGFsbG93IGZvciB2ZXJzaW9uaW5nIGFuZCBuZXdlciBmZWF0dXJlc1xuICAgICAgYmxvY2tEZXZpY2VzOiBbe1xuICAgICAgICBkZXZpY2VOYW1lOiAnL2Rldi94dmRhJyxcbiAgICAgICAgdm9sdW1lOiBlYzIuQmxvY2tEZXZpY2VWb2x1bWUuZWJzKDIwKSxcbiAgICAgIH1dLFxuICAgIH0pO1xuXG4gICAgLy8gNWIuIFVwZGF0ZSBBdXRvIFNjYWxpbmcgR3JvdXAgdG8gdXNlIHRoZSBUZW1wbGF0ZVxuICAgIGNvbnN0IGFzZyA9IG5ldyBhdXRvc2NhbGluZy5BdXRvU2NhbGluZ0dyb3VwKHRoaXMsICdWb2ljZUFnZW50QVNHJywge1xuICAgICAgdnBjLFxuICAgICAgLy8gUmVtb3ZlIGluc3RhbmNlVHlwZSwgbWFjaGluZUltYWdlLCBzZWN1cml0eUdyb3VwLCByb2xlLCBhbmQgdXNlckRhdGEgZnJvbSBoZXJlXG4gICAgICAvLyBiZWNhdXNlIHRoZXkgYXJlIG5vdyBkZWZpbmVkIGluIHRoZSBsYXVuY2hUZW1wbGF0ZVxuICAgICAgbGF1bmNoVGVtcGxhdGU6IGxhdW5jaFRlbXBsYXRlLFxuICAgICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgICBtYXhDYXBhY2l0eTogMixcbiAgICAgIGRlc2lyZWRDYXBhY2l0eTogMSxcbiAgICAgIHZwY1N1Ym5ldHM6IHsgc3VibmV0VHlwZTogZWMyLlN1Ym5ldFR5cGUuUFVCTElDIH0sXG4gICAgfSk7XG5cbiAgICAvLyA2LiBEZWZpbmUgVGFyZ2V0IEdyb3VwIChUaGUgc2VydmljZSBvd25zIHRoaXMpXG4gICAgdGhpcy50YXJnZXRHcm91cCA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwKHRoaXMsICdWb2ljZUFnZW50VGFyZ2V0R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBwb3J0OiAzMDAxLFxuICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICAgIHRhcmdldHM6IFthc2ddLFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgcGF0aDogJy8nLFxuICAgICAgICBwb3J0OiAnMzAwMScsXG4gICAgICAgIGhlYWx0aHlUaHJlc2hvbGRDb3VudDogMixcbiAgICAgICAgdW5oZWFsdGh5VGhyZXNob2xkQ291bnQ6IDUsXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMb2dHcm91cE5hbWVPdXRwdXQnLCB7XG4gICAgICB2YWx1ZTogbG9nR3JvdXAubG9nR3JvdXBOYW1lLFxuICAgIH0pO1xuICB9XG59XG4iXX0=
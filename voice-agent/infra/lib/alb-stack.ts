import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { AppConfig } from './config';

interface AlbStackProps extends cdk.StackProps {
  readonly vpc: ec2.IVpc;
  readonly albSecurityGroup: ec2.ISecurityGroup;
  readonly targetGroups: elbv2.IApplicationTargetGroup[];
  readonly config: AppConfig;
}

export class SharedAlbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AlbStackProps) {
    super(scope, id, props);

    // 1. Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'SharedALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
    });

    // 2. Shared Listener
    const listener = alb.addListener('SharedListener', {
      port: 80,
      open: true,
    });

    // 3. Register Provided Targets (Decoupled from specific services)
    if (props.targetGroups.length > 0) {
      listener.addTargetGroups('ServiceTargets', {
        targetGroups: props.targetGroups,
      });
    }

    // 4. Outputs
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
    });
  }
}

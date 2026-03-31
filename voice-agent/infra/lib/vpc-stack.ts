import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { AppConfig } from './config';

export class VpcStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly albSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, config: AppConfig, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'SharedVpc', {
      ipAddresses: ec2.IpAddresses.cidr(config.vpcCidr),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Share the ALB Security Group here to break circular dependencies
    this.albSecurityGroup = new ec2.SecurityGroup(this, 'SharedAlbSG', {
      vpc: this.vpc,
      description: 'Public access for Shared ALB',
      allowAllOutbound: true,
    });
    this.albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
  }
}

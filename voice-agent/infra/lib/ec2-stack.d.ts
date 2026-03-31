import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { AppConfig } from './config';
interface Ec2StackProps extends cdk.StackProps {
    readonly vpc: ec2.IVpc;
    readonly albSecurityGroup: ec2.ISecurityGroup;
    readonly config: AppConfig;
}
export declare class VoiceAgentEc2Stack extends cdk.Stack {
    readonly targetGroup: elbv2.ApplicationTargetGroup;
    constructor(scope: Construct, id: string, props: Ec2StackProps);
}
export {};

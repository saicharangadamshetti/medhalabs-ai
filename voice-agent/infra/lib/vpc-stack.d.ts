import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { AppConfig } from './config';
export declare class VpcStack extends cdk.Stack {
    readonly vpc: ec2.IVpc;
    readonly albSecurityGroup: ec2.ISecurityGroup;
    constructor(scope: Construct, id: string, config: AppConfig, props?: cdk.StackProps);
}

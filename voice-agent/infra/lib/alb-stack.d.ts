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
export declare class SharedAlbStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: AlbStackProps);
}
export {};

#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { VpcStack } from '../lib/vpc-stack';
import { VoiceAgentEc2Stack } from '../lib/ec2-stack';
import { SharedAlbStack } from '../lib/alb-stack';
import { appConfig, DEFAULT_REGION } from '../lib/config';

const app = new cdk.App();

const targetRegion = app.node.tryGetContext('region') || process.env.CDK_DEPLOY_REGION || DEFAULT_REGION;
const config = appConfig[targetRegion];

if (!config) {
  throw new Error(`Region ${targetRegion} is not configured in appConfig.`);
}

// 1. Shared Network (Foundation)
const vpcStack = new VpcStack(app, `${config.projectName}-vpc`, config, {
  env: { account: config.account, region: config.region },
});

// 2. Service-Specific Backend (Owned by the application)
const ec2Stack = new VoiceAgentEc2Stack(app, `${config.projectName}-backend`, {
  vpc: vpcStack.vpc,
  albSecurityGroup: vpcStack.albSecurityGroup,
  config: config,
  env: { account: config.account, region: config.region },
});

// 3. Shared Entry Point (Attaches the service's targets)
new SharedAlbStack(app, `${config.projectName}-alb`, {
  vpc: vpcStack.vpc,
  albSecurityGroup: vpcStack.albSecurityGroup,
  targetGroups: [ec2Stack.targetGroup],
  config: config,
  env: { account: config.account, region: config.region },
});

app.synth();

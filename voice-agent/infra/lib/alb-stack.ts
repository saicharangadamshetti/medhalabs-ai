import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
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

    const { config, vpc, albSecurityGroup, targetGroups } = props;

    // 1. Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'SharedALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSecurityGroup,
    });

    // 2. Custom Domain & SSL Setup
    let listener: elbv2.ApplicationListener;

    if (config.domainName && config.hostedZoneId) {
      const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
        hostedZoneId: config.hostedZoneId,
        zoneName: config.domainName,
      });

      const certificate = new acm.Certificate(this, 'SiteCertificate', {
        domainName: config.domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      // HTTP Listener on Port 80 (Redirects to HTTPS)
      alb.addListener('SharedListener', {
        port: 80,
        open: true,
        defaultAction: elbv2.ListenerAction.redirect({
          protocol: elbv2.ApplicationProtocol.HTTPS,
          port: '443',
          permanent: true,
        }),
      });

      // HTTPS Listener on Port 443 (Forward to Backend)
      listener = alb.addListener('HttpsListener', {
        port: 443,
        certificates: [elbv2.ListenerCertificate.fromArn(certificate.certificateArn)],
        sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
        open: true,
      });

      // Route 53 Alias Record
      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
      });
    } else {
      // Fallback for environment without custom domain
      listener = alb.addListener('SharedListener', {
        port: 80,
        open: true,
      });
    }

    // 3. Register Provided Targets
    if (targetGroups.length > 0) {
      listener.addTargetGroups('ServiceTargets', {
        targetGroups: targetGroups,
      });
    }

    // 4. Outputs
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
    });
  }
}

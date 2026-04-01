"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedAlbStack = void 0;
const cdk = require("aws-cdk-lib");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const targets = require("aws-cdk-lib/aws-route53-targets");
class SharedAlbStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { config, vpc, albSecurityGroup, targetGroups } = props;
        // 1. Application Load Balancer
        const alb = new elbv2.ApplicationLoadBalancer(this, 'SharedALB', {
            vpc,
            internetFacing: true,
            securityGroup: albSecurityGroup,
        });
        // 2. Custom Domain & SSL Setup
        let listener;
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
        }
        else {
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
exports.SharedAlbStack = SharedAlbStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxiLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWxiLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyxnRUFBZ0U7QUFDaEUsMERBQTBEO0FBQzFELG1EQUFtRDtBQUNuRCwyREFBMkQ7QUFXM0QsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFOUQsK0JBQStCO1FBQy9CLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUU7WUFDL0QsR0FBRztZQUNILGNBQWMsRUFBRSxJQUFJO1lBQ3BCLGFBQWEsRUFBRSxnQkFBZ0I7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsK0JBQStCO1FBQy9CLElBQUksUUFBbUMsQ0FBQztRQUV4QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzdDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtnQkFDakYsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZO2dCQUNqQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFVBQVU7YUFDNUIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtnQkFDL0QsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVO2dCQUM3QixVQUFVLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7YUFDMUQsQ0FBQyxDQUFDO1lBRUgsZ0RBQWdEO1lBQ2hELEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2hDLElBQUksRUFBRSxFQUFFO2dCQUNSLElBQUksRUFBRSxJQUFJO2dCQUNWLGFBQWEsRUFBRSxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztvQkFDM0MsUUFBUSxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLO29CQUN6QyxJQUFJLEVBQUUsS0FBSztvQkFDWCxTQUFTLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQzthQUNILENBQUMsQ0FBQztZQUVILGtEQUFrRDtZQUNsRCxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxHQUFHO2dCQUNULFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM3RSxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUMxQyxJQUFJLEVBQUUsSUFBSTthQUNYLENBQUMsQ0FBQztZQUVILHdCQUF3QjtZQUN4QixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDdkMsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE1BQU0sRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM1RSxDQUFDLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNOLGlEQUFpRDtZQUNqRCxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDM0MsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsK0JBQStCO1FBQy9CLElBQUksWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM1QixRQUFRLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFO2dCQUN6QyxZQUFZLEVBQUUsWUFBWTthQUMzQixDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsYUFBYTtRQUNiLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxHQUFHLENBQUMsbUJBQW1CO1NBQy9CLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXZFRCx3Q0F1RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBBcHBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmludGVyZmFjZSBBbGJTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSB2cGM6IGVjMi5JVnBjO1xuICByZWFkb25seSBhbGJTZWN1cml0eUdyb3VwOiBlYzIuSVNlY3VyaXR5R3JvdXA7XG4gIHJlYWRvbmx5IHRhcmdldEdyb3VwczogZWxidjIuSUFwcGxpY2F0aW9uVGFyZ2V0R3JvdXBbXTtcbiAgcmVhZG9ubHkgY29uZmlnOiBBcHBDb25maWc7XG59XG5cbmV4cG9ydCBjbGFzcyBTaGFyZWRBbGJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBBbGJTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCB7IGNvbmZpZywgdnBjLCBhbGJTZWN1cml0eUdyb3VwLCB0YXJnZXRHcm91cHMgfSA9IHByb3BzO1xuXG4gICAgLy8gMS4gQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlclxuICAgIGNvbnN0IGFsYiA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnU2hhcmVkQUxCJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBzZWN1cml0eUdyb3VwOiBhbGJTZWN1cml0eUdyb3VwLFxuICAgIH0pO1xuXG4gICAgLy8gMi4gQ3VzdG9tIERvbWFpbiAmIFNTTCBTZXR1cFxuICAgIGxldCBsaXN0ZW5lcjogZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lcjtcblxuICAgIGlmIChjb25maWcuZG9tYWluTmFtZSAmJiBjb25maWcuaG9zdGVkWm9uZUlkKSB7XG4gICAgICBjb25zdCBob3N0ZWRab25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgaG9zdGVkWm9uZUlkOiBjb25maWcuaG9zdGVkWm9uZUlkLFxuICAgICAgICB6b25lTmFtZTogY29uZmlnLmRvbWFpbk5hbWUsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdTaXRlQ2VydGlmaWNhdGUnLCB7XG4gICAgICAgIGRvbWFpbk5hbWU6IGNvbmZpZy5kb21haW5OYW1lLFxuICAgICAgICB2YWxpZGF0aW9uOiBhY20uQ2VydGlmaWNhdGVWYWxpZGF0aW9uLmZyb21EbnMoaG9zdGVkWm9uZSksXG4gICAgICB9KTtcblxuICAgICAgLy8gSFRUUCBMaXN0ZW5lciBvbiBQb3J0IDgwIChSZWRpcmVjdHMgdG8gSFRUUFMpXG4gICAgICBhbGIuYWRkTGlzdGVuZXIoJ1NoYXJlZExpc3RlbmVyJywge1xuICAgICAgICBwb3J0OiA4MCxcbiAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgZGVmYXVsdEFjdGlvbjogZWxidjIuTGlzdGVuZXJBY3Rpb24ucmVkaXJlY3Qoe1xuICAgICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFBTLFxuICAgICAgICAgIHBvcnQ6ICc0NDMnLFxuICAgICAgICAgIHBlcm1hbmVudDogdHJ1ZSxcbiAgICAgICAgfSksXG4gICAgICB9KTtcblxuICAgICAgLy8gSFRUUFMgTGlzdGVuZXIgb24gUG9ydCA0NDMgKEZvcndhcmQgdG8gQmFja2VuZClcbiAgICAgIGxpc3RlbmVyID0gYWxiLmFkZExpc3RlbmVyKCdIdHRwc0xpc3RlbmVyJywge1xuICAgICAgICBwb3J0OiA0NDMsXG4gICAgICAgIGNlcnRpZmljYXRlczogW2VsYnYyLkxpc3RlbmVyQ2VydGlmaWNhdGUuZnJvbUFybihjZXJ0aWZpY2F0ZS5jZXJ0aWZpY2F0ZUFybildLFxuICAgICAgICBzc2xQb2xpY3k6IGVsYnYyLlNzbFBvbGljeS5SRUNPTU1FTkRFRF9UTFMsXG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICB9KTtcblxuICAgICAgLy8gUm91dGUgNTMgQWxpYXMgUmVjb3JkXG4gICAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgem9uZTogaG9zdGVkWm9uZSxcbiAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHRhcmdldHMuTG9hZEJhbGFuY2VyVGFyZ2V0KGFsYikpLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEZhbGxiYWNrIGZvciBlbnZpcm9ubWVudCB3aXRob3V0IGN1c3RvbSBkb21haW5cbiAgICAgIGxpc3RlbmVyID0gYWxiLmFkZExpc3RlbmVyKCdTaGFyZWRMaXN0ZW5lcicsIHtcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIG9wZW46IHRydWUsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyAzLiBSZWdpc3RlciBQcm92aWRlZCBUYXJnZXRzXG4gICAgaWYgKHRhcmdldEdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICBsaXN0ZW5lci5hZGRUYXJnZXRHcm91cHMoJ1NlcnZpY2VUYXJnZXRzJywge1xuICAgICAgICB0YXJnZXRHcm91cHM6IHRhcmdldEdyb3VwcyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDQuIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQWxiRG5zTmFtZScsIHtcbiAgICAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICB9KTtcbiAgfVxufVxuIl19
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VpcStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
class VpcStack extends cdk.Stack {
    vpc;
    albSecurityGroup;
    constructor(scope, id, config, props) {
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
exports.VpcStack = VpcStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnBjLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidnBjLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFJM0MsTUFBYSxRQUFTLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDckIsR0FBRyxDQUFXO0lBQ2QsZ0JBQWdCLENBQXFCO0lBRXJELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsTUFBaUIsRUFBRSxLQUFzQjtRQUNqRixLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ3hDLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ2pELE1BQU0sRUFBRSxDQUFDO1lBQ1QsbUJBQW1CLEVBQUU7Z0JBQ25CO29CQUNFLFFBQVEsRUFBRSxFQUFFO29CQUNaLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ2xDO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCxtRUFBbUU7UUFDbkUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2pFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLFdBQVcsRUFBRSw4QkFBOEI7WUFDM0MsZ0JBQWdCLEVBQUUsSUFBSTtTQUN2QixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUNuRyxDQUFDO0NBQ0Y7QUEzQkQsNEJBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQXBwQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgVnBjU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBwdWJsaWMgcmVhZG9ubHkgdnBjOiBlYzIuSVZwYztcbiAgcHVibGljIHJlYWRvbmx5IGFsYlNlY3VyaXR5R3JvdXA6IGVjMi5JU2VjdXJpdHlHcm91cDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBjb25maWc6IEFwcENvbmZpZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgdGhpcy52cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnU2hhcmVkVnBjJywge1xuICAgICAgaXBBZGRyZXNzZXM6IGVjMi5JcEFkZHJlc3Nlcy5jaWRyKGNvbmZpZy52cGNDaWRyKSxcbiAgICAgIG1heEF6czogMixcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIGNpZHJNYXNrOiAyNCxcbiAgICAgICAgICBuYW1lOiAnUHVibGljJyxcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gU2hhcmUgdGhlIEFMQiBTZWN1cml0eSBHcm91cCBoZXJlIHRvIGJyZWFrIGNpcmN1bGFyIGRlcGVuZGVuY2llc1xuICAgIHRoaXMuYWxiU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnU2hhcmVkQWxiU0cnLCB7XG4gICAgICB2cGM6IHRoaXMudnBjLFxuICAgICAgZGVzY3JpcHRpb246ICdQdWJsaWMgYWNjZXNzIGZvciBTaGFyZWQgQUxCJyxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG4gICAgdGhpcy5hbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGVjMi5QZWVyLmFueUlwdjQoKSwgZWMyLlBvcnQudGNwKDgwKSwgJ0FsbG93IEhUVFAgdHJhZmZpYycpO1xuICB9XG59XG4iXX0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedAlbStack = void 0;
const cdk = require("aws-cdk-lib");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
class SharedAlbStack extends cdk.Stack {
    constructor(scope, id, props) {
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
exports.SharedAlbStack = SharedAlbStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxiLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWxiLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUVuQyxnRUFBZ0U7QUFXaEUsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFvQjtRQUM1RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwrQkFBK0I7UUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUMvRCxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7WUFDZCxjQUFjLEVBQUUsSUFBSTtZQUNwQixhQUFhLEVBQUUsS0FBSyxDQUFDLGdCQUFnQjtTQUN0QyxDQUFDLENBQUM7UUFFSCxxQkFBcUI7UUFDckIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNqRCxJQUFJLEVBQUUsRUFBRTtZQUNSLElBQUksRUFBRSxJQUFJO1NBQ1gsQ0FBQyxDQUFDO1FBRUgsa0VBQWtFO1FBQ2xFLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDbEMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDekMsWUFBWSxFQUFFLEtBQUssQ0FBQyxZQUFZO2FBQ2pDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxhQUFhO1FBQ2IsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDcEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxtQkFBbUI7U0FDL0IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBN0JELHdDQTZCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBlbGJ2MiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWxhc3RpY2xvYWRiYWxhbmNpbmd2Mic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IEFwcENvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcblxuaW50ZXJmYWNlIEFsYlN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIHJlYWRvbmx5IHZwYzogZWMyLklWcGM7XG4gIHJlYWRvbmx5IGFsYlNlY3VyaXR5R3JvdXA6IGVjMi5JU2VjdXJpdHlHcm91cDtcbiAgcmVhZG9ubHkgdGFyZ2V0R3JvdXBzOiBlbGJ2Mi5JQXBwbGljYXRpb25UYXJnZXRHcm91cFtdO1xuICByZWFkb25seSBjb25maWc6IEFwcENvbmZpZztcbn1cblxuZXhwb3J0IGNsYXNzIFNoYXJlZEFsYlN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFsYlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIDEuIEFwcGxpY2F0aW9uIExvYWQgQmFsYW5jZXJcbiAgICBjb25zdCBhbGIgPSBuZXcgZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXIodGhpcywgJ1NoYXJlZEFMQicsIHtcbiAgICAgIHZwYzogcHJvcHMudnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBzZWN1cml0eUdyb3VwOiBwcm9wcy5hbGJTZWN1cml0eUdyb3VwLFxuICAgIH0pO1xuXG4gICAgLy8gMi4gU2hhcmVkIExpc3RlbmVyXG4gICAgY29uc3QgbGlzdGVuZXIgPSBhbGIuYWRkTGlzdGVuZXIoJ1NoYXJlZExpc3RlbmVyJywge1xuICAgICAgcG9ydDogODAsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgLy8gMy4gUmVnaXN0ZXIgUHJvdmlkZWQgVGFyZ2V0cyAoRGVjb3VwbGVkIGZyb20gc3BlY2lmaWMgc2VydmljZXMpXG4gICAgaWYgKHByb3BzLnRhcmdldEdyb3Vwcy5sZW5ndGggPiAwKSB7XG4gICAgICBsaXN0ZW5lci5hZGRUYXJnZXRHcm91cHMoJ1NlcnZpY2VUYXJnZXRzJywge1xuICAgICAgICB0YXJnZXRHcm91cHM6IHByb3BzLnRhcmdldEdyb3VwcyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIDQuIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQWxiRG5zTmFtZScsIHtcbiAgICAgIHZhbHVlOiBhbGIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICB9KTtcbiAgfVxufVxuIl19
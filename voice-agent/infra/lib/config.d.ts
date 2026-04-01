export interface AppConfig {
    readonly account: string;
    readonly region: string;
    readonly projectName: string;
    readonly instanceType: string;
    readonly vpcCidr: string;
    readonly domainName?: string;
    readonly hostedZoneId?: string;
    readonly allowedOrigins: string[];
}
export declare const appConfig: {
    [key: string]: AppConfig;
};
export declare const DEFAULT_REGION = "ap-south-1";

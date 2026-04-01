"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_REGION = exports.appConfig = void 0;
exports.appConfig = {
    'us-east-1': {
        account: '470362823291',
        region: 'us-east-1',
        projectName: 'medhalabs-voice-backend-us',
        instanceType: 't3.small', // Optimized for Gemini Live Handshake
        vpcCidr: '10.0.0.0/16',
        allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001'
        ],
    },
    'ap-south-1': {
        account: '470362823291',
        region: 'ap-south-1',
        projectName: 'medhalabs-voice-backend-in',
        instanceType: 't3.small',
        vpcCidr: '10.1.0.0/16',
        domainName: 'medha-labs-ai.site',
        hostedZoneId: 'Z00263211JORPM2EM8Q1S',
        allowedOrigins: [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001',
            'https://medha-labs-ai.site',
            'https://medha-labs-ai.com',
            'https://www.medha-labs-ai.com'
        ],
    },
};
exports.DEFAULT_REGION = 'ap-south-1';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVdhLFFBQUEsU0FBUyxHQUFpQztJQUNyRCxXQUFXLEVBQUU7UUFDWCxPQUFPLEVBQUUsY0FBYztRQUN2QixNQUFNLEVBQUUsV0FBVztRQUNuQixXQUFXLEVBQUUsNEJBQTRCO1FBQ3pDLFlBQVksRUFBRSxVQUFVLEVBQUUsc0NBQXNDO1FBQ2hFLE9BQU8sRUFBRSxhQUFhO1FBQ3RCLGNBQWMsRUFBRTtZQUNkLHVCQUF1QjtZQUN2Qix1QkFBdUI7WUFDdkIsdUJBQXVCO1NBQ3hCO0tBQ0Y7SUFDRCxZQUFZLEVBQUU7UUFDWixPQUFPLEVBQUUsY0FBYztRQUN2QixNQUFNLEVBQUUsWUFBWTtRQUNwQixXQUFXLEVBQUUsNEJBQTRCO1FBQ3pDLFlBQVksRUFBRSxVQUFVO1FBQ3hCLE9BQU8sRUFBRSxhQUFhO1FBQ3RCLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsWUFBWSxFQUFFLHVCQUF1QjtRQUNyQyxjQUFjLEVBQUU7WUFDZCx1QkFBdUI7WUFDdkIsdUJBQXVCO1lBQ3ZCLHVCQUF1QjtZQUN2Qiw0QkFBNEI7WUFDNUIsMkJBQTJCO1lBQzNCLCtCQUErQjtTQUNoQztLQUNGO0NBQ0YsQ0FBQztBQUVXLFFBQUEsY0FBYyxHQUFHLFlBQVksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBpbnRlcmZhY2UgQXBwQ29uZmlnIHtcbiAgcmVhZG9ubHkgYWNjb3VudDogc3RyaW5nO1xuICByZWFkb25seSByZWdpb246IHN0cmluZztcbiAgcmVhZG9ubHkgcHJvamVjdE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgaW5zdGFuY2VUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IHZwY0NpZHI6IHN0cmluZztcbiAgcmVhZG9ubHkgZG9tYWluTmFtZT86IHN0cmluZztcbiAgcmVhZG9ubHkgaG9zdGVkWm9uZUlkPzogc3RyaW5nO1xuICByZWFkb25seSBhbGxvd2VkT3JpZ2luczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjb25zdCBhcHBDb25maWc6IHsgW2tleTogc3RyaW5nXTogQXBwQ29uZmlnIH0gPSB7XG4gICd1cy1lYXN0LTEnOiB7XG4gICAgYWNjb3VudDogJzQ3MDM2MjgyMzI5MScsXG4gICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICBwcm9qZWN0TmFtZTogJ21lZGhhbGFicy12b2ljZS1iYWNrZW5kLXVzJyxcbiAgICBpbnN0YW5jZVR5cGU6ICd0My5zbWFsbCcsIC8vIE9wdGltaXplZCBmb3IgR2VtaW5pIExpdmUgSGFuZHNoYWtlXG4gICAgdnBjQ2lkcjogJzEwLjAuMC4wLzE2JyxcbiAgICBhbGxvd2VkT3JpZ2luczogW1xuICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAnaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDEnXG4gICAgXSxcbiAgfSxcbiAgJ2FwLXNvdXRoLTEnOiB7XG4gICAgYWNjb3VudDogJzQ3MDM2MjgyMzI5MScsXG4gICAgcmVnaW9uOiAnYXAtc291dGgtMScsXG4gICAgcHJvamVjdE5hbWU6ICdtZWRoYWxhYnMtdm9pY2UtYmFja2VuZC1pbicsXG4gICAgaW5zdGFuY2VUeXBlOiAndDMuc21hbGwnLFxuICAgIHZwY0NpZHI6ICcxMC4xLjAuMC8xNicsXG4gICAgZG9tYWluTmFtZTogJ21lZGhhLWxhYnMtYWkuc2l0ZScsXG4gICAgaG9zdGVkWm9uZUlkOiAnWjAwMjYzMjExSk9SUE0yRU04UTFTJyxcbiAgICBhbGxvd2VkT3JpZ2luczogW1xuICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAnaHR0cDovL2xvY2FsaG9zdDo1MTczJyxcbiAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuICAgICAgJ2h0dHBzOi8vbWVkaGEtbGFicy1haS5zaXRlJyxcbiAgICAgICdodHRwczovL21lZGhhLWxhYnMtYWkuY29tJyxcbiAgICAgICdodHRwczovL3d3dy5tZWRoYS1sYWJzLWFpLmNvbSdcbiAgICBdLFxuICB9LFxufTtcblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVHSU9OID0gJ2FwLXNvdXRoLTEnO1xuIl19
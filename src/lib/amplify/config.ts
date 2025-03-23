import { Amplify } from 'aws-amplify';

export const config = {
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_API_ENDPOINT,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: 'apiKey' as const, // Using type assertion
      apiKey: import.meta.env.VITE_APPSYNC_API_KEY
    }
  }
};

export const configureAmplify = () => {
  Amplify.configure(config);
};
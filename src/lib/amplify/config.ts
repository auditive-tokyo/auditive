import { Amplify } from 'aws-amplify';

export const config = {
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_API_ENDPOINT,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: 'iam' as const,
    }
  },
  Auth: {
    Cognito: {
      identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
      allowGuestAccess: true,
    }
  }
};

export const configureAmplify = () => {
  Amplify.configure(config);
};
// lib/cognito.ts
export const COGNITO_DOMAIN =
  'https://ap-south-1yqw5uwvvw.auth.ap-south-1.amazoncognito.com';

export const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
export const COGNITO_REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!;
// e.g. https://lurnexa.in/dashboard

export const COGNITO_LOGOUT_REDIRECT = process.env.NEXT_PUBLIC_LOGOUT_REDIRECT!;
// e.g. https://lurnexa.in/login

export const buildLoginUrl = () => {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: COGNITO_REDIRECT_URI,
  });

  return `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
};

export const buildLogoutUrl = () => {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    logout_uri: COGNITO_LOGOUT_REDIRECT,
  });

  return `${COGNITO_DOMAIN}/logout?${params.toString()}`;
};

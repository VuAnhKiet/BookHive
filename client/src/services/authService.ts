import { graphqlApi } from './graphqlApi';

export type AuthResponse = {
  accessToken?: string | null;
  Role?: string | null;
  message: string;
};

export type RegisterCredentials = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const AUTH_FIELDS = `
  accessToken
  Role
  message
`;

export const authApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      AuthResponse,
      { email: string; password: string }
    >({
      query: (loginInput) => ({
        document: `
          mutation Login($loginInput: LoginInput!) {
            login(loginInput: $loginInput) { ${AUTH_FIELDS} }
          }
        `,
        variables: { loginInput },
      }),
      transformResponse: (response: { login: AuthResponse }) => response.login,
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (registerInput) => ({
        document: `
          mutation Register($registerInput: RegisterInput!) {
            register(registerInput: $registerInput) { ${AUTH_FIELDS} }
          }
        `,
        variables: { registerInput },
      }),
      transformResponse: (response: { register: AuthResponse }) =>
        response.register,
    }),
    sendPasswordResetEmail: builder.mutation<AuthResponse, string>({
      query: (email) => ({
        document: `
          mutation SendMail($email: String!) {
            sendMail(email: $email) { message }
          }
        `,
        variables: { email },
      }),
      transformResponse: (response: { sendMail: AuthResponse }) =>
        response.sendMail,
    }),
    resetPassword: builder.mutation<
      AuthResponse,
      { token: string; newPassword: string; confirmPassword: string }
    >({
      query: (resetPasswordInput) => ({
        document: `
          mutation ResetPassword($resetPasswordInput: ResetPasswordInput!) {
            resetPassword(resetPasswordInput: $resetPasswordInput) {
              ${AUTH_FIELDS}
            }
          }
        `,
        variables: { resetPasswordInput },
      }),
      transformResponse: (response: { resetPassword: AuthResponse }) =>
        response.resetPassword,
    }),
    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        document: `
          mutation RefreshToken {
            refreshToken { ${AUTH_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { refreshToken: AuthResponse }) =>
        response.refreshToken,
    }),
    logout: builder.mutation<AuthResponse, void>({
      query: () => ({
        document: `
          mutation Logout {
            logout { ${AUTH_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { logout: AuthResponse }) => response.logout,
      invalidatesTags: ['Profile', 'Rental', 'Payment', 'Notification'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendPasswordResetEmailMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;

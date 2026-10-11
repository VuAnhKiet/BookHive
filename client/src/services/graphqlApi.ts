import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { clearCredentials, setCredentials } from '../store/authSlice';

type GraphQLRequest = {
  document: string;
  variables?: Record<string, unknown>;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type GraphQLError = {
  message: string;
};

type StateWithAuth = {
  auth?: {
    accessToken?: string | null;
  };
};

const graphqlBaseQueryWithoutRefresh: BaseQueryFn<GraphQLRequest, unknown, GraphQLError> = async (
  { document, variables },
  { getState },
) => {
  try {
    const token = (getState() as StateWithAuth).auth?.accessToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/graphql', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ query: document, variables }),
    });
    if (!response.ok) {
      return { error: { message: `Backend returned HTTP ${response.status}` } };
    }

    const result = (await response.json()) as GraphQLResponse<unknown>;
    if (result.errors?.length) {
      return { error: { message: result.errors.map(({ message }) => message).join('; ') } };
    }
    if (!result.data) {
      return { error: { message: 'Backend returned no data' } };
    }

    return { data: result.data };
  } catch (requestError: unknown) {
    return {
      error: {
        message:
          requestError instanceof Error
            ? requestError.message
            : 'Could not communicate with the backend.',
      },
    };
  }
};

const graphqlBaseQuery: BaseQueryFn<GraphQLRequest, unknown, GraphQLError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await graphqlBaseQueryWithoutRefresh(args, api, extraOptions);
  if (
    !('error' in result) ||
    !result.error ||
    !result.error.message.toLowerCase().includes('access token expired or invalid')
  ) {
    return result;
  }

  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        query: `
          mutation RefreshToken {
            refreshToken { accessToken Role message }
          }
        `,
      }),
    });

    if (!response.ok) {
      api.dispatch(clearCredentials());
      return { error: { message: `Token refresh failed with HTTP ${response.status}.` } };
    }

    const refreshResult = (await response.json()) as GraphQLResponse<{
      refreshToken?: { accessToken?: string | null; Role?: string | null };
    }>;
    const refreshedToken = refreshResult.data?.refreshToken?.accessToken;
    if (refreshResult.errors?.length || !refreshedToken) {
      api.dispatch(clearCredentials());
      return {
        error: {
          message: refreshResult.errors?.map(({ message }) => message).join('; ') ||
            'Token refresh returned no access token.',
        },
      };
    }

    api.dispatch(setCredentials({
      accessToken: refreshedToken,
      role: refreshResult.data?.refreshToken?.Role ?? null,
    }));
    return graphqlBaseQueryWithoutRefresh(args, api, extraOptions);
  } catch (requestError: unknown) {
    api.dispatch(clearCredentials());
    return {
      error: {
        message: requestError instanceof Error
          ? requestError.message
          : 'Could not communicate with the backend while refreshing your session.',
      },
    };
  }
};

export const graphqlApi = createApi({
  reducerPath: 'api',
  baseQuery: graphqlBaseQuery,
  tagTypes: [
    'Book',
    'Profile',
    'Rental',
    'Payment',
    'Notification',
    'Wishlist',
    'Cart',
    'VolunteerRoutes',
    'VolunteerAssignments',
    'AdminDashboard',
  ],
  endpoints: () => ({}),
});

import { Book, Hub } from '../types/book';
import { graphqlApi } from './graphqlApi';

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone_number?: string | null;
  profile_image?: string | null;
  wallet_balance: number;
  stores: Hub[];
  books: Book[];
};

const PROFILE_FIELDS = `
  id
  fullName
  email
  role
  phone_number
  profile_image
  wallet_balance
  stores { id name location }
  books {
    id title author genre description cover_image copies status
    rental_price_per_day
    store { id name location }
  }
`;

export const profileApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserProfile, void>({
      query: () => ({
        document: `
          query UserProfile {
            me { ${PROFILE_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { me: UserProfile }) => response.me,
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<
      UserProfile,
      { fullName?: string; email?: string; phone_number?: string }
    >({
      query: (updateProfileInput) => ({
        document: `
          mutation UpdateProfile($updateProfileInput: UpdateProfileInput!) {
            updateProfile(updateProfileInput: $updateProfileInput) {
              ${PROFILE_FIELDS}
            }
          }
        `,
        variables: { updateProfileInput },
      }),
      transformResponse: (response: { updateProfile: UserProfile }) =>
        response.updateProfile,
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetUserProfileQuery, useUpdateProfileMutation } = profileApi;

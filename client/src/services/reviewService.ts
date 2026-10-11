import { Review } from '../types/book';
import { graphqlApi } from './graphqlApi';

export const reviewApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserReviews: builder.query<Review[], void>({
      query: () => ({
        document: `
          query UserReviews {
            myReviews {
              id rating comment created_at
              renter { fullName }
              book { id title author cover_image }
            }
          }
        `,
      }),
      transformResponse: (response: { myReviews: Review[] }) =>
        response.myReviews,
    }),
  }),
});

export const { useGetUserReviewsQuery } = reviewApi;

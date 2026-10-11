import { Book } from '../types/book';
import { graphqlApi } from './graphqlApi';

export type WishlistEntry = {
  id: string;
  book_id: string;
  book: Pick<Book, 'id' | 'title' | 'author' | 'cover_image' | 'status' | 'copies'>;
};

export const wishlistApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistEntry[], void>({
      query: () => ({
        document: `
          query MyWishlist {
            myWishlist {
              id
              book_id
              book { id title author cover_image status copies }
            }
          }
        `,
      }),
      transformResponse: (response: { myWishlist: WishlistEntry[] }) =>
        response.myWishlist,
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<WishlistEntry, string>({
      query: (bookId) => ({
        document: `
          mutation AddToWishlist($bookId: String!) {
            addToWishlist(bookId: $bookId) {
              id
              book_id
              book { id title author cover_image status copies }
            }
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { addToWishlist: WishlistEntry }) =>
        response.addToWishlist,
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<boolean, string>({
      query: (bookId) => ({
        document: `
          mutation RemoveFromWishlist($bookId: String!) {
            removeFromWishlist(bookId: $bookId)
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { removeFromWishlist: boolean }) =>
        response.removeFromWishlist,
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;

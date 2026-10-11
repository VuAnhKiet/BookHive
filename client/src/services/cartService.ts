import { Book } from '../types/book';
import { graphqlApi } from './graphqlApi';

export type CartItem = {
  id: string;
  book_id: string;
  quantity: number;
  book: Pick<
    Book,
    'id' | 'title' | 'author' | 'cover_image' | 'status' | 'copies' | 'rental_price_per_day'
  >;
};

const CART_ITEM_FIELDS = `
  id
  book_id
  quantity
  book { id title author cover_image status copies rental_price_per_day }
`;

export const cartApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartItem[], void>({
      query: () => ({
        document: `
          query MyCart {
            myCart { ${CART_ITEM_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { myCart: CartItem[] }) => response.myCart,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<CartItem, string>({
      query: (bookId) => ({
        document: `
          mutation AddToCart($bookId: String!) {
            addToCart(bookId: $bookId) { ${CART_ITEM_FIELDS} }
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { addToCart: CartItem }) => response.addToCart,
      invalidatesTags: ['Cart'],
    }),
    updateCartQuantity: builder.mutation<
      CartItem,
      { bookId: string; quantity: number }
    >({
      query: ({ bookId, quantity }) => ({
        document: `
          mutation UpdateCartQuantity($bookId: String!, $quantity: Float!) {
            updateCartQuantity(bookId: $bookId, quantity: $quantity) {
              ${CART_ITEM_FIELDS}
            }
          }
        `,
        variables: { bookId, quantity },
      }),
      transformResponse: (response: { updateCartQuantity: CartItem }) =>
        response.updateCartQuantity,
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<boolean, string>({
      query: (bookId) => ({
        document: `
          mutation RemoveFromCart($bookId: String!) {
            removeFromCart(bookId: $bookId)
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { removeFromCart: boolean }) =>
        response.removeFromCart,
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
} = cartApi;

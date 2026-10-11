import { Book, Hub } from '../types/book';
import { graphqlApi } from './graphqlApi';

export const storeApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getStores: builder.query<Hub[], void>({
      query: () => ({
        document: `
          query Stores {
            stores { id name location }
          }
        `,
      }),
      transformResponse: (response: { stores: Hub[] }) => response.stores,
    }),
    getStoreInventory: builder.query<Book[], string>({
      query: (storeId) => ({
        document: `
          query StoreInventory($storeId: String!) {
            getInventory(storeId: $storeId) {
              id title author genre description cover_image copies status
              rental_price_per_day
              store { id name location }
            }
          }
        `,
        variables: { storeId },
      }),
      transformResponse: (response: { getInventory: Book[] }) =>
        response.getInventory,
      providesTags: (books) => [
        { type: 'Book', id: 'LIST' },
        ...(books ?? []).map(({ id }) => ({ type: 'Book' as const, id })),
      ],
    }),
    addBookToStore: builder.mutation<Book, { storeId: string; bookId: string }>({
      query: ({ storeId, bookId }) => ({
        document: `
          mutation AddBookToStore($storeId: String!, $bookId: String!) {
            addBook(storeId: $storeId, bookId: $bookId) {
              id title author genre description cover_image copies status
              rental_price_per_day
              store { id name location }
            }
          }
        `,
        variables: { storeId, bookId },
      }),
      transformResponse: (response: { addBook: Book }) => response.addBook,
      invalidatesTags: [{ type: 'Book', id: 'LIST' }, 'Profile'],
    }),
    approveBookHandover: builder.mutation<Book, { storeId: string; bookId: string }>({
      query: ({ storeId, bookId }) => ({
        document: `
          mutation ApproveBookHandover($storeId: String!, $bookId: String!) {
            approveBookHandover(storeId: $storeId, bookId: $bookId) {
              id title author genre description cover_image copies status
              rental_price_per_day
              store { id name location }
            }
          }
        `,
        variables: { storeId, bookId },
      }),
      transformResponse: (response: { approveBookHandover: Book }) =>
        response.approveBookHandover,
      invalidatesTags: [
        { type: 'Book', id: 'LIST' },
        { type: 'Book', id: 'ADMIN_LIST' },
        'Profile',
      ],
    }),
  }),
});

export const {
  useGetStoresQuery,
  useGetStoreInventoryQuery,
  useAddBookToStoreMutation,
  useApproveBookHandoverMutation,
} = storeApi;

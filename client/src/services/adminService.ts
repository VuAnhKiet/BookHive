import { Book } from '../types/book';
import { graphqlApi } from './graphqlApi';

export type AdminDashboardStats = {
  users: number;
  books: number;
  pendingBooks: number;
  pendingTransfers: number;
  openDisputes: number;
};

type AdminBook = Pick<Book, 'id' | 'title' | 'author' | 'genre' | 'status'> & {
  created_at: string;
  owner?: { fullName: string; email: string } | null;
  store: { name: string } | null;
};

type AdminBookDecision = Pick<Book, 'id' | 'title' | 'author' | 'genre' | 'status'>;

export const adminApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardStats, void>({
      query: () => ({
        document: `
          query AdminDashboard {
            getDashboard {
              users
              books
              pendingBooks
              pendingTransfers
              openDisputes
            }
          }
        `,
      }),
      transformResponse: (response: { getDashboard: AdminDashboardStats }) =>
        response.getDashboard,
      providesTags: ['AdminDashboard'],
    }),
    getManagedBooks: builder.query<AdminBook[], void>({
      query: () => ({
        document: `
          query ManagedBooks {
            manageBooks {
              id
              title
              author
              genre
              status
              created_at
              owner { fullName email }
              store { name }
            }
          }
        `,
      }),
      transformResponse: (response: { manageBooks: AdminBook[] }) =>
        response.manageBooks,
      providesTags: [{ type: 'Book', id: 'ADMIN_LIST' }],
    }),
    approveBook: builder.mutation<AdminBookDecision, string>({
      query: (bookId) => ({
        document: `
          mutation ApproveBook($bookId: String!) {
            approveBook(bookId: $bookId) {
              id title author genre status
            }
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { approveBook: AdminBookDecision }) =>
        response.approveBook,
      invalidatesTags: ['AdminDashboard', { type: 'Book', id: 'ADMIN_LIST' }, { type: 'Book', id: 'LIST' }],
    }),
    rejectBook: builder.mutation<AdminBookDecision, string>({
      query: (bookId) => ({
        document: `
          mutation RejectBook($bookId: String!) {
            rejectBook(bookId: $bookId) {
              id title author genre status
            }
          }
        `,
        variables: { bookId },
      }),
      transformResponse: (response: { rejectBook: AdminBookDecision }) =>
        response.rejectBook,
      invalidatesTags: ['AdminDashboard', { type: 'Book', id: 'ADMIN_LIST' }],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetManagedBooksQuery,
  useApproveBookMutation,
  useRejectBookMutation,
} = adminApi;

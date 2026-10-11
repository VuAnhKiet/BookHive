import { Book, Hub } from '../types/book';
import { graphqlApi } from './graphqlApi';

export type Rental = {
  id: string;
  rental_start_date: string;
  rental_due_date: string;
  return_date?: string | null;
  status: string;
  total_amount: number;
  payment_status: string;
  renter?: { fullName: string } | null;
  book: Pick<Book, 'id' | 'title' | 'author' | 'cover_image'>;
  store?: Hub | null;
};

type RentalActionResult = {
  id: string;
  status: string;
  payment_status: string;
};

const RENTAL_FIELDS = `
  id
  rental_start_date
  rental_due_date
  return_date
  status
  total_amount
  payment_status
  book { id title author cover_image }
  renter { fullName }
  store { id name location }
`;

export const rentalApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserRentals: builder.query<Rental[], void>({
      query: () => ({
        document: `
          query UserRentals {
            getUserRentals { ${RENTAL_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { getUserRentals: Rental[] }) =>
        response.getUserRentals,
      providesTags: ['Rental'],
    }),
    getStoreRentalRequests: builder.query<Rental[], void>({
      query: () => ({
        document: `
          query StoreRentalRequests {
            getStoreRentalRequests { ${RENTAL_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { getStoreRentalRequests: Rental[] }) =>
        response.getStoreRentalRequests,
      providesTags: ['Rental'],
    }),
    approveRentalRequest: builder.mutation<RentalActionResult, string>({
      query: (rentalId) => ({
        document: `
          mutation ApproveRentalRequest($rentalId: String!) {
            approveRequest(rentalId: $rentalId) { id status payment_status }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { approveRequest: RentalActionResult }) =>
        response.approveRequest,
      invalidatesTags: ['Rental'],
    }),
    rejectRentalRequest: builder.mutation<RentalActionResult, string>({
      query: (rentalId) => ({
        document: `
          mutation RejectRentalRequest($rentalId: String!) {
            rejectRequest(rentalId: $rentalId) { id status payment_status }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { rejectRequest: RentalActionResult }) =>
        response.rejectRequest,
      invalidatesTags: ['Rental'],
    }),
    createRentalRequest: builder.mutation<
      RentalActionResult,
      {
        bookId: string;
        rentalStartDate: string;
        rentalDueDate: string;
        timezoneOffsetMinutes: number;
      }
    >({
      query: (variables) => ({
        document: `
          mutation CreateRentalRequest(
            $bookId: String!
            $rentalStartDate: String!
            $rentalDueDate: String!
            $timezoneOffsetMinutes: Int!
          ) {
            createRequest(
              bookId: $bookId
              rentalStartDate: $rentalStartDate
              rentalDueDate: $rentalDueDate
              timezoneOffsetMinutes: $timezoneOffsetMinutes
            ) { id status payment_status }
          }
        `,
        variables,
      }),
      transformResponse: (response: { createRequest: RentalActionResult }) =>
        response.createRequest,
      invalidatesTags: ['Rental', { type: 'Book', id: 'LIST' }],
    }),
    cancelRentalRequest: builder.mutation<RentalActionResult, string>({
      query: (rentalId) => ({
        document: `
          mutation CancelRentalRequest($rentalId: String!) {
            cancelRequest(rentalId: $rentalId) { id status payment_status }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { cancelRequest: RentalActionResult }) =>
        response.cancelRequest,
      invalidatesTags: ['Rental'],
    }),
    returnBook: builder.mutation<RentalActionResult, string>({
      query: (rentalId) => ({
        document: `
          mutation ReturnBook($rentalId: String!) {
            returnBook(rentalId: $rentalId) { id status payment_status }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { returnBook: RentalActionResult }) =>
        response.returnBook,
      invalidatesTags: ['Rental', 'Book'],
    }),
    checkoutRental: builder.mutation<RentalActionResult, string>({
      query: (rentalId) => ({
        document: `
          mutation CheckoutRental($rentalId: String!) {
            checkout(rentalId: $rentalId) { id status payment_status }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { checkout: RentalActionResult }) =>
        response.checkout,
      invalidatesTags: ['Rental', 'Book'],
    }),
  }),
});

export const {
  useGetUserRentalsQuery,
  useGetStoreRentalRequestsQuery,
  useApproveRentalRequestMutation,
  useRejectRentalRequestMutation,
  useCreateRentalRequestMutation,
  useCancelRentalRequestMutation,
  useReturnBookMutation,
  useCheckoutRentalMutation,
} = rentalApi;

import { graphqlApi } from './graphqlApi';

export type PaymentRecord = {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  transaction_date: string;
  rental_id: string;
};

export type MomoPaymentCheckout = {
  payUrl: string;
  payment: PaymentRecord;
};

const PAYMENT_FIELDS = `
  id
  rental_id
  amount
  status
  payment_method
  transaction_date
`;

export const paymentApi = graphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserPayments: builder.query<PaymentRecord[], void>({
      query: () => ({
        document: `
          query UserPayments {
            getUserPayments { ${PAYMENT_FIELDS} }
          }
        `,
      }),
      transformResponse: (response: { getUserPayments: PaymentRecord[] }) =>
        response.getUserPayments,
      providesTags: ['Payment'],
    }),
    createPayment: builder.mutation<
      PaymentRecord,
      { rentalId: string; paymentMethod: string }
    >({
      query: (variables) => ({
        document: `
          mutation CreatePayment($rentalId: String!, $paymentMethod: PaymentMethod!) {
            createPayment(rentalId: $rentalId, paymentMethod: $paymentMethod) {
              ${PAYMENT_FIELDS}
            }
          }
        `,
        variables,
      }),
      transformResponse: (response: { createPayment: PaymentRecord }) =>
        response.createPayment,
      invalidatesTags: ['Payment', 'Rental'],
    }),
    startMomoPayment: builder.mutation<MomoPaymentCheckout, string>({
      query: (rentalId) => ({
        document: `
          mutation StartMomoPayment($rentalId: String!) {
            startMomoPayment(rentalId: $rentalId) {
              payUrl
              payment { ${PAYMENT_FIELDS} }
            }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { startMomoPayment: MomoPaymentCheckout }) =>
        response.startMomoPayment,
      invalidatesTags: ['Payment', 'Rental'],
    }),
    processPayment: builder.mutation<PaymentRecord, string>({
      query: (paymentId) => ({
        document: `
          mutation ProcessPayment($paymentId: String!) {
            processPayment(paymentId: $paymentId) { ${PAYMENT_FIELDS} }
          }
        `,
        variables: { paymentId },
      }),
      transformResponse: (response: { processPayment: PaymentRecord }) =>
        response.processPayment,
      invalidatesTags: ['Payment', 'Rental', 'Profile', 'Notification'],
    }),
    payRentalWithWallet: builder.mutation<PaymentRecord, string>({
      query: (rentalId) => ({
        document: `
          mutation PayRentalWithWallet($rentalId: String!) {
            payRentalWithWallet(rentalId: $rentalId) { ${PAYMENT_FIELDS} }
          }
        `,
        variables: { rentalId },
      }),
      transformResponse: (response: { payRentalWithWallet: PaymentRecord }) =>
        response.payRentalWithWallet,
      invalidatesTags: ['Payment', 'Rental', 'Profile', 'Notification'],
    }),
  }),
});

export const {
  useGetUserPaymentsQuery,
  useCreatePaymentMutation,
  useStartMomoPaymentMutation,
  useProcessPaymentMutation,
  usePayRentalWithWalletMutation,
} = paymentApi;

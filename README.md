# BookHive

## MoMo sandbox payments

The payment API supports MoMo's one-time `captureWallet` checkout. Configure these
variables in the server environment with the sandbox credentials from MoMo:

```env
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
MOMO_REDIRECT_URL=http://localhost:3001/payment-result
MOMO_IPN_URL=https://your-public-server/payments/momo/ipn
# Optional; defaults to MoMo's sandbox create endpoint.
MOMO_API_URL=https://test-payment.momo.vn/v2/gateway/api/create
```

`MOMO_IPN_URL` must be reachable by MoMo over HTTPS. The authenticated GraphQL
mutation `startMomoPayment(rentalId: String!)` returns the checkout `payUrl`;
redirect the customer to that URL. Payment completion is determined by the
signed IPN, not by the browser redirect. The rental amount must be a positive
whole number of VND. Apply the payment-method database migration before starting
checkout:

```sh
npm run migration:run
```
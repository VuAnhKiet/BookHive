import { registerEnumType } from "@nestjs/graphql";

export enum PaymentMethod {
  CARD = 'card',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
}

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});
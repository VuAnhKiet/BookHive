import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMomoPaymentMethod1791530700000 implements MigrationInterface {
  name = 'AddMomoPaymentMethod1791530700000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."payments_payment_method_enum" ADD VALUE IF NOT EXISTS 'momo'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const [paymentRows] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "payments" WHERE "payment_method" = 'momo'`,
    );
    if (paymentRows.count > 0) {
      throw new Error(
        'Cannot remove the MoMo payment method while payment records use it',
      );
    }

    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "payment_method" TYPE varchar USING "payment_method"::text`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_method_enum_old" AS ENUM ('card', 'wallet', 'bank_transfer')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "payment_method" TYPE "public"."payments_payment_method_enum_old" USING "payment_method"::"public"."payments_payment_method_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payments_payment_method_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payments_payment_method_enum_old" RENAME TO "payments_payment_method_enum"`,
    );
  }
}

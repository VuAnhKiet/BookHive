import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefundedPaymentStatus1791530500000
  implements MigrationInterface
{
  name = 'AddRefundedPaymentStatus1791530500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum" ADD VALUE IF NOT EXISTS 'refunded'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_payment_status_enum" ADD VALUE IF NOT EXISTS 'refunded'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [paymentRows] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "payments" WHERE "status" = 'refunded'`,
    );
    const [rentalRows] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "rentals" WHERE "payment_status" = 'refunded'`,
    );
    if (paymentRows.count > 0 || rentalRows.count > 0) {
      throw new Error(
        'Cannot remove the refunded status while payment or rental records use it',
      );
    }

    await queryRunner.query(
      `ALTER TABLE "rentals" ALTER COLUMN "payment_status" TYPE text USING "payment_status"::text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_payment_status_enum" RENAME TO "rentals_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rentals_payment_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rentals" ALTER COLUMN "payment_status" TYPE "public"."rentals_payment_status_enum" USING "payment_status"::"public"."rentals_payment_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."rentals_payment_status_enum_old"`,
    );

    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE text USING "status"::text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payments_status_enum" RENAME TO "payments_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'completed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "status" TYPE "public"."payments_status_enum" USING "status"::"public"."payments_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum_old"`);
  }
}

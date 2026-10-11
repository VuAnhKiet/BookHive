import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRentalRequestStatuses1791530200000
  implements MigrationInterface
{
  name = 'AddRentalRequestStatuses1791530200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_status_enum" ADD VALUE IF NOT EXISTS 'pending'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_status_enum" ADD VALUE IF NOT EXISTS 'approved'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_status_enum" ADD VALUE IF NOT EXISTS 'rejected'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."rentals_status_enum" ADD VALUE IF NOT EXISTS 'cancelled'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ count }] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "rentals" WHERE "status" IN ('pending', 'approved', 'rejected', 'cancelled')`,
    );
    if (count > 0) {
      throw new Error(
        'Cannot remove rental request statuses while rental records use them',
      );
    }

    await queryRunner.query(
      `ALTER TYPE "public"."rentals_status_enum" RENAME TO "rentals_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rentals_status_enum" AS ENUM('active', 'returned', 'overdue', 'lost')`,
    );
    await queryRunner.query(
      `ALTER TABLE "rentals" ALTER COLUMN "status" TYPE "public"."rentals_status_enum" USING "status"::text::"public"."rentals_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."rentals_status_enum_old"`);
  }
}

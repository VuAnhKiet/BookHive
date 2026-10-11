import { MigrationInterface, QueryRunner } from "typeorm";

export class AdjustUserTable1778855217494 implements MigrationInterface {
    name = 'AdjustUserTable1778855217494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "country_id" uuid NOT NULL, "city_id" uuid NOT NULL, "district_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7f56a9682a95acc6d238f429350" UNIQUE ("name"), CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordExpires" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TYPE "public"."rentals_payment_status_enum" RENAME TO "rentals_payment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."rentals_payment_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "rentals" ALTER COLUMN "payment_status" TYPE "public"."rentals_payment_status_enum" USING "payment_status"::"text"::"public"."rentals_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."rentals_payment_status_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."books_status_enum" RENAME TO "books_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."books_status_enum" AS ENUM('available', 'rented', 'pending_approval', 'transferring', 'rejected', 'lost', 'damaged')`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" TYPE "public"."books_status_enum" USING "status"::"text"::"public"."books_status_enum"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" SET DEFAULT 'pending_approval'`);
        await queryRunner.query(`DROP TYPE "public"."books_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" SET DEFAULT 'pending_approval'`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'store_manager', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_98e1ca336038167c7eb48c02582" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_baebeb388634106e4cbb46192b9" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_444b34460fc67bd002be612d53f" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_444b34460fc67bd002be612d53f"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_baebeb388634106e4cbb46192b9"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_98e1ca336038167c7eb48c02582"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('renter', 'lender', 'store_manager', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."books_status_enum_old" AS ENUM('available', 'rented', 'pending_approval', 'rejected', 'lost')`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "books" ALTER COLUMN "status" TYPE "public"."books_status_enum_old" USING "status"::"text"::"public"."books_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."books_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."books_status_enum_old" RENAME TO "books_status_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."rentals_payment_status_enum_old" AS ENUM('pending', 'paid', 'failed')`);
        await queryRunner.query(`ALTER TABLE "rentals" ALTER COLUMN "payment_status" TYPE "public"."rentals_payment_status_enum_old" USING "payment_status"::"text"::"public"."rentals_payment_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."rentals_payment_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."rentals_payment_status_enum_old" RENAME TO "rentals_payment_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
    }

}

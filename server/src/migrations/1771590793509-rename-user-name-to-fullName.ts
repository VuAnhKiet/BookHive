import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserNameToFullName1771590793509 implements MigrationInterface {
    name = 'RenameUserNameToFullName1771590793509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "rentals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cart" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "books" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "wishlist" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "fullName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "withdrawals" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "districts" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "cities" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "late_fees" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "late_fees" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "districts" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "withdrawals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "fullName"`);
        await queryRunner.query(`ALTER TABLE "wishlist" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "cart" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "rentals" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying NOT NULL`);
    }

}

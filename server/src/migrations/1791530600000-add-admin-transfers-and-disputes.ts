import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminTransfersAndDisputes1791530600000
  implements MigrationInterface
{
  name = 'AddAdminTransfersAndDisputes1791530600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."book_transfers_status_enum" AS ENUM('pending', 'approved', 'in_transit', 'completed', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disputes_status_enum" AS ENUM('open', 'resolved', 'rejected')`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "book_id" uuid NOT NULL, "source_store_id" uuid NOT NULL, "destination_store_id" uuid NOT NULL, "requested_by" uuid NOT NULL, "status" "public"."book_transfers_status_enum" NOT NULL, "decision_note" text, "decided_by" uuid, "decided_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_book_transfers_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_book_transfer_distinct_stores" CHECK ("source_store_id" <> "destination_store_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "disputes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reported_by" uuid NOT NULL, "rental_id" uuid, "delivery_id" uuid, "reason" text NOT NULL, "status" "public"."disputes_status_enum" NOT NULL DEFAULT 'open', "resolution" text, "handled_by" uuid, "handled_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_disputes_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_dispute_single_subject" CHECK ((("rental_id" IS NOT NULL)::integer + ("delivery_id" IS NOT NULL)::integer) = 1))`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" ADD CONSTRAINT "FK_book_transfers_book" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" ADD CONSTRAINT "FK_book_transfers_source_store" FOREIGN KEY ("source_store_id") REFERENCES "stores"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" ADD CONSTRAINT "FK_book_transfers_destination_store" FOREIGN KEY ("destination_store_id") REFERENCES "stores"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" ADD CONSTRAINT "FK_book_transfers_requester" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" ADD CONSTRAINT "FK_book_transfers_decider" FOREIGN KEY ("decided_by") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_transfer" FOREIGN KEY ("transfer_id") REFERENCES "book_transfers"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_reporter" FOREIGN KEY ("reported_by") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_rental" FOREIGN KEY ("rental_id") REFERENCES "rentals"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_disputes_handler" FOREIGN KEY ("handled_by") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_disputes_handler"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_transfer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_disputes_delivery"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_disputes_rental"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_disputes_reporter"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" DROP CONSTRAINT "FK_book_transfers_decider"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" DROP CONSTRAINT "FK_book_transfers_requester"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" DROP CONSTRAINT "FK_book_transfers_destination_store"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" DROP CONSTRAINT "FK_book_transfers_source_store"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transfers" DROP CONSTRAINT "FK_book_transfers_book"`,
    );
    await queryRunner.query(`DROP TABLE "disputes"`);
    await queryRunner.query(`DROP TABLE "book_transfers"`);
    await queryRunner.query(`DROP TYPE "public"."disputes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."book_transfers_status_enum"`);
  }
}

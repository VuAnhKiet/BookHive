import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryWorkflow1791530400000
  implements MigrationInterface
{
  name = 'AddDeliveryWorkflow1791530400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" ADD VALUE IF NOT EXISTS 'delivery_update'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'volunteer'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."deliveries_status_enum" AS ENUM('requested', 'assigned', 'accepted', 'rejected', 'handed_over', 'in_transit', 'at_relay', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_routes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "volunteer_id" uuid NOT NULL, "origin_location" character varying NOT NULL, "destination_location" character varying NOT NULL, "travel_date" date NOT NULL, "capacity" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_delivery_routes_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_delivery_route_capacity" CHECK ("capacity" > 0))`,
    );
    await queryRunner.query(
      `CREATE TABLE "deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "book_id" uuid NOT NULL, "rental_id" uuid, "transfer_id" uuid, "requester_id" uuid NOT NULL, "store_id" uuid NOT NULL, "destination_store_id" uuid NOT NULL, "pickup_location" character varying NOT NULL, "delivery_location" character varying NOT NULL, "status" "public"."deliveries_status_enum" NOT NULL DEFAULT 'requested', "route_id" uuid, "volunteer_id" uuid, "handover_at" TIMESTAMP, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_deliveries_rental_id" UNIQUE ("rental_id"), CONSTRAINT "UQ_deliveries_transfer_id" UNIQUE ("transfer_id"), CONSTRAINT "PK_deliveries_id" PRIMARY KEY ("id"), CONSTRAINT "CHK_delivery_single_subject" CHECK ((("rental_id" IS NOT NULL)::integer + ("transfer_id" IS NOT NULL)::integer) = 1))`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_relays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "route_id" uuid NOT NULL, "location" character varying NOT NULL, "sequence" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_delivery_relays_route_sequence" UNIQUE ("route_id", "sequence"), CONSTRAINT "PK_delivery_relays_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_tracking" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "delivery_id" uuid NOT NULL, "status" "public"."deliveries_status_enum" NOT NULL, "location" character varying, "note" text, "updated_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_delivery_tracking_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "delivery_legs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "delivery_id" uuid NOT NULL, "route_id" uuid NOT NULL, "volunteer_id" uuid NOT NULL, "sequence" integer NOT NULL, "status" "public"."deliveries_status_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_delivery_legs_delivery_sequence" UNIQUE ("delivery_id", "sequence"), CONSTRAINT "PK_delivery_legs_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_routes" ADD CONSTRAINT "FK_delivery_routes_volunteer" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_rental" FOREIGN KEY ("rental_id") REFERENCES "rentals"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_book" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_store" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_destination_store" FOREIGN KEY ("destination_store_id") REFERENCES "stores"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_route" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" ADD CONSTRAINT "FK_deliveries_volunteer" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_relays" ADD CONSTRAINT "FK_delivery_relays_route" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_tracking" ADD CONSTRAINT "FK_delivery_tracking_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_tracking" ADD CONSTRAINT "FK_delivery_tracking_user" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" ADD CONSTRAINT "FK_delivery_legs_delivery" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" ADD CONSTRAINT "FK_delivery_legs_route" FOREIGN KEY ("route_id") REFERENCES "delivery_routes"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" ADD CONSTRAINT "FK_delivery_legs_volunteer" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [deliveryNotifications] = await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "notifications" WHERE "type" = 'delivery_update'`,
    );
    if (deliveryNotifications.count > 0) {
      throw new Error(
        'Cannot remove delivery notification type while notifications use it',
      );
    }

    await queryRunner.query(
      `ALTER TABLE "delivery_tracking" DROP CONSTRAINT "FK_delivery_tracking_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" DROP CONSTRAINT "FK_delivery_legs_volunteer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" DROP CONSTRAINT "FK_delivery_legs_route"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_legs" DROP CONSTRAINT "FK_delivery_legs_delivery"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_tracking" DROP CONSTRAINT "FK_delivery_tracking_delivery"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_relays" DROP CONSTRAINT "FK_delivery_relays_route"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_volunteer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_route"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_store"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_destination_store"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_requester"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_rental"`,
    );
    await queryRunner.query(
      `ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_book"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_routes" DROP CONSTRAINT "FK_delivery_routes_volunteer"`,
    );
    await queryRunner.query(`DROP TABLE "delivery_tracking"`);
    await queryRunner.query(`DROP TABLE "delivery_legs"`);
    await queryRunner.query(`DROP TABLE "delivery_relays"`);
    await queryRunner.query(`DROP TABLE "deliveries"`);
    await queryRunner.query(`DROP TABLE "delivery_routes"`);
    await queryRunner.query(`DROP TYPE "public"."deliveries_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE text USING "type"::text`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('rental_due', 'rental_approved', 'payment_success', 'late_fee')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."notifications_type_enum_old"`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeBookStoreOptional1780392911000
  implements MigrationInterface
{
  name = 'MakeBookStoreOptional1780392911000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "books" ALTER COLUMN "store_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "books" ALTER COLUMN "store_id" SET NOT NULL`,
    );
  }
}

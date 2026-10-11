import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookCopies1780392910000 implements MigrationInterface {
  name = 'AddBookCopies1780392910000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "books" ADD "copies" integer NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "books" DROP COLUMN "copies"`);
  }
}

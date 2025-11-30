import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1701360000000 implements MigrationInterface {
  name = 'InitialSchema1701360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "auth0_id" character varying NOT NULL,
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'viewer',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_auth0_id" UNIQUE ("auth0_id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "company_name" character varying NOT NULL,
        "legal_name" character varying,
        "tax_id" character varying,
        "company_size" character varying,
        "annual_revenue" numeric,
        "years_in_business" integer,
        "status" character varying NOT NULL DEFAULT 'active',
        "current_stage" integer NOT NULL DEFAULT 1,
        "assigned_to_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      )
    `);

    // Create qualification_stages table
    await queryRunner.query(`
      CREATE TABLE "qualification_stages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "stage_number" integer NOT NULL,
        "stage_name" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "started_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_qualification_stages_id" PRIMARY KEY ("id")
      )
    `);

    // Create documents table
    await queryRunner.query(`
      CREATE TABLE "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "document_type" character varying NOT NULL,
        "file_name" character varying NOT NULL,
        "file_size" integer NOT NULL,
        "mime_type" character varying NOT NULL,
        "s3_key" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "expires_at" TIMESTAMP,
        "uploaded_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents_id" PRIMARY KEY ("id")
      )
    `);

    // Create communications table
    await queryRunner.query(`
      CREATE TABLE "communications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "type" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "message" text NOT NULL,
        "sent_by" uuid NOT NULL,
        "sent_at" TIMESTAMP NOT NULL DEFAULT now(),
        "read_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_communications_id" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_customers_status" ON "customers" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_current_stage" ON "customers" ("current_stage")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_assigned_to" ON "customers" ("assigned_to_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_qualification_stages_customer" ON "qualification_stages" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_qualification_stages_status" ON "qualification_stages" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_documents_customer" ON "documents" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_documents_status" ON "documents" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_communications_customer" ON "communications" ("customer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_communications_sent_at" ON "communications" ("sent_at")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "customers"
      ADD CONSTRAINT "FK_customers_assigned_to"
      FOREIGN KEY ("assigned_to_id")
      REFERENCES "users"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "qualification_stages"
      ADD CONSTRAINT "FK_qualification_stages_customer"
      FOREIGN KEY ("customer_id")
      REFERENCES "customers"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD CONSTRAINT "FK_documents_customer"
      FOREIGN KEY ("customer_id")
      REFERENCES "customers"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD CONSTRAINT "FK_documents_uploaded_by"
      FOREIGN KEY ("uploaded_by")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "communications"
      ADD CONSTRAINT "FK_communications_customer"
      FOREIGN KEY ("customer_id")
      REFERENCES "customers"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "communications"
      ADD CONSTRAINT "FK_communications_sent_by"
      FOREIGN KEY ("sent_by")
      REFERENCES "users"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "communications" DROP CONSTRAINT "FK_communications_sent_by"`);
    await queryRunner.query(`ALTER TABLE "communications" DROP CONSTRAINT "FK_communications_customer"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_uploaded_by"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_customer"`);
    await queryRunner.query(`ALTER TABLE "qualification_stages" DROP CONSTRAINT "FK_qualification_stages_customer"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_customers_assigned_to"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_communications_sent_at"`);
    await queryRunner.query(`DROP INDEX "IDX_communications_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_documents_status"`);
    await queryRunner.query(`DROP INDEX "IDX_documents_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_qualification_stages_status"`);
    await queryRunner.query(`DROP INDEX "IDX_qualification_stages_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_assigned_to"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_current_stage"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_status"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "communications"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "qualification_stages"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

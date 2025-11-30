-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  auth0_id character varying NOT NULL,
  email character varying NOT NULL,
  name character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'viewer',
  is_active boolean NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT UQ_users_auth0_id UNIQUE (auth0_id),
  CONSTRAINT UQ_users_email UNIQUE (email),
  CONSTRAINT PK_users_id PRIMARY KEY (id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_name character varying NOT NULL,
  legal_name character varying,
  tax_id character varying,
  company_size character varying,
  annual_revenue numeric,
  years_in_business integer,
  status character varying NOT NULL DEFAULT 'active',
  current_stage integer NOT NULL DEFAULT 1,
  assigned_to_id uuid,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT PK_customers_id PRIMARY KEY (id)
);

-- Create qualification_stages table
CREATE TABLE IF NOT EXISTS qualification_stages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  stage_number integer NOT NULL,
  stage_name character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes text,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT PK_qualification_stages_id PRIMARY KEY (id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  document_type character varying NOT NULL,
  file_name character varying NOT NULL,
  file_size integer NOT NULL,
  mime_type character varying NOT NULL,
  s3_key character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP,
  uploaded_by uuid NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT PK_documents_id PRIMARY KEY (id)
);

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  type character varying NOT NULL,
  subject character varying NOT NULL,
  message text NOT NULL,
  sent_by uuid NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT now(),
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT PK_communications_id PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS IDX_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS IDX_customers_current_stage ON customers (current_stage);
CREATE INDEX IF NOT EXISTS IDX_customers_assigned_to ON customers (assigned_to_id);
CREATE INDEX IF NOT EXISTS IDX_qualification_stages_customer ON qualification_stages (customer_id);
CREATE INDEX IF NOT EXISTS IDX_qualification_stages_status ON qualification_stages (status);
CREATE INDEX IF NOT EXISTS IDX_documents_customer ON documents (customer_id);
CREATE INDEX IF NOT EXISTS IDX_documents_status ON documents (status);
CREATE INDEX IF NOT EXISTS IDX_communications_customer ON communications (customer_id);
CREATE INDEX IF NOT EXISTS IDX_communications_sent_at ON communications (sent_at);

-- Add foreign key constraints
ALTER TABLE customers DROP CONSTRAINT IF EXISTS FK_customers_assigned_to;
ALTER TABLE customers
ADD CONSTRAINT FK_customers_assigned_to
FOREIGN KEY (assigned_to_id)
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE qualification_stages DROP CONSTRAINT IF EXISTS FK_qualification_stages_customer;
ALTER TABLE qualification_stages
ADD CONSTRAINT FK_qualification_stages_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS FK_documents_customer;
ALTER TABLE documents
ADD CONSTRAINT FK_documents_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;

ALTER TABLE documents DROP CONSTRAINT IF EXISTS FK_documents_uploaded_by;
ALTER TABLE documents
ADD CONSTRAINT FK_documents_uploaded_by
FOREIGN KEY (uploaded_by)
REFERENCES users(id);

ALTER TABLE communications DROP CONSTRAINT IF EXISTS FK_communications_customer;
ALTER TABLE communications
ADD CONSTRAINT FK_communications_customer
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE CASCADE;

ALTER TABLE communications DROP CONSTRAINT IF EXISTS FK_communications_sent_by;
ALTER TABLE communications
ADD CONSTRAINT FK_communications_sent_by
FOREIGN KEY (sent_by)
REFERENCES users(id);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- create a vector column (will be NULL until you insert vectors)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  source text,
  source_id text,
  type text,
  title text,
  abstract text,
  authors jsonb,
  date_published date,
  doi text,
  mission text,
  organisms jsonb,
  file_links jsonb,
  thumbnail text,
  ai_summary_short text,
  ai_summary_long text,
  extracted_entities jsonb,
  embedding vector(1536),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(source, source_id)
);
CREATE INDEX IF NOT EXISTS items_text_idx ON items USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'')));

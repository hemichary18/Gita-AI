-- schema.sql
-- Run this in your Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS shlokas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    sanskrit_text TEXT NOT NULL,
    transliteration TEXT,
    word_meanings JSONB,
    embedding VECTOR(1024) NOT NULL,
    fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', transliteration || ' ' || sanskrit_text)) STORED,
    thematic_tags TEXT[],
    problem_categories TEXT[],
    related_verse_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shloka_id UUID REFERENCES shlokas(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL,
    author_name TEXT,
    description TEXT NOT NULL,
    source TEXT,
    license TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY, -- Linked to Supabase Auth
    preferred_language VARCHAR(10) DEFAULT 'en',
    voice_enabled BOOLEAN DEFAULT true,
    notification_enabled BOOLEAN DEFAULT true,
    bookmarked_shlokas UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    messages JSONB[] NOT NULL,
    detected_emotion TEXT,
    session_language VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shloka_id UUID REFERENCES shlokas(id) ON DELETE CASCADE,
    scheduled_date DATE UNIQUE NOT NULL,
    language VARCHAR(10) NOT NULL,
    generated_context TEXT,
    sent_at TIMESTAMPTZ
);

-- 3. Create Indexes
-- Ensure vector_cosine_ops is used for HNSW
CREATE INDEX IF NOT EXISTS shlokas_embedding_idx ON shlokas USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS shlokas_fts_idx ON shlokas USING gin(fts);
CREATE INDEX IF NOT EXISTS shlokas_chapter_verse_idx ON shlokas(chapter_number, verse_number);
CREATE INDEX IF NOT EXISTS conversations_user_updated_idx ON conversations(user_id, updated_at DESC);

-- 4. Hybrid Search Function
CREATE OR REPLACE FUNCTION hybrid_search(
    query_text TEXT,
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 3
)
RETURNS TABLE(id UUID, chapter_number INT, verse_number INT, sanskrit_text TEXT, score FLOAT)
LANGUAGE sql AS $$
WITH semantic AS (
    SELECT s.id, ROW_NUMBER() OVER (ORDER BY s.embedding <#> query_embedding) AS rank
    FROM shlokas s
),
keyword AS (
    SELECT s.id, ROW_NUMBER() OVER (
        ORDER BY ts_rank_cd(s.fts, websearch_to_tsquery('english', query_text)) DESC
    ) AS rank
    FROM shlokas s
    WHERE s.fts @@ websearch_to_tsquery('english', query_text)
)
SELECT s.id, sh.chapter_number, sh.verse_number, sh.sanskrit_text,
       (1.0/(50 + s.rank)) * 0.7 + COALESCE((1.0/(50 + k.rank)) * 0.3, 0) AS score
FROM semantic s
JOIN shlokas sh ON sh.id = s.id
LEFT JOIN keyword k ON k.id = s.id
ORDER BY score DESC
LIMIT match_count;
$$;

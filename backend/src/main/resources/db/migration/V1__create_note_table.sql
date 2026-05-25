-- V1__create_note_table.sql
CREATE TABLE note (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    title       VARCHAR(500)    NOT NULL DEFAULT '',
    content     TEXT            NOT NULL DEFAULT '',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted     SMALLINT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_note_created_at ON note (created_at DESC);
CREATE INDEX idx_note_updated_at ON note (updated_at DESC);

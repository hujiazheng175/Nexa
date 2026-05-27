CREATE TABLE note_ai_record (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    note_id     VARCHAR(36)  NOT NULL,
    type        VARCHAR(32)  NOT NULL,
    input_text  TEXT,
    result      TEXT         NOT NULL,
    model       VARCHAR(64),
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_note_ai_record_note_id ON note_ai_record (note_id);
CREATE INDEX idx_note_ai_record_type ON note_ai_record (note_id, type);

-- Category table for tree-structured classification
CREATE TABLE category (
    id         VARCHAR(36)  NOT NULL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    parent_id  VARCHAR(36) REFERENCES category(id),
    sort_order INT          NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_category_parent ON category (parent_id, sort_order);

-- Add category reference to note
ALTER TABLE note ADD COLUMN category_id VARCHAR(36) REFERENCES category(id);

-- Default category: 未分类
INSERT INTO category (id, name, parent_id, sort_order) VALUES ('uncategorized', '未分类', NULL, 0);

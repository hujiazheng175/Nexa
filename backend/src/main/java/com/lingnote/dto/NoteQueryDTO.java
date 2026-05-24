package com.lingnote.dto;

import lombok.Data;

@Data
public class NoteQueryDTO {

    private String keyword;

    private int page = 1;

    private int size = 20;

    /** Sort field: createdAt or updatedAt */
    private String sortBy = "updatedAt";

    /** Sort order: asc or desc */
    private String sortOrder = "desc";

    public int getPage() {
        return Math.max(1, page);
    }

    public int getSize() {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }
}

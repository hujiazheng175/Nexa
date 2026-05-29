package com.lingnote.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteVO {

    private String id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private Integer remainingDays;
    private String categoryId;
}

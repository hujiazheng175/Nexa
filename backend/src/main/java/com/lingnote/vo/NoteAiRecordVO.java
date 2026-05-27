package com.lingnote.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteAiRecordVO {

    private String id;
    private String noteId;
    private String type;
    private String result;
    private String model;
    private LocalDateTime createdAt;
}

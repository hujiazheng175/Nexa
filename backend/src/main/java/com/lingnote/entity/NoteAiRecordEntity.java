package com.lingnote.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("note_ai_record")
public class NoteAiRecordEntity {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String noteId;

    private String type;

    private String inputText;

    private String result;

    private String model;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

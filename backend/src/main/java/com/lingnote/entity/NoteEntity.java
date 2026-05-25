package com.lingnote.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("note")
public class NoteEntity {

    @TableId(type = IdType.ASSIGN_UUID)
    private String id;

    private String title;

    private String content;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /** Logical delete flag: 0 = active, 1 = deleted */
    @TableLogic(value = "0", delval = "1")
    private Integer deleted;
}

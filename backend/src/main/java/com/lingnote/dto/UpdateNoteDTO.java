package com.lingnote.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateNoteDTO {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    private String content;
}

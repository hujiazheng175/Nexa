package com.lingnote.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CategoryVO {

    private String id;
    private String name;
    private String parentId;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private List<CategoryVO> children;
}

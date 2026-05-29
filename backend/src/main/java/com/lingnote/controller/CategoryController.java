package com.lingnote.controller;

import com.lingnote.common.response.Result;
import com.lingnote.service.CategoryService;
import com.lingnote.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryVO>> tree() {
        return Result.success(categoryService.tree());
    }

    @PostMapping
    public Result<CategoryVO> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String parentId = body.getOrDefault("parentId", null);
        return Result.success(categoryService.create(name, parentId));
    }
}

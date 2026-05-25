package com.lingnote.controller;

import com.lingnote.common.response.PageResult;
import com.lingnote.common.response.Result;
import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.dto.NoteQueryDTO;
import com.lingnote.dto.UpdateNoteDTO;
import com.lingnote.exception.BusinessException;
import com.lingnote.service.NoteService;
import com.lingnote.vo.NoteVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public Result<NoteVO> create(@Valid @RequestBody CreateNoteDTO dto) {
        return Result.success(noteService.create(dto));
    }

    @GetMapping
    public Result<PageResult<NoteVO>> listNotes(NoteQueryDTO query) {
        validateQuery(query);
        return Result.success(noteService.listNotes(query));
    }

    @GetMapping("/{id}")
    public Result<NoteVO> getById(@PathVariable String id) {
        validateId(id);
        return Result.success(noteService.getById(id));
    }

    @PutMapping("/{id}")
    public Result<NoteVO> update(@PathVariable String id, @Valid @RequestBody UpdateNoteDTO dto) {
        validateId(id);
        return Result.success(noteService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) {
        validateId(id);
        noteService.delete(id);
        return Result.success();
    }

    private void validateId(String id) {
        if (!StringUtils.hasText(id)) {
            throw new BusinessException(400, "Invalid note id");
        }
    }

    private void validateQuery(NoteQueryDTO query) {
        if (query == null) {
            return;
        }
        String sortBy = query.getSortBy();
        if (StringUtils.hasText(sortBy)
                && !"createdAt".equals(sortBy)
                && !"updatedAt".equals(sortBy)
                && !"title".equals(sortBy)) {
            throw new BusinessException(400, "Invalid sortBy field, only support: createdAt, updatedAt, title");
        }
        String sortOrder = query.getSortOrder();
        if (StringUtils.hasText(sortOrder)
                && !"asc".equalsIgnoreCase(sortOrder)
                && !"desc".equalsIgnoreCase(sortOrder)) {
            throw new BusinessException(400, "Invalid sortOrder, only support: asc, desc");
        }
    }
}

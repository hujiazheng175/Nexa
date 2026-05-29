package com.lingnote.controller;

import com.lingnote.ai.service.AiService;
import com.lingnote.common.response.PageResult;
import com.lingnote.common.response.Result;
import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.dto.NoteQueryDTO;
import com.lingnote.dto.UpdateNoteDTO;
import com.lingnote.exception.BusinessException;
import com.lingnote.service.NoteService;
import com.lingnote.vo.NoteAiRecordVO;
import com.lingnote.vo.NoteVO;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final AiService aiService;

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

    @GetMapping("/trash")
    public Result<PageResult<NoteVO>> listTrashed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(noteService.listTrashedNotes(page, size, keyword));
    }

    @PostMapping("/{id}/restore")
    public Result<NoteVO> restore(@PathVariable String id) {
        validateId(id);
        return Result.success(noteService.restore(id));
    }

    @GetMapping("/trash/count")
    public Result<Long> countTrashed() {
        return Result.success(noteService.countTrashed());
    }

    @DeleteMapping("/trash")
    public Result<Void> emptyTrash() {
        noteService.emptyTrash();
        return Result.success();
    }

    @DeleteMapping("/{id}/permanent")
    public Result<Void> permanentDelete(@PathVariable String id) {
        validateId(id);
        noteService.permanentDelete(id);
        return Result.success();
    }

    @PostMapping("/{id}/summarize")
    public Result<NoteAiRecordVO> summarize(@PathVariable String id) {
        validateId(id);
        return Result.success(aiService.summarize(id));
    }

    @GetMapping("/{id}/summaries/latest")
    public Result<NoteAiRecordVO> getLatestSummary(@PathVariable String id) {
        validateId(id);
        return Result.success(aiService.getLatestSummary(id));
    }

    @PutMapping("/{id}/category")
    public Result<Void> moveToCategory(@PathVariable String id, @RequestBody Map<String, String> body) {
        validateId(id);
        noteService.moveToCategory(id, body.get("categoryId"));
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

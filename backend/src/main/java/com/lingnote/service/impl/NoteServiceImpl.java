package com.lingnote.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lingnote.common.response.PageResult;
import com.lingnote.converter.NoteConverter;
import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.dto.NoteQueryDTO;
import com.lingnote.dto.UpdateNoteDTO;
import com.lingnote.entity.NoteEntity;
import com.lingnote.exception.BusinessException;
import com.lingnote.repository.NoteMapper;
import com.lingnote.service.NoteService;
import com.lingnote.vo.NoteVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteMapper noteMapper;
    private final NoteConverter noteConverter;

    @Override
    public NoteVO create(CreateNoteDTO dto) {
        NoteEntity entity = noteConverter.toEntity(dto);
        noteMapper.insert(entity);
        return noteConverter.toVO(entity);
    }

    @Override
    public NoteVO getById(String id) {
        NoteEntity entity = noteMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "Note not found");
        }
        return noteConverter.toVO(entity);
    }

    @Override
    public List<NoteVO> listAll() {
        LambdaQueryWrapper<NoteEntity> wrapper = buildQueryWrapper(null);
        List<NoteEntity> entities = noteMapper.selectList(wrapper);
        return noteConverter.toVOList(entities);
    }

    @Override
    public PageResult<NoteVO> listNotes(NoteQueryDTO query) {
        Page<NoteEntity> page = new Page<>(query.getPage(), query.getSize());
        LambdaQueryWrapper<NoteEntity> wrapper = buildQueryWrapper(query);
        Page<NoteEntity> resultPage = noteMapper.selectPage(page, wrapper);
        List<NoteVO> voList = noteConverter.toVOList(resultPage.getRecords());
        return new PageResult<>(voList, resultPage.getTotal(), query.getPage(), query.getSize());
    }

    @Override
    public NoteVO update(String id, UpdateNoteDTO dto) {
        NoteEntity entity = noteMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "Note not found");
        }
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        noteMapper.updateById(entity);
        return noteConverter.toVO(entity);
    }

    @Override
    public void delete(String id) {
        NoteEntity entity = noteMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "Note not found");
        }
        // Soft delete: mark as trashed, record deletion time
        entity.setDeleted(1);
        entity.setDeletedAt(java.time.LocalDateTime.now());
        noteMapper.updateById(entity);
    }

    private LambdaQueryWrapper<NoteEntity> buildQueryWrapper(NoteQueryDTO query) {
        return buildQueryWrapper(query, false);
    }

    @Override
    public PageResult<NoteVO> listTrashedNotes(int page, int size) {
        Page<NoteEntity> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<NoteEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NoteEntity::getDeleted, 1);
        wrapper.orderByDesc(NoteEntity::getDeletedAt);

        Page<NoteEntity> resultPage = noteMapper.selectPage(pageParam, wrapper);
        List<NoteVO> voList = noteConverter.toVOList(resultPage.getRecords());
        return new PageResult<>(voList, resultPage.getTotal(), page, size);
    }

    @Override
    public NoteVO restore(String id) {
        NoteEntity entity = noteMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "Note not found");
        }
        if (entity.getDeleted() == 0) {
            throw new BusinessException(400, "Note is not in trash");
        }
        entity.setDeleted(0);
        entity.setDeletedAt(null);
        noteMapper.updateById(entity);
        return noteConverter.toVO(entity);
    }

    @Override
    public void permanentDelete(String id) {
        NoteEntity entity = noteMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(404, "Note not found");
        }
        if (entity.getDeleted() == 0) {
            throw new BusinessException(400, "Note must be in trash to be permanently deleted");
        }
        noteMapper.deleteById(id);
    }

    @Override
    public void cleanupOldTrash(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        LambdaQueryWrapper<NoteEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NoteEntity::getDeleted, 1)
                .le(NoteEntity::getDeletedAt, cutoff);
        noteMapper.delete(wrapper);
    }

    /**
     * @param query query parameters
     * @param includeTrashed whether to include trashed notes (deleted = 1)
     */
    private LambdaQueryWrapper<NoteEntity> buildQueryWrapper(NoteQueryDTO query, boolean includeTrashed) {
        LambdaQueryWrapper<NoteEntity> wrapper = new LambdaQueryWrapper<>();

        // Manual soft-delete filter (replaces @TableLogic)
        if (!includeTrashed) {
            wrapper.eq(NoteEntity::getDeleted, 0);
        }

        if (query != null && StringUtils.hasText(query.getKeyword())) {
            String keyword = query.getKeyword();
            wrapper.and(w -> w.like(NoteEntity::getTitle, keyword)
                    .or()
                    .like(NoteEntity::getContent, keyword));
        }

        if (query != null) {
            boolean isAsc = "asc".equalsIgnoreCase(query.getSortOrder());
            if ("createdAt".equals(query.getSortBy())) {
                if (isAsc) {
                    wrapper.orderByAsc(NoteEntity::getCreatedAt);
                } else {
                    wrapper.orderByDesc(NoteEntity::getCreatedAt);
                }
            } else if ("title".equals(query.getSortBy())) {
                if (isAsc) {
                    wrapper.orderByAsc(NoteEntity::getTitle);
                } else {
                    wrapper.orderByDesc(NoteEntity::getTitle);
                }
            } else {
                if (isAsc) {
                    wrapper.orderByAsc(NoteEntity::getUpdatedAt);
                } else {
                    wrapper.orderByDesc(NoteEntity::getUpdatedAt);
                }
            }
        } else {
            wrapper.orderByDesc(NoteEntity::getUpdatedAt);
        }

        return wrapper;
    }
}

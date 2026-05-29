package com.lingnote.converter;

import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.entity.NoteEntity;
import com.lingnote.vo.NoteVO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NoteConverter {

    public NoteEntity toEntity(CreateNoteDTO dto) {
        NoteEntity entity = new NoteEntity();
        entity.setTitle(dto.getTitle());
        entity.setContent(dto.getContent());
        entity.setCategoryId(dto.getCategoryId());
        return entity;
    }

    public NoteVO toVO(NoteEntity entity) {
        NoteVO vo = new NoteVO();
        vo.setId(entity.getId());
        vo.setTitle(entity.getTitle());
        vo.setContent(entity.getContent());
        vo.setCreatedAt(entity.getCreatedAt());
        vo.setUpdatedAt(entity.getUpdatedAt());
        vo.setDeletedAt(entity.getDeletedAt());
        vo.setCategoryId(entity.getCategoryId());
        return vo;
    }

    public List<NoteVO> toVOList(List<NoteEntity> entities) {
        return entities.stream().map(this::toVO).toList();
    }
}

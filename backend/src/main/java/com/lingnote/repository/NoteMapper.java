package com.lingnote.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingnote.entity.NoteEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NoteMapper extends BaseMapper<NoteEntity> {
}

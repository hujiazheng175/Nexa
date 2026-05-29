package com.lingnote.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.lingnote.entity.CategoryEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<CategoryEntity> {
}

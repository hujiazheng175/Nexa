package com.lingnote.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingnote.entity.CategoryEntity;
import com.lingnote.exception.BusinessException;
import com.lingnote.repository.CategoryMapper;
import com.lingnote.vo.CategoryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    public List<CategoryVO> tree() {
        List<CategoryEntity> all = categoryMapper.selectList(
            new LambdaQueryWrapper<CategoryEntity>().orderByAsc(CategoryEntity::getSortOrder)
        );
        List<CategoryVO> vos = all.stream().map(this::toVO).toList();
        Map<String, List<CategoryVO>> byParent = vos.stream()
            .filter(v -> v.getParentId() != null)
            .collect(Collectors.groupingBy(CategoryVO::getParentId));
        List<CategoryVO> roots = new ArrayList<>();
        for (CategoryVO vo : vos) {
            vo.setChildren(byParent.getOrDefault(vo.getId(), List.of()));
            if (vo.getParentId() == null) {
                roots.add(vo);
            }
        }
        return roots;
    }

    public CategoryVO create(String name, String parentId) {
        if (!StringUtils.hasText(name)) {
            throw new BusinessException(400, "分类名称不能为空");
        }
        CategoryEntity entity = new CategoryEntity();
        entity.setName(name);
        entity.setParentId(parentId);
        entity.setSortOrder(0);
        categoryMapper.insert(entity);
        return toVO(entity);
    }

    private CategoryVO toVO(CategoryEntity entity) {
        CategoryVO vo = new CategoryVO();
        vo.setId(entity.getId());
        vo.setName(entity.getName());
        vo.setParentId(entity.getParentId());
        vo.setSortOrder(entity.getSortOrder());
        vo.setCreatedAt(entity.getCreatedAt());
        return vo;
    }
}

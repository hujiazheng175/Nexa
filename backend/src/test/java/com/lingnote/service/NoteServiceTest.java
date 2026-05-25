package com.lingnote.service;

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
import com.lingnote.service.impl.NoteServiceImpl;
import com.lingnote.vo.NoteVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteMapper noteMapper;

    @InjectMocks
    private NoteServiceImpl noteService;

    private NoteConverter noteConverter;

    @BeforeEach
    void setUp() {
        noteConverter = new NoteConverter();
        // Use reflection to set converter since @InjectMocks won't create it
        try {
            var field = NoteServiceImpl.class.getDeclaredField("noteConverter");
            field.setAccessible(true);
            field.set(noteService, noteConverter);
        } catch (Exception e) {
            fail("Failed to set noteConverter: " + e.getMessage());
        }
    }

    @Test
    void create_shouldReturnNoteVO() {
        CreateNoteDTO dto = new CreateNoteDTO();
        dto.setTitle("Test Note");
        dto.setContent("Test content");

        NoteVO result = noteService.create(dto);

        assertNotNull(result);
        assertEquals("Test Note", result.getTitle());
        assertEquals("Test content", result.getContent());
        verify(noteMapper).insert(any(NoteEntity.class));
    }

    @Test
    void getById_shouldReturnNoteVO_whenExists() {
        NoteEntity entity = new NoteEntity();
        entity.setId("test-id");
        entity.setTitle("Test");
        entity.setContent("Content");
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        when(noteMapper.selectById("test-id")).thenReturn(entity);

        NoteVO result = noteService.getById("test-id");

        assertNotNull(result);
        assertEquals("test-id", result.getId());
        assertEquals("Test", result.getTitle());
    }

    @Test
    void getById_shouldThrowException_whenNotFound() {
        when(noteMapper.selectById("nonexistent")).thenReturn(null);

        assertThrows(BusinessException.class, () -> noteService.getById("nonexistent"));
    }

    @Test
    void listNotes_shouldReturnPageResult() {
        NoteEntity entity = new NoteEntity();
        entity.setId("id-1");
        entity.setTitle("Note 1");
        entity.setContent("Content 1");

        Page<NoteEntity> page = new Page<>(1, 20);
        page.setRecords(List.of(entity));
        page.setTotal(1);

        when(noteMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(page);

        NoteQueryDTO query = new NoteQueryDTO();
        query.setPage(1);
        query.setSize(20);

        PageResult<NoteVO> result = noteService.listNotes(query);

        assertNotNull(result);
        assertEquals(1, result.getTotal());
        assertEquals(1, result.getRecords().size());
        assertEquals("Note 1", result.getRecords().get(0).getTitle());
    }

    @Test
    void listNotes_shouldFilterByKeyword() {
        Page<NoteEntity> page = new Page<>(1, 20);
        page.setRecords(List.of());
        page.setTotal(0);

        when(noteMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(page);

        NoteQueryDTO query = new NoteQueryDTO();
        query.setKeyword("search");
        query.setPage(1);
        query.setSize(20);

        noteService.listNotes(query);

        verify(noteMapper).selectPage(any(Page.class), any(LambdaQueryWrapper.class));
    }

    @Test
    void update_shouldReturnUpdatedNoteVO() {
        NoteEntity entity = new NoteEntity();
        entity.setId("test-id");
        entity.setTitle("Old Title");
        entity.setContent("Old Content");

        when(noteMapper.selectById("test-id")).thenReturn(entity);

        UpdateNoteDTO dto = new UpdateNoteDTO();
        dto.setTitle("New Title");
        dto.setContent("New Content");

        NoteVO result = noteService.update("test-id", dto);

        assertEquals("New Title", result.getTitle());
        assertEquals("New Content", result.getContent());
        verify(noteMapper).updateById(entity);
    }

    @Test
    void update_shouldThrowException_whenNotFound() {
        when(noteMapper.selectById("nonexistent")).thenReturn(null);

        UpdateNoteDTO dto = new UpdateNoteDTO();
        dto.setTitle("New Title");

        assertThrows(BusinessException.class, () -> noteService.update("nonexistent", dto));
    }

    @Test
    void delete_shouldCallMapperDeleteById() {
        NoteEntity entity = new NoteEntity();
        entity.setId("test-id");

        when(noteMapper.selectById("test-id")).thenReturn(entity);

        noteService.delete("test-id");

        verify(noteMapper).deleteById("test-id");
    }

    @Test
    void delete_shouldThrowException_whenNotFound() {
        when(noteMapper.selectById("nonexistent")).thenReturn(null);

        assertThrows(BusinessException.class, () -> noteService.delete("nonexistent"));
    }
}

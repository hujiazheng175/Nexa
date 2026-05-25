package com.lingnote.controller;

import com.lingnote.common.response.PageResult;
import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.dto.UpdateNoteDTO;
import com.lingnote.service.NoteService;
import com.lingnote.vo.NoteVO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NoteController.class)
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NoteService noteService;

    @Test
    void create_shouldReturnSuccess() throws Exception {
        NoteVO vo = new NoteVO();
        vo.setId("test-id");
        vo.setTitle("Test Note");
        vo.setContent("Test content");
        vo.setCreatedAt(LocalDateTime.now());
        vo.setUpdatedAt(LocalDateTime.now());

        when(noteService.create(any(CreateNoteDTO.class))).thenReturn(vo);

        mockMvc.perform(post("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Test Note\",\"content\":\"Test content\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value("test-id"))
                .andExpect(jsonPath("$.data.title").value("Test Note"));
    }

    @Test
    void create_shouldReturnBadRequest_whenTitleBlank() throws Exception {
        mockMvc.perform(post("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"content\":\"Test\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void getById_shouldReturnNote() throws Exception {
        NoteVO vo = new NoteVO();
        vo.setId("test-id");
        vo.setTitle("Test Note");
        vo.setCreatedAt(LocalDateTime.now());
        vo.setUpdatedAt(LocalDateTime.now());

        when(noteService.getById("test-id")).thenReturn(vo);

        mockMvc.perform(get("/api/notes/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value("test-id"));
    }

    @Test
    void listNotes_shouldReturnPageResult() throws Exception {
        NoteVO vo = new NoteVO();
        vo.setId("test-id");
        vo.setTitle("Test Note");
        vo.setCreatedAt(LocalDateTime.now());
        vo.setUpdatedAt(LocalDateTime.now());

        PageResult<NoteVO> pageResult = new PageResult<>(List.of(vo), 1, 1, 20);
        when(noteService.listNotes(any())).thenReturn(pageResult);

        mockMvc.perform(get("/api/notes")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.records[0].title").value("Test Note"));
    }

    @Test
    void update_shouldReturnUpdatedNote() throws Exception {
        NoteVO vo = new NoteVO();
        vo.setId("test-id");
        vo.setTitle("Updated Title");
        vo.setUpdatedAt(LocalDateTime.now());

        when(noteService.update(eq("test-id"), any(UpdateNoteDTO.class))).thenReturn(vo);

        mockMvc.perform(put("/api/notes/test-id")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Updated Title\",\"content\":\"Updated content\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("Updated Title"));
    }

    @Test
    void delete_shouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/api/notes/test-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(noteService).delete("test-id");
    }
}

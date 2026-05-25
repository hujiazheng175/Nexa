package com.lingnote.service;

import com.lingnote.common.response.PageResult;
import com.lingnote.dto.CreateNoteDTO;
import com.lingnote.dto.NoteQueryDTO;
import com.lingnote.dto.UpdateNoteDTO;
import com.lingnote.vo.NoteVO;

import java.util.List;

public interface NoteService {

    NoteVO create(CreateNoteDTO dto);

    NoteVO getById(String id);

    /** @deprecated use {@link #listNotes(NoteQueryDTO)} instead */
    @Deprecated
    List<NoteVO> listAll();

    PageResult<NoteVO> listNotes(NoteQueryDTO query);

    NoteVO update(String id, UpdateNoteDTO dto);

    void delete(String id);

    /** List all trashed notes (deleted = 1), ordered by deletion time */
    PageResult<NoteVO> listTrashedNotes(int page, int size);

    /** Restore a trashed note back to active */
    NoteVO restore(String id);

    /** Permanently delete a trashed note */
    void permanentDelete(String id);

    /** Clean up trashed notes older than specified days */
    void cleanupOldTrash(int days);
}

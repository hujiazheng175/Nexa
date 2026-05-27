package com.lingnote.ai.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.lingnote.ai.client.DeepSeekClient;
import com.lingnote.ai.prompt.PromptTemplates;
import com.lingnote.entity.NoteAiRecordEntity;
import com.lingnote.entity.NoteEntity;
import com.lingnote.exception.BusinessException;
import com.lingnote.repository.NoteAiRecordMapper;
import com.lingnote.repository.NoteMapper;
import com.lingnote.vo.NoteAiRecordVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiService {

    private final NoteMapper noteMapper;
    private final NoteAiRecordMapper recordMapper;
    private final DeepSeekClient deepSeekClient;

    @Value("${app.ai.deepseek.model}")
    private String model;

    public NoteAiRecordVO summarize(String noteId) {
        NoteEntity note = noteMapper.selectById(noteId);
        if (note == null) {
            throw new BusinessException(404, "笔记不存在");
        }

        String plainText = extractPlainText(note.getContent());
        if (plainText.isBlank()) {
            throw new BusinessException(400, "笔记内容为空，无法生成摘要");
        }

        String prompt = String.format(PromptTemplates.SUMMARY, plainText);
        String result = deepSeekClient.chat(prompt);

        NoteAiRecordEntity record = new NoteAiRecordEntity();
        record.setNoteId(noteId);
        record.setType("summary");
        record.setInputText(plainText);
        record.setResult(result);
        record.setModel(model);
        recordMapper.insert(record);

        return toVO(record);
    }

    public NoteAiRecordVO getLatestSummary(String noteId) {
        LambdaQueryWrapper<NoteAiRecordEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(NoteAiRecordEntity::getNoteId, noteId)
               .eq(NoteAiRecordEntity::getType, "summary")
               .orderByDesc(NoteAiRecordEntity::getCreatedAt)
               .last("LIMIT 1");
        NoteAiRecordEntity record = recordMapper.selectOne(wrapper);
        return record != null ? toVO(record) : null;
    }

    private String extractPlainText(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        return html.replaceAll("<[^>]*>", "")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll("&quot;", "\"")
                   .replaceAll("\\s+", " ")
                   .trim();
    }

    private NoteAiRecordVO toVO(NoteAiRecordEntity entity) {
        NoteAiRecordVO vo = new NoteAiRecordVO();
        vo.setId(entity.getId());
        vo.setNoteId(entity.getNoteId());
        vo.setType(entity.getType());
        vo.setResult(entity.getResult());
        vo.setModel(entity.getModel());
        vo.setCreatedAt(entity.getCreatedAt());
        return vo;
    }
}

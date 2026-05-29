package com.lingnote.ai.prompt;

/**
 * AI prompt templates. Each operation type has its own template.
 * Prompts are maintained here separately from service logic
 * so they can be tuned without touching business code.
 */
public final class PromptTemplates {

    private PromptTemplates() {}

    /** Summarize note content in concise Chinese, within 200 characters. */
    public static final String SUMMARY = """
        请用简洁的中文总结以下笔记内容，注意是总结，不是解释，控制在200字以内，保留核心观点和关键信息：
        
        %s
        """;
}

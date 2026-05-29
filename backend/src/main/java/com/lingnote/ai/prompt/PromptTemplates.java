package com.lingnote.ai.prompt;

/**
 * AI prompt templates. Each operation type has its own template.
 * Prompts are maintained here separately from service logic
 * so they can be tuned without touching business code.
 */
public final class PromptTemplates {

    private PromptTemplates() {}

    /** Summarize note content in a structured format. */
    public static final String SUMMARY = """
        请用以下结构化格式总结笔记内容，每部分简洁明了，2-3句话即可：

        【TL;DR】
        用一句话概括全文核心。

        【核心主题】
        - 列出1-3个主要话题

        【关键论点】
        - 列出1-3个核心观点或论证

        【小结】
        - 用一句话点明文章价值或行动建议

        注意：是总结而非解释，不要添加原文没有的内容。

        %s
        """;
}

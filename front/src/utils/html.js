/**
 * HTML 文本处理工具
 * 用于从 TipTap 编辑器输出的 HTML 中提取纯文本预览
 */

/**
 * 从 HTML 字符串中安全地提取纯文本
 * 使用 DOM API 避免 XSS 风险
 * @param {string} html - HTML 字符串
 * @returns {string} 纯文本内容
 */
export function stripHtml(html) {
  if (!html) return ''
  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

/**
 * 智能截断文本
 * 优先在词边界处截断，保持可读性
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本（含省略号）
 */
export function truncate(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text || ''

  const truncated = text.slice(0, maxLength)

  // 在词边界处截断（避免切断中文词汇）
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * 从 HTML 中提取预览文本
 * 组合 stripHtml + truncate 的便捷方法
 * @param {string} html - HTML 字符串
 * @param {number} maxLength - 最大长度
 * @returns {string} 预览文本
 */
export function extractPreview(html, maxLength = 120) {
  const text = stripHtml(html).trim()
  return truncate(text, maxLength)
}

/**
 * 判断 HTML 内容是否需要截断
 * @param {string} html - HTML 字符串
 * @param {number} maxLength - 最大长度
 * @returns {boolean}
 */
export function needsTruncate(html, maxLength = 120) {
  if (!html) return false
  return stripHtml(html).trim().length > maxLength
}

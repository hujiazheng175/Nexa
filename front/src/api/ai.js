import request from './request'

export const aiApi = {
  generateSummary(noteId) {
    return request.post(`/notes/${noteId}/summarize`)
  },

  getLatestSummary(noteId) {
    return request.get(`/notes/${noteId}/summaries/latest`)
  }
}

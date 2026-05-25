import request from './request'

export const noteApi = {
  getList(params) {
    return request.get('/notes', { params })
  },
  getAll(params) {
    return request.get('/notes', { params: { ...params, page: 1, size: 100 } })
  },
  getById(id) {
    return request.get(`/notes/${id}`)
  },
  create(data) {
    return request.post('/notes', data)
  },
  update(id, data) {
    return request.put(`/notes/${id}`, data)
  },
  delete(id) {
    return request.delete(`/notes/${id}`)
  },
  // Trash operations
  getTrash(params) {
    return request.get('/notes/trash', { params })
  },
  restore(id) {
    return request.post(`/notes/${id}/restore`)
  },
  permanentDelete(id) {
    return request.delete(`/notes/${id}/permanent`)
  }
}

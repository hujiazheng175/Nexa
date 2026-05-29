import request from './request'

export const categoryApi = {
  tree() {
    return request.get('/categories/tree')
  },

  create(name, parentId) {
    return request.post('/categories', { name, parentId })
  }
}

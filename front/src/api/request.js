import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    
    // 统一处理业务状态码
    if (code === 200) {
      // 成功：直接返回 data
      return data
    }
    
    // 业务失败：抛出错误
    const error = new Error(message || '请求失败')
    error.code = code
    return Promise.reject(error)
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      const message = data?.message || 'Request failed'

      switch (status) {
        case 400:
          console.error('Bad Request:', message)
          break
        case 401:
          console.error('Unauthorized:', message)
          break
        case 403:
          console.error('Forbidden:', message)
          break
        case 404:
          console.error('Not Found:', message)
          break
        case 500:
          console.error('Server Error:', message)
          break
        default:
          console.error('Request Error:', message)
      }
    } else if (error.request) {
      console.error('Network Error: No response from server')
    } else {
      console.error('Request Setup Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default request

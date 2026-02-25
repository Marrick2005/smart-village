// 简单请求封装
const BASE_URL = 'http://localhost:8000/api'

export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': options.contentType || 'application/json',
        ...options.header
      },
      success: (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

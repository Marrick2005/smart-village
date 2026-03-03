// 简单请求封装 - 建议在小程序中使用 127.0.0.1 避免 localhost 解析问题
const BASE_URL = 'http://127.0.0.1:8000/api'

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
        console.log('请求成功反馈:', res)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          uni.showToast({ title: `服务器错误: ${res.statusCode}`, icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        console.error('请求发起失败:', err)
        uni.showToast({ title: '网络请求失败(请确认后端已启动)', icon: 'none' })
        reject(err)
      }
    })
  })
}

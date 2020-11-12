import axios from 'axios'

export default function request(params, failCb) {
  const { url, method, success, data, restProps } = params
  const option = {
    url,
    method: method ? method : 'GET',
    ...restProps
  }
  if (method == 'POST') {
    option.data = data || {}
  }

  const request = axios.create({
    baseURL: 'https://beian.xinnet.com/group1/'
  })
  
  axios.interceptors.request.use(function (config) {
    return config
  }, function (error) {
    return Promise.reject(error)
  })

  axios.interceptors.response.use(function (res) {
    console.log('ajax请求success')
    console.log(res)
    if (res && res.statusCode != 200) {
      Toast({
        message: '网络异常，请稍后重试',
        duration: 3000
      })
    } else {
      success(res)
    }
    return res
  }, function (error) {
    console.log('ajax请求失败，fail')
    console.log(error)
    let msg = error.errMsg
    if (error.errMsg && error.errMsg.indexOf('请求超时') > -1) {
      msg = '请求超时'
    } else if (error.errMsg && error.errMsg.indexOf('ERR_ADDRESS_UNREACHABLE') > -1) {
      msg = '网络异常，请稍后重试'
    } else if (error.errMsg && error.errMsg.indexOf('ERR_TIMED_OUT') > -1) {
      msg = '网络异常，请稍后重试'
    }
    Toast({
      message: msg,
      duration: 3000
    })
    if (failCb) {
      failCb()
    }
    return Promise.reject(error)
  })

  return request(option)
}

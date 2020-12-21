import axios from 'axios'
import { Toast, Indicator } from 'mint-ui'

export default function request(params, failCb) {
  const { url, method, success, data, restProps } = params
  const option = {
    url,
    method: method || 'GET',
    ...restProps
  }
  if (method == 'POST') {
    option.data = data || {}
  }

  let timeout = 1000 * 45
  if (params.timeout) {
    timeout = params.timeout
  }
  const service = axios.create({
    baseURL: '/api/miniprogram',
    timeout
  })
  service.interceptors.request.use(function (config) {
    return config
  }, function (error) {
    return Promise.reject(error)
  })

  service.interceptors.response.use(function (res) {
    // console.log('ajax成功回调！')
    // console.log(res)
    const whitelists = ['/orgAttachment', '/idCardAttachment', '/checkPhone']
    if (res && res.status !== 200) {
      Indicator.close()
      Toast({
        message: '网络异常，请稍后重试',
        duration: 3000,
        className: 'noticeError'
      })
    } else if (res.status === 200 && res.data && res.data.code !== 'success' && isWhitelists(res.config.url, whitelists) == -1) {
      Indicator.close()
      Toast({
        message: res.data.message,
        duration: 3000,
        className: 'noticeError'
      })
      if (res.config.url === '/silentImageVerify') {
        success(res)
      }
    } else {
      success(res)
    }
    return res
  }, function (error) {
    console.log('ajax失败回调！')
    console.log(error)
    let msg = error.errMsg
    if (error.errMsg && error.errMsg.indexOf('请求超时') > -1) {
      msg = '请求超时'
    } else if (error.errMsg && error.errMsg.indexOf('ERR_ADDRESS_UNREACHABLE') > -1) {
      msg = '网络异常，请稍后重试'
    } else if (error.errMsg && error.errMsg.indexOf('ERR_TIMED_OUT') > -1) {
      msg = '网络异常，请稍后重试'
    } else {
      msg = '网络异常，请稍后重试'
    }
    Indicator.close()
    Toast({
      message: msg,
      duration: 3000,
      className: 'noticeError'
    })
    if (failCb) {
      failCb()
    }
    return Promise.reject(error)
  })

  return service(option)
}

function isWhitelists(url, whitelists) {
  let res = -1
  whitelists.forEach(v => {
    if (url.indexOf(v) > -1) {
      res = url.indexOf(v)
    }
  })
  return res
}

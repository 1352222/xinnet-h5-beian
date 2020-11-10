import axios from 'axios'

export const TIME_OUT = 1000  //请求超时时间
// export const ERR_OK = true  //请求成功返回状态，字段和后台统一
export const baseUrl = ''  //process.env.BASE_URL引入全局url，定义在全局变量process.env中，开发环境为了方便转发，值为空字符串

axios.defaults.timeout = TIME_OUT //请求超时时间

// 封装请求拦截
export function fetch(requestUrl, params = '') {
    return axios({
        url: requestUrl,
        method: 'post',
        data: {
            'body': params
        }
    })
}
import { fetch, baseUrl } from 'config/index'

export function loginUserNo(params) {
    return fetch(`${baseUrl}/a`, params)
}
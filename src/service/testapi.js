import request from './request'

export function getTestInfo(params) {
    return request({
        url: '/test',
        method: 'post',
        params
    })
}
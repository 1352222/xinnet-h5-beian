export default {
    text() {
        console.log('text01')
    },
    getParams(url) {
      const start = url.indexOf('?') + 1
      const orderCodeUrl = url.slice(start)
      const aOrderCodeUrl = orderCodeUrl.split('&')
      const params = {}
      for(let i=0; i<aOrderCodeUrl.length; i++) {
        const temp = aOrderCodeUrl[i].split('=')
        const key = temp[0]
        const val = temp[1]
        params[key] = val
      }
      return params
    },
    isPhone(val) {
      return /^1[3456789]\d{9}$/.test(val)
    }
}

export default function showSize (base64url) {
  // 获取base64图片大小，单位为字节
  let str = base64url.replace('data:image/jpeg;base64,', '')
  let equalIndex = str.indexOf('=')
  if (str.indexOf('=') > 0) {
    str = str.substring(0, equalIndex)
  }
  let strLength = str.length
  let fileSize = parseInt(strLength - (strLength / 8) * 2)

  return fileSize
}

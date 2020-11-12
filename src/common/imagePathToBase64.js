import { getLessLimitSizeImage, getBase64, getImageInfo } from './compressImage'

function setBase64Data(path, self) {
  return getBase64(path).then(res => {
    // 转换后赋值给imagesPath
    self.setData({
      imagePath: path,
      images: [path],
      imageBase64: res.data,
      done: true
    })
    return true
  })
}

export {
  setBase64Data
}

// 上传图片并转换base64，如过大于80kb压缩
export default function imagePathToBase64(path, self, canvasId) {
  return new Promise((resolve, reject) => {
    wx.getFileInfo({
      filePath: path,
      success(res) {
        // 大于80kb压缩并上传
        if (res.size > 1024 * 80) {
          console.log('图片超过80KB大小，实际' + (res.size / 1024) +'kb')
          const systemInfo = wx.getSystemInfoSync()
          const width = systemInfo.windowWidth
          getLessLimitSizeImage(canvasId, path, 80, width, (imagePath) => {
            setBase64Data(imagePath, self).then(() => {
              resolve()
            })
          })
        } else {
          console.log('图片小于80KB，实际' + (res.size / 1024) +'kb')
          getImageInfo(path).then(res => {
            setBase64Data(res.path, self).then(() => {
              resolve()
            })
          })
        }
      }
    })
  })
}


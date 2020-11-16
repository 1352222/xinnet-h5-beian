
// 判断图片大小是否满足需求
function imageSizeIsLessLimitSize(imagePath, limitSize, lessCallBack, moreCallBack) {
  wx.getFileInfo({
    filePath: imagePath,
    success(res) {
      console.log("compressImage-7-压缩前图片大小:", res.size / 1024, 'kb')
      if (res.size > 1024 * limitSize) {
        moreCallBack()
      } else {
        lessCallBack()
      }
    }
  })
}

// 利用cavas进行压缩  每次压缩都需要ctx.draw()  wx.canvasToTempFilePath()连用
function getCanvasImage(canvasId, imagePath, imageW, imageH, getImgsuccess) {
  const ctx = wx.createCanvasContext(canvasId)
  ctx.drawImage(imagePath, 0, 0, imageW, imageH)
  ctx.draw(false, function () {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      fileType: 'jpg',
      x: 0,
      y: 0,
      width: imageW,
      height: imageH,
      quality: 1,
      success: function (res) {
        getImgsuccess(res.tempFilePath)
      }
    })
  })
}

/**
 * 获取小于限制大小的Image, limitSize默认为80KB，递归调用。
 */
function getLessLimitSizeImage(canvasId, imagePath, limitSize = 80, drawWidth, callBack) {
  imageSizeIsLessLimitSize(imagePath, limitSize,
    (lessRes) => {
      callBack(imagePath)
    },
    (moreRes) => {
      wx.getImageInfo({
        src: imagePath,
        success(imageInfo) {
          console.log('compressimage-49-图片格式：' + imageInfo.type)
          if (imageInfo.type != 'jpg' && imageInfo.type != 'jpeg') {
            wx.showToast({
              title: '图片格式错误!',
              icon: 'none',
              duration: 3000
            })
            return
          }

          const maxSide = Math.max(imageInfo.width, imageInfo.height)
          // 画板的宽高默认是windowWidth
          const windowW = drawWidth
          let scale = 1
          if (maxSide > windowW) {
            scale = windowW / maxSide
          }
          const imageW = Math.trunc(imageInfo.width * scale)
          const imageH = Math.trunc(imageInfo.height * scale)

          getCanvasImage(canvasId, imagePath, imageW, imageH,
            (pressImgPath) => {
              getLessLimitSizeImage(canvasId, pressImgPath, limitSize, drawWidth * 0.95, callBack)
            }
          )
        }
      })
    }
  )
}

// 图片转basee64 io操作 使用异步方式
function getBase64(img) {
  return new Promise(function (resolve, reject) {
    wx.getFileSystemManager().readFile({
      filePath: img,
      encoding: 'base64',
      success(data) {
        resolve(data)
      },
      fail(error) {
        wx.showToast({
          title: error.errMsg,
          icon: 'none',
          duration: 3000
        })
      }
    })
  })
}

function getFileInfo(filePath) {
  return new Promise(resolve => {
    wx.getFileInfo({
      filePath,
      success(res) {
        resolve(res)
      },
      fail(error) {
        wx.showToast({
          title: error.errMsg,
          icon: 'none',
          duration: 3000
        })
      }
    })
  })
}

function getImageInfo(path) {
  return new Promise(resolve => {
    wx.getImageInfo({
      // 服务器返回的图片地址
      src: path,
      success(res) {
        resolve(res)
      },
      fail(error) {
        wx.showToast({
          title: error,
          icon: 'none',
          duration: 3000
        })
      }
    })
  })
}

// 压缩图片一次
function compressImage(canvasId, imagePath, imageW, imageH, quality, getImgsuccess) {
  const ctx = wx.createCanvasContext(canvasId)
  ctx.drawImage(imagePath, 0, 0, imageW, imageH)
  ctx.draw(false, function () {
    wx.canvasToTempFilePath({
      canvasId: canvasId,
      fileType: 'jpg',
      x: 0,
      y: 0,
      width: imageW,
      height: imageH,
      quality,
      success: function (res) {
        getImgsuccess(res.tempFilePath)
      }
    })
  })
}

export {
  getLessLimitSizeImage,
  imageSizeIsLessLimitSize,
  getCanvasImage,
  getBase64,
  getFileInfo,
  getImageInfo,
  compressImage
}

<template>
  <div class="video-step3">
    <div class="body">
      <div class="title">网站核验照片</div>
      <div>
        <div class="video">
          <viewer>
            <img class="image" :src="image" />
          </viewer>
        </div>
        <div class="video-desc">点击查看核验照片</div>
        <div class="video-error">
          <text>温馨提示：如出现闭眼、歪头等不清晰的情况请重新拍摄</text>
        </div>
      </div>
    </div>

    <div class="desc" v-if="showErrorInfo">
      <img class="error-icon" :src="warnImage" />
      <text>{{errorInfo}}</text>
    </div>
    <div class="foot clearfix">
      <mt-button class="btn default" @click="restart">重拍</mt-button>
      <mt-button class="btn primary btn-primary-bg" @click="submit">完成</mt-button>
    </div>

    <canvas width="512" height="512" class="canvas-hidden" ref="video" />
  </div>
</template>

<script>
import { Toast, Indicator } from 'mint-ui'
// import getAttachmentParam from '../../common/getAttachmentParam'
const app = { globalData: {} }

export default {
  data() {
    return {
      prefix: 'data:image/jpeg;base64,',
      // 原图片
      rawImage: '',
      // 原图片base64
      rawImageBase64: '',
      // 合成图base64格式
      image: '',
      // 合成base64图
      imageBase64: '',
      showErrorInfo: false,
      errorInfo: '',
      // 合成背景图
      bgtImage: '../../../static/image/verify_bg.jpg',
      warnImage: '../../../static/image/warn.png'
    }
  },
  mounted() {
    const { videoVerifyImage, screenState, images, serverPath } = app.globalData
    const self = this
    if (screenState == 'right') {
      const image = serverPath + images.screen.filePath
      self.screenState = screenState
      self.image = image
      self.rawImage = image
    } else {
      const rawImage = '../../../static/image/temp.jpg' || videoVerifyImage
      self.rawImage = rawImage
      self.promise = self.mergeImage()
    }
  },
  onunMounted() {
    this.promise = null
  },
  methods: {
    mergeImage() {
      return new Promise((resolve) => {
        const { rawImage, bgtImage, prefix } = this
        const mainWidth = 384
        const sideWidth = 64
        const width = mainWidth + 2 * sideWidth
        const height = 512
        const canvas = this.$refs.video
        const ctx = canvas.getContext('2d')

        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          const img2 = new Image()
          img2.onload = () => {
            ctx.drawImage(img2, sideWidth, 0, mainWidth, height)
            const res = canvas.toDataURL('image/jpg')
            this.image = res
            resolve(this.image)
          }
          img2.src = rawImage
        }
        img.src = bgtImage
      })
    },

    getData() {
      const { icp, images } = app.globalData
      const screenImage = icp.icpAttachmentOrders.reduce((res, image) => {
        // 重新获取幕布图片
        if (image.filePurpose == 5) {
          res['screen'] = image
        }
        return res
      }, {})
      const newImage = Object.assign(images, screenImage)
      app.globalData.images = newImage
      return newImage
    },

    restart() {
      const { orderCode, phone, screenState } = app.globalData
      const self = this

      if (screenState == 'right') {
        Toast({ message: '请稍后..' })
        // 获取到幕布图片数据
        this.request({
          url: `${app.globalData.apiPath}/checkPhone?orderCode=${orderCode}&phone=${phone}`,
          success(res) {
            const { data } = res
            if (data.code == 'success') {
              app.globalData.icp = data.data
              const images = self.getData()
              if (images.screen && images.screen.id) {
                // 重拍先删除幕布图片，成功后回退
                const param = `attachmentOrderIds=${images.screen.id}`
                this.request({
                  url: `${app.globalData.apiPath}/deleteAttachment?${param}`,
                  success(res) {
                    Indicator.close()
                    const { code, data, message } = res.data
                    if (code == 'success') {
                      self.screenState = 'none'
                      app.globalData.screenState = 'none'
                      self.$router.push('/video_verify/step1')
                    } else {
                      Toast({ message: message, duration: 3000 })
                    }
                  }
                }, () => Indicator.close())
              }
            } else {
              Toast({ message: data.message, duration: 3000 })
            }
          }
        })
      } else {
        this.$router.push('/video_verify/step1')
      }
    },

    setErrorInfo(showErrorInfo = false, errorInfo = '') {
      this.showErrorInfo = showErrorInfo
      this.errorInfo = errorInfo
    },

    submitData(data) {
      const self = this
      this.request({
        url: `${app.globalData.apiPath}/saveAttachment`,
        method: 'POST',
        data,
        success(res) {
          Indicator.close()
          const { code, message } = res.data
          if (code == 'success') {
            self.setErrorInfo()
            self.$router.push('/list')
          } else {
            Toast({ message: message, duration: 3000 })
          }
        }
      })
    },

    submit() {
      const { screenState } = this
      if (screenState == 'right') {
        this.$router.push('/list')
        return
      }

      const self = this
      Indicator.open({ text: '请稍后..' })
      this.promise.then((mergeImage) => {
        wx.getFileSystemManager().readFile({
          filePath,
          encoding: 'base64',
          success: res => {
            const checkData = {
              orderCode: app.globalData.orderCode,
              checkAttachment: {
                ...getAttachmentParam({
                  isWebsiteChecklist: '0',
                  filePurpose: 5,
                  picSequenceNum: '1',
                  fileState: 'MERGE',
                  type: 'WEBSITE',
                  byteFile: this.rawImageBase64
                })
              }
            }

            const array = wx.base64ToArrayBuffer(res.data)
            const byteFile = wx.arrayBufferToBase64(array)
            const data = {
              orderCode: app.globalData.orderCode,
              checkAttachment: {
                ...getAttachmentParam({
                  isWebsiteChecklist: '0',
                  filePurpose: 5,
                  picSequenceNum: '1',
                  fileState: 'MERGE',
                  type: 'WEBSITE',
                  byteFile
                })
              }
            }

            const { orderType } = app.globalData
            const NewCheckIn = orderType == 'NEW_CHECK_IN'
            const ChangeCheckIn = orderType == 'CHANGE_CHECK_IN'
            if (NewCheckIn || ChangeCheckIn) {
              self.submitData(data)
            } else {
              this.request({
                url: `${app.globalData.apiPath}/identify`,
                method: 'POST',
                data: checkData,
                success(res) {
                  Indicator.close()
                  const { code, message } = res.data
                  if (code == 'success') {
                    self.submitData(data)
                  } else {
                    self.setErrorInfo(true, message)
                  }
                }
              })
            }
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.video-step3 {
  width: 100%;
  height: 100%;
  background: #e4eaf6;
}

.body {
  background: #fff;
  padding: 20px 0 40px;
}

.video {
  display: table;
  width: 221px;
  height: 140px;
  color: #fff;
  margin: 20px auto;
}

.video .image2 {
  display: table-cell;
  width: 178px;
  height: 140px;
}

.video .image {
  display: table-cell;
  width: 221px;
  height: 140px;
}

.video .xinnet {
  display: table-cell;
  vertical-align: middle;
  width: 9px;
  line-height: 9px;
  font-size: 9px;
  padding: 0 7px;
  height: 140px;
  background-color: #00bff3;
}

.video .code {
  display: table-cell;
  vertical-align: middle;
  width: 6px;
  padding: 0 7px;
  word-break: break-all;
  line-height: 9px;
  font-size: 9px;
  height: 140px;
  background-color: #00bff3;
}

.l1 .text, .l3 .text {
  display: inline-block;
  margin-top: 50%;
}

.video-desc {
  font-size: 13px;
  color: #333;
  text-align: center;
}

.video-error {
  font-size: 11px;
  line-height: 11px;
  color: #ff001d;
  text-align: center;
  margin-top: 10px;
}

.desc {
  font-size: 13px;
  line-height: 13px;
  color: #ff001d;
  text-align: left;
  margin: 20px 15px 0;
}

.title {
  font-size: 15px;
  color: #1b1b20;
  margin: auto 15px;
}

.foot {
  margin: 25px 15px;
}

.foot .btn {
  width: 165px;
  height: 45px;
  border-radius: 2px;
  font-size: 18px;
  line-height: 30px;
  font-weight: normal;
}

.foot .default {
  float: left;
  color: #333;

}

.foot .primary {
  float: right;
  color: #fff;
}

.btn-primary-bg {
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}

.canvas-hidden {
  position: absolute;
  top: -10000px;
  left: 0;
}
</style>

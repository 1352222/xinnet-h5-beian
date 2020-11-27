<template>
  <div class="video-step3">
    <div class="body">
      <div class="title">网站核验照片</div>
      <div>
        <div class="video" v-if="mergeImageBase64">
          <viewer>
            <img class="image" :src="mergeImageBase64" mode="aspectFill" />
          </viewer>
        </div>
        <div class="video-desc">点击图片查看核验照片</div>
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
    <canvas width="384" height="384" class="canvas-hidden2" ref="rawImageVideo" />
  </div>
</template>

<script>
import getAttachmentParam from '../../common/getAttachmentParam'
import { mapState, mapMutations } from 'vuex'
import { Toast, Indicator } from 'mint-ui'
import bgtImage from '../../../static/image/verify_bg.jpg'
import warnImage from '../../../static/image/warn.png'

export default {
  data() {
    return {
      prefix: 'data:image/jpeg;base64,',
      // 原图片
      rawImage: '',
      // 原图片base64
      rawImageBase64: '',
      // 合成图base64格式
      mergeImageBase64: '',
      showErrorInfo: false,
      errorInfo: '',
      // 合成背景图
      bgtImage,
      warnImage
    }
  },
  mounted() {
    this.setDocumentTitle('备案核验照片')
    if (this.globalData.orderCode) {
      this.onLoad()
    } else {
      this.$watch('globalData.loading', loading => {
        if (!loading) {
          this.onLoad()
        }
      })
    }
  },
  destroyed() {
    this.promise = null
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData
    })
  },
  methods: {
    onLoad() {
      const { videoVerifyImage, screenState, images, serverPath } = this.globalData
      const self = this
      if (screenState === 'right') {
        const image = serverPath + images.screen.filePath
        self.screenState = screenState
        self.mergeImageBase64 = image
      } else {
        const rawImage = videoVerifyImage
        self.rawImage = rawImage
        self.promise = self.mergeImage()
      }
    },
    ...mapMutations({
      setData: 'SET_DATA'
    }),
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
            const res = canvas.toDataURL('image/jpeg', 0.5)
            this.mergeImageBase64 = res
            resolve(this.mergeImageBase64)
          }
          img2.src = prefix + rawImage
        }
        img.src = bgtImage

        const canvas2 = this.$refs.rawImageVideo
        const ctx2 = canvas2.getContext('2d')
        const image = new Image()
        image.onload = () => {
          ctx2.drawImage(image, 0, 0, 384, 384)
          const res = canvas2.toDataURL('image/jpeg', 0.5)
          this.rawImageBase64 = res
        }
        image.src = prefix + rawImage
      })
    },

    getData() {
      const { icp, images } = this.globalData
      const screenImage = icp.icpAttachmentOrders.reduce((res, image) => {
        // 重新获取幕布图片
        if (image.filePurpose == 5) {
          res['screen'] = image
        }
        return res
      }, {})
      const newImage = Object.assign(images, screenImage)
      this.setData({ images: newImage })
      return newImage
    },

    restart() {
      const { orderCode, phone, screenState } = this.globalData
      const self = this

      if (screenState === 'right') {
        // Toast({ message: '请稍后..' })
        // 获取到幕布图片数据
        self.request({
          url: `/checkPhone?orderCode=${orderCode}&phone=${phone}`,
          success(data) {
            const res = data.data
            if (res.code === 'success') {
              self.setData({ icp: res.data })
              const images = self.getData()
              if (images.screen && images.screen.id) {
                // 重拍先删除幕布图片，成功后回退
                const param = `attachmentOrderIds=${images.screen.id}`
                self.request({
                  url: `/deleteAttachment?${param}`,
                  success(res) {
                    Indicator.close()
                    const { code, message } = res.data
                    if (code == 'success') {
                      self.screenState = 'none'
                      self.setData({ screenState: 'none' })
                      self.$router.push('/video_verify/step1')
                    } else {
                      Toast({ message: message, duration: 3000, className: 'noticeError' })
                    }
                  }
                }, () => Indicator.close())
              }
            } else {
              Toast({ message: data.message, duration: 3000, className: 'noticeError' })
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
        url: `/saveAttachment`,
        method: 'POST',
        data,
        success(res) {
          Indicator.close()
          const { code, message } = res.data
          if (code == 'success') {
            self.setErrorInfo()
            self.$router.push('/list')
          } else {
            Toast({ message: message, duration: 3000, className: 'noticeError' })
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
      this.promise.then((mergeImageBase64) => {
        const checkData = {
          orderCode: self.globalData.orderCode,
          checkAttachment: {
            ...getAttachmentParam({
              isWebsiteChecklist: '0',
              filePurpose: 5,
              picSequenceNum: '1',
              fileState: 'MERGE',
              type: 'WEBSITE',
              byteFile: this.rawImageBase64.slice(23)
            }, self.globalData)
          }
        }

        const data = {
          orderCode: self.globalData.orderCode,
          checkAttachment: {
            ...getAttachmentParam({
              isWebsiteChecklist: '0',
              filePurpose: 5,
              picSequenceNum: '1',
              fileState: 'MERGE',
              type: 'WEBSITE',
              byteFile: mergeImageBase64.slice(23)
            }, self.globalData)
          }
        }

        const { orderType } = self.globalData
        const NewCheckIn = orderType == 'NEW_CHECK_IN'
        const ChangeCheckIn = orderType == 'CHANGE_CHECK_IN'
        if (NewCheckIn || ChangeCheckIn) {
          self.submitData(data)
        } else {
          this.request({
            url: `/identify`,
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

.canvas-hidden2 {
  position: absolute;
  top: -10000px;
  left: 10000px;
}
</style>

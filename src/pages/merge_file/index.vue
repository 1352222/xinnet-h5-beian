<template>
  <div id="merge_file">
    <div class="compound-img">
      <span class="borders top-left-border" />
      <span class="borders top-right-border" />
      <span class="borders bottom-left-border" />
      <span class="borders bottom-right-border" />
      <img v-if="imagePath" class="compound-imgs" :src="imagePath"/>
      <img v-else class="compound-imgs" src="~@/assets/compound.jpg"/>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import { Toast } from 'mint-ui'
export default {
  name: "Merge_file",
  data() {
    return {
      imagePath: '',
      imageBase64: '',
      defaultPath: '../../assets/compound.jpg',
      // 未使用
      images: [],
      image: [],
      done: false,
    }
  },
  props: {
    type: {
      type: String,
      default: ''
    }
  },
  methods: {
    setImages(imagePath, image) {
      this.imagePath = imagePath
      this.done = true
      this.image = image
      // imagePathToBase64(imagePath, this, 'Canvas')
      // console.log(imagePath, image, 'iimage12')
    },
    setImage(imagePath, image) {
      this.imagePath = imagePath
      this.done = true
      this.image = image
      // this.setData({ imagePath, done: true, image })
      imagePathToBase64(imagePath, this, 'Canvas')
    },
    clearImage() {
      const self = this
      const image = this.image
      let param = ''

      if (image.length > 1) {
        param = `attachmentOrderIds=${image[0].id}&attachmentOrderIds=${image[1].id}`
      } else if (image.length === 1) {
        param = `attachmentOrderIds=${image[0].id}`
      }
      // 服务器获取图片调用接口删除
      if (param) {
        $.ajax({
          url: `/api/miniprogram/deleteAttachment?${param}`,
          success(res) {
            const { code, data, message } = res.data
            if (code === 'success') {
              self.clearImageData()
            } else {
              Toast({
                message: message,
                duration: 3000
              })
            }
          }
        })
      } else {
        this.clearImageData()
      }
    },
    // 企业删除网站负责人合成照
    // 个人备案删除主体，网站负责人两张合成照
    clearImageData() {
      const { type, image } = this
      if (image.length > 1) {
        const key1 = `orgCertificate3`
        const key2 = `websiteCertificate3`
        const currentImage1 = this.globalData.images[key1]
        if (currentImage1) {
          let globalDatas = globalData
          globalDatas.images[key1] = {}
          self.setData(globalDatas)
        }
        const currentImage2 = this.globalData.images[key2]
        if (currentImage2) {
          let globalDatas = globalData
          globalDatas.images[key2] = {}
          self.setData(globalDatas)
        }
      } else {
        let key = `${type}Certificate3`
        let currentImage = this.globalData.images[key]
        if (currentImage) {
          let globalDatas = globalData
          globalDatas.images[key] = {}
          self.setData(globalDatas)
        }
      }
      this.imagePath = ''
      this.imageBase64 = ''
      this.image = []
      this.done = false
      // this.setData({ imagePath: '', imageBase64: '', image: [], done: false })
    },
    // 保存处理完的图片数据
    setImageData(path, orgDone, cb) {
      const self = this
      self.imagePath = path
      self.done = true
      // 如果所有附件上传完成，执行回调
      if (orgDone) {
        cb()
      }
      getBase64(path).then(res => {
        const imageBase64 = res.data
        self.imageBase64 = imageBase64
      })
    },
    toCompressImage(path, completeCb) {
      getFileInfo(path).then(res => {
        const { size } = res
        if (size > 1024 * 80) {
          console.log('mergefile112-大于80KB开始压缩：' + size)
          // 图片质量最低20，如果仍大于80kb压缩尺寸
          const systemInfo = wx.getSystemInfoSync()
          const width = systemInfo.windowWidth
          console.log(path)
          getLessLimitSizeImage('Canvas', path, 80, width, completeCb)
        } else {
          console.log('mergefile124-小于80KB：' + size)
          completeCb(path)
        }
      })
    },
    mergeImage(frontPath, sidePath, orgDone, cb) {
      const ctx = wx.createCanvasContext('Canvas')
      const systemInfo = wx.getSystemInfoSync()
      const self = this
      const newFrontPath = getImageInfo(frontPath)
      const newSidePath = getImageInfo(sidePath)
      const width = 580
      const height = 720 / 2
      // wx.showLoading({ title: '合成中..', mask: true })
      Indicator.open('合成中..')
      return Promise.all([newFrontPath, newSidePath]).then(result => {
        const [oFront, oSide] = result
        ctx.drawImage(oFront.path, 0, 0, width, height)
        ctx.drawImage(oSide.path, 0, height, width, height)
        console.log('绘图合并完成，开始draw')
        ctx.draw(false, function () {
          wx.canvasToTempFilePath({
            canvasId: 'Canvas',
            fileType: 'jpg',
            x: 0,
            y: 0,
            width,
            height: height * 2,
            // quality: 0.2,
            quality: 1,
            success(res) {
              self.setImageData(res.tempFilePath, orgDone, cb)
              Indicator.close()
              // self.toCompressImage(res.tempFilePath, path => {
              //   self.setImageData(path, orgDone, cb)
              //   wx.hideLoading()
              // })
            }
          })
        })
      })
    },
    ...mapMutations({
      setData: "SET_DATA",
    }),
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData,
    }),
  },
}
</script>
<style scoped>
/* 身份证合成照 */
.compound-img {
  position: relative;
  background: #f4f8fe;
  position: relative;
  width: 162px;
  height: 180px;
  margin: 0 auto 25px;
}

.borders {
  position: absolute;
  width: 10px;
  height: 10px;
}

.top-left-border {
  top: 7px;
  left: 25px;
  border-top: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.top-right-border {
  top: 7px;
  left: 127px;
  border-top: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.bottom-left-border {
  bottom: 7px;
  left: 25px;
  border-bottom: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.bottom-right-border {
  bottom: 7px;
  left: 127px;
  border-bottom: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.compound-imgs {
  width: 104px;
  height: 137px;
  margin-left: 30px;
  margin-top: 20px;
}
</style>

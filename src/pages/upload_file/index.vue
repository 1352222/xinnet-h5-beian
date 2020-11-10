<template>
  <div id="upload_file">
    <div class="weui-uploader__bd upload-bg upload-file">
      <div class="weui-uploader__files" id="uploaderFiles">
        <div v-for="(user, i) in images" :key="i">
          <div class="weui-uploader__file" @click="previewImage" :id="user.item" style="position:absolute;z-index:99;">
            <span  @click.capture="clearImage" data-type="dele" class="delete">×</span>
            <img src="~@/assets/close.png" catchtap="clearImage" data-type="dele" class="delete" />
            <img class="weui-uploader__img" :src="user.item" mode="aspectFill" />
          </div>
        </div>
        <!-- <div v-for="(user, i) in images">
          <div class="weui-uploader__file" bindtap="previewImage" :id="user.item" style="position:absolute;z-index:99;">
            <span catchtap="clearImage" data-type="dele" class="delete">×</span>
            <img src="~@/assets/close.png" catchtap="clearImage" data-type="dele" class="delete" />
            <img class="weui-uploader__img" :src="user.item" mode="aspectFill" />
          </div>
        </div> -->
      </div>

      <!-- <input type="file" @change="afiles" id="files" accept="image/*" multiple="multiple" capture="camera"> -->
      <div class="weui-uploader__input-box" style="border: none;">
        <!-- @click.capture="chooseImage" -->
        <div class="weui-uploader__input" data-type="upload">
          <div v-if="!images.length">
            <img v-if="type == 'org'" class="uploadbgs" src="~@/assets/hotunit.jpg" mode="aspectFill" />
            <img v-else-if="num == 2" class="uploadbgs" src="~@/assets/reverse-side.jpg" mode="aspectFill" />
            <img v-else class="uploadbgs" src="~@/assets/front.jpg" mode="aspectFill" />
          </div>
        </div>
      </div>
      <input type="file" style="z-index:99;opacity:0;" class="uploadbgsbot" @change="chooseImage" id="files" accept="image/*" multiple="multiple" capture="camera">
      <!-- <input type="file" id="takepicture" accept="image/*" class="uploadbgsbot" placeholder="" v-if="!images.length" @click="chooseImage" /> -->
      <span data-type="upload" @click="chooseImage" v-if="!images.length" class="uploadbgsbot">{{buttonText}}</span>

      <span class="borders top-left-border"></span>
      <span class="borders top-right-border"></span>
      <span class="borders bottom-left-border"></span>
      <span class="borders bottom-right-border"></span>
      <!-- <input type="file" accept="image/*" capture="camera">
      <input type="file" accept="video/*" capture="camcorder"> -->
    </div>

  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import $ from 'jquery'
export default {
    name: "Upload_file",
    data() {
        return {
          option: {},
          // 展示图片
          images: [],
          // 接口返回的图片信息
          image: {},
          imagePath: '',
          imageBase64: '',
          buttonText: '',
          // 上传完成
          done: false,
          arr: [1,2,3]
        }
    },
    props: {
      type: {
        type: String,
        default: 'org'
      },
      num: {
        type: Number,
        default: 1
      },
      id: {
        type: String
      },
      orgTitile: {
        type: Number
      }
    },
    mounted: function() {
      this.ready()
    },
    watch: {
      buttonText: {
        handler(newVal) {
          if(this.buttonText != newVal) {
            this.buttonText = newVal
          }
        }
      }
    },
    methods: {
      ready() {
        const { type, num, buttonText } = this
        if (type == 'org') {
          if (!buttonText) {
            this.buttonText = '点击拍摄营业执照'
          }
        } else if (num == 2) {
          this.buttonText = '点击拍摄国徽面'
        } else {
          this.buttonText = '点击拍摄头像面'
        }
      },
      afiles() {
        let file = $('#files')[0].files[0]
        let reader = new FileReader()
        console.log(file, reader, '11123')
      },
      setImage(imagePath, image) {
        const self = this
        this.imagePath = imagePath
        this.images = [imagePath]
        this.image = image
        this.done = true
        imagePathToBase64(imagePath, self, 'Canvas')
      },
      clearImage() {
        console.log(clearImage, 'clearImage11')
        const self = this
        const { id } = this.data.image
        // 服务器获取图片调用接口删除
        if (id) {
          const param = `attachmentOrderIds=${id}`
          $.ajax({
            url: `/api/miniprogram/deleteAttachment?${param}`,
            success(res) {
              const { code, data, message } = res.data
              if (code == 'success') {
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
      clearImageData() {
        this.images = []
        this.image = {}
        this.imagePath = ''
        this.imageBase64 = ''
        this.done = false
        // 清理附件数据
        const type = this.type
        const num = this.num
        const key = type == 'org' ? 'orgCertificate' : `${type}Certificate${num}`
        let currentImage = this.globalData.images[key]
        let globalDatas = globalData
        if (currentImage) {
          globalDatas.images[key] = {}
          this.setData(globalDatas)
        }
        this.triggerEvent('clearimage')
      },
      bytes(e) {
        let bytes = new Uint8Array(e.target.result)
        let binary = ''
        bytes.map(i => {
          binary += String.fromCharCode(bytes[i])
        })
        return window.btoa(binary)
      },
      chooseImage(event, num) {
        let takepicture = $('#takepicture')
        const self = this
        const cropperType = this.cropperType
        let file = event.target.files[0]
        let fd = new FormData()
        let reader = new FileReader()
        reader.onload = e => {
          console.log(e.target.result, 'e,file,event,td,reader,rrr')
          let data, datas
          if(typeof e.target.result === 'object') {
            // console.log(e.target, file, e.target.value, [e.target.result], new Blob([e.target.result]), window.URL.createObjectURL(new Blob([e.target.result])), 'w111')
            // data = this.bytes(e)
            let url = this.bytes(e)
            data = 'data:image/jpeg;base64,' + url
            datas = window.URL.createObjectURL(new Blob([e.target.result]))
          } else {
            data = e.target.result
          }
          this.option.img = data
          console.log(datas, 'ee112233')
          // this.$parent.cropImages(data)
          this.$parent.cropImagedata(datas)
        }
        reader.readAsArrayBuffer(file)
        // reader.readAsDataURL(file)
        // console.log(e, takepicture, cropperType, file, fd, 'chooseimage')
        // wx.chooseImage({
        //   // 默认9
        //   count: 1,
        //   // 可以指定是原图还是压缩图，默认二者都有
        //   sizeType: ['original', 'compressed'],
        //   // sizeType: ['compressed'],
        //   // 可以指定来源是相册还是相机，默认二者都有
        //   sourceType: ['camera'],
        //   success(res) {
        //     const tempFilePath = res.tempFilePaths[0]
        //     const tempFilesSize = res.tempFiles[0].size
        //     self.triggerEvent('cropperimage', { src: tempFilePath })
        //   },
        //   fail() {
        //     self.triggerOnShow = true
        //   }
        // })
      },
          // this指向有问题应该是调用时影响的，压缩完成回调
      completeCb(path) {
        const self = this
        getBase64(path).then(res => {
          // 转换后赋值给imagesPath
          self.setData({
            imagePath: path,
            images: [path],
            imageBase64: res.data,
            done: true
          })
          self.triggerEvent('chooseimage')
        })
      },
      getCropperImage(tempFilePath) {
        const self = this
        const path = tempFilePath
        Indicator.open('请稍后...')
        getFileInfo(path).then(res => {
          // if (res.size > 1024 * 80) {
          //   wx.hideLoading()
          //   wx.showLoading({ title: '压缩中..', mask: true })
          //   this.toCompressImage(path, 20)
          // } else {
          Indicator.close()
          getImageInfo(path).then(res => {
            self.completeCb(res.path)
          })
            // }
        })
      },
      toCompressImage(path, quality = 20) {
        const self = this
        wx.compressImage({
          src: path,
          quality,
          success(res) {
            const filePath = res.tempFilePath
            getFileInfo(filePath).then(res => {
              const { size } = res
              // 大于80kb压缩并上传
              if (size > 1024 * 80) {
                console.log('uploadfile-166-大于80KB开始压缩：' + size)
                const systemInfo = wx.getSystemInfoSync()
                const width = systemInfo.windowWidth
                getLessLimitSizeImage('Canvas', filePath, 80, width, path => {
                  getImageInfo(path).then(res => {
                    console.log('uploadfile-171压缩完成')
                    // wx.hideLoading()
                    Indicator.close()
                    self.completeCb(res.path)
                  })
                })
              } else {
                console.log('uploadfile-177-图片小于80KB，实际' + (size / 1024) +'kb')
                getImageInfo(path).then(res => {
                  // wx.hideLoading()
                  Indicator.close()
                  self.completeCb(res.path)
                })
              }
            })
          }
        })
      },
      previewImage(e) {
        console.log(e, 'ee11')
        this.triggerOnShow = true
        // wx.previewImage({
        //   // 当前显示图片的http链接
        //   current: e.currentTarget.id,
        //   // 需要预览的图片http链接列表
        //   urls: this.data.images
        // })
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
.upload-bg {
  display: inline-block;
  background: #f4f8fe;
  width: 162px;
  border-radius: 5px;
  height: 110px;
}

.uploadbgs {
  height: 65px;
  width: 100px;
  position: absolute;
  left: 32px;
  top: 26px;
  background: #f00;
}
.uploadbgsbot {
  z-index: 9;
  height: 30px;
  background: #317ddb;
  font-size: 12px;
  position: absolute;
  bottom: -23px;
  color: #fff;
  width: 162px;
  text-align: center;
  line-height: 30px;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.upload-file {
  position: relative;
}

.borders {
  position: absolute;
  width: 10px;
  height: 10px;
}
.top-left-border {
  top: 22px;
  left: 25px;
  border-top: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.top-right-border {
  top: 22px;
  left: 127px;
  border-top: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.bottom-left-border {
  top: 85px;
  left: 25px;
  border-bottom: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.bottom-right-border {
  top: 85px;
  left: 127px;
  border-bottom: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}

.weui-uploader__img {
  height: 65px;
  width: 100px;
  position: absolute;
  left: 32px;
  top: 20px;
}
.weui-uploader__input {

}
.weui-uploader__input-box {
  width: 100%;
  background: transparent;
}
.weui-uploader__input-box:after,.weui-uploader__input-box:before {
  height: 0;
  color: transparent;
  background: transparent;
}

.delete {
  position:absolute;
  left:146px;
  z-index:999;
  top:-12px;
  display: inline-block;
  width: 20px;
  height: 20px;
  font-size: 20px;
  color: #fff;
  border-radius: 25%;
  text-align: center;
  line-height: 19px;
}


</style>

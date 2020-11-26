<template>
  <div id="upload_file">
    <div  class="weui-uploader__bd upload-bg upload-file">
      <div class="weui-uploader__files" id="uploaderFiles">
        <!-- {{data.images ? data.images : ''}} -->
        <div v-for="(user, i) in (data.images ? data.images : images)" :key="i">
          <div class="weui-uploader__file" :id="user.item" style="position:absolute;z-index:99;">
            <span  @click.capture="clearImage" data-type="dele" class="delete">×</span>
            <img src="~@/assets/close.png" @click="clearImage" data-type="dele" class="delete" />
            <viewer>
              <img class="weui-uploader__img" :src="user" mode="aspectFill" />
            </viewer>
          </div>
        </div>
      </div>

      <!-- <input type="file" @change="afiles" id="files" accept="image/*" multiple="multiple" capture="camera"> -->
      <div class="weui-uploader__input-box" style="border: none;">
        <!-- @click.capture="chooseImage" -->
        <div class="weui-uploader__input" data-type="upload">
          <div v-if="(data.images ? data.images : images)==undefined || JSON.stringify(data.images ? data.images : images)=='[]'">
            <img v-if="type === 'org'" class="uploadbgs" src="~@/assets/hotunit.jpg" mode="aspectFill" />
            <img v-else-if="num == 2" class="uploadbgs" src="~@/assets/reverse-side.jpg" mode="aspectFill" />
            <img v-else class="uploadbgs" src="~@/assets/front.jpg" mode="aspectFill" />
          </div>
        </div>
      </div>
      <input type="file" style="z-index:99;opacity:0;" class="uploadbgsbot" @change="chooseImage" id="files" accept="image/*" multiple="multiple" v-if="(data.images ? data.images : images)==undefined || JSON.stringify(data.images ? data.images : images)=='[]'" capture="camera">
      <!-- <input type="file" id="takepicture" accept="image/*" class="uploadbgsbot" placeholder="" v-if="!images.length" @click="chooseImage" /> -->
      <span data-type="upload" @click="chooseImage" v-if="(data.images ? data.images : images)==undefined || JSON.stringify(data.images ? data.images : images)=='[]'" class="uploadbgsbot">{{buttonText}}</span>

      <span class="borders top-left-border"></span>
      <span class="borders top-right-border"></span>
      <span class="borders bottom-left-border"></span>
      <span class="borders bottom-right-border"></span>
      <!-- <input type="file" accept="image/*" capture="camera">
      <input type="file" accept="video/*" capture="camcorder"> -->

      <canvas
        class="canvas-hidden"
        ref="canvas"
        style="width: 580px; height: 360px;"
        canvas-id="Canvas"
      />
    </div>

  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { Toast } from 'mint-ui'
// import $ from 'jquery'
export default {
  name: 'Upload_file',
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
      done: false
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
    },
    data: {
      type: Object
    }
  },
  mounted: function () {
    this.ready()
    this.$watch('data.buttonText', newVal => {
      if (newVal) {
        this.buttonText = newVal
      }
    })
  },
  methods: {
    ready() {
      const { type, num, buttonText } = this
      if (type === 'org') {
        if (!buttonText) {
          this.buttonText = '点击拍摄营业执照'
        }
      } else if (num == 2) {
        this.buttonText = '点击拍摄国徽面'
      } else {
        this.buttonText = '点击拍摄头像面'
      }
    },
    // afiles() {
    //   let file = $('#files')[0].files[0]
    //   let reader = new FileReader()
    // },
    setImage(imagePath, image) {
      // const self = this
      this.imagePath = imagePath
      this.images = [imagePath]
      this.image = image
      this.done = true
      // imagePathToBase64(imagePath, self, 'Canvas')
    },
    clearImage() {
      const self = this
      const { id } = this.image
      // // 服务器获取图片调用接口删除
      if (id) {
        const phone = window.sessionStorage.getItem('phone')
        const orderCode = window.sessionStorage.getItem('orderCode')
        if (orderCode) {
          let globalDatas = this.globalData
          globalDatas.loading = true
          self.setData(globalDatas)
          let url = `/checkPhone?orderCode=${orderCode}&phone=${phone}`
          if (!phone) {
            url = `/checkPhone?orderCode=${orderCode}`
          }
          self.request({
            url,
            success(data) {
              const res = data.data
              if (res.code === 'success') {
                const param = `attachmentOrderIds=${id}`
                self.request({
                  url: `/deleteAttachment?${param}`,
                  success(data) {
                    const res = data.data
                    const { code, message } = res
                    if (code === 'success') {
                      self.clearImageData()
                    } else {
                      Toast({
                        message: message,
                        duration: 3000,
                        className: 'noticeError'
                      })
                    }
                  }
                })
              } else {
                if (res.message === '备案信息已提交审核') {
                  self.$router.push('/login')
                }
                Toast({
                  message: res.message,
                  duration: 3000,
                  className: 'noticeError'
                })
              }
            },
            error() {
              let globalDatas = self.globalData
              globalDatas.loading = false
              self.setData(globalDatas)
            }
          })
        }
      } else {
        self.clearImageData()
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
      const key = type === 'org' ? 'orgCertificate' : `${type}Certificate${num}`
      let currentImage = this.globalData.images[key]
      let globalDatas = this.globalData
      if (currentImage) {
        globalDatas.images[key] = {}
        this.setData(globalDatas)
      }
      this.$parent.clearImage(this.id)
      // this.triggerEvent('clearimage')
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
      const isChoose = (this.data.images ? this.data.images : this.images) == undefined || JSON.stringify(this.data.images ? this.data.images : this.images) == '[]'
      if (!isChoose) {
        return false
      }
      // let takepicture = $('#takepicture')
      // const self = this
      // const cropperType = this.cropperType
      let file = event.target.files[0]
      // let fd = new FormData()
      let reader = new FileReader()
      reader.onload = e => {
        let data, datas
        if (typeof e.target.result === 'object') {
          // data = this.bytes(e)
          let url = this.bytes(e)
          data = 'data:image/jpeg;base64,' + url
          datas = window.URL.createObjectURL(new Blob([e.target.result]))
        } else {
          data = e.target.result
        }
        this.option.img = data
        // this.$parent.cropImagedata(datas, file, this.id, data)
        event.target.value = ''

        let canvas = this.$refs.canvas
        let ctx = canvas.getContext('2d')
        const img = new Image()
        img.src = datas
        img.onload = () => {
          canvas.width = img.height
          canvas.height = img.width
          if (img.width > img.height) {
            this.$parent.cropImagedata(datas, file, this.id, data)
          } else {
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(270 * Math.PI / 180)
            ctx.drawImage(img, -canvas.height / 2, -canvas.width / 2)
            const res = canvas.toDataURL('image/jpeg')
            this.$parent.cropImagedata(res, file, this.id, data)
          }
        }
      }
      reader.readAsArrayBuffer(file)
    },
    ...mapMutations({
      setData: 'SET_DATA'
    })
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData
    })
  }
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
  /* z-index: 9; */
  height: 30px;
  background: #317ddb;
  font-size: 12px;
  position: absolute;
  bottom: -23px;
  left: 0px;
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
  top: 26px;
}
.weui-uploader__input {
}
.weui-uploader__input-box {
  width: 100%;
  background: transparent;
}
.weui-uploader__input-box:after,
.weui-uploader__input-box:before {
  height: 0;
  color: transparent;
  background: transparent;
}

.delete {
  position: absolute;
  left: 146px;
  z-index: 999;
  top: -12px;
  display: inline-block;
  width: 20px;
  height: 20px;
  font-size: 20px;
  color: #fff;
  border-radius: 25%;
  text-align: center;
  line-height: 19px;
}
.canvas-hidden {
  display: none;
  position: absolute;
  top: -10000px;
  left: 0;
}
</style>

<template>
<div class="video-step2">
  <input @change="changeCamera" style="display: none;" type="file" ref="camera" accept="video/*" capture="user" />
  <div v-if="videoStep == 1" class="call-camera" @click="callCamera">
    <p>
      请返回上一页重新获取核验码
      <br><br>
      轻触屏幕继续拍摄
    </P>
  </div>
  <div v-if="videoStep == 2">
    <div class="body">
      <div>
        <div class="video-wrap">
          <img :src="videoImage" class="video" alt="video" width="200" height="200" />
          <!-- <video v-if="deviceSystem == 'android'" ref="video" class="video" controls="controls">
            <source :src="videoSrc" type="video/mp4" />
          </video>
          <video v-else ref="video" class="video" controls="controls" muted autoplay>
            <source :src="videoSrc" type="video/mp4" />
          </video> -->
        </div>
        <div class="video-desc">视频拍摄完毕，请点击确认使用上传</div>
        <div class="video-error" v-if="showError">
          <img class="error-icon" :src="warnImage" />
          <text>{{error}}</text>
        </div>
      </div>
    </div>

    <div class="foot clearfix">
      <mt-button class="btn default first" @click="restart">重新拍摄</mt-button>
      <mt-button :disabled="disabled" class="btn primary btn-primary-bg" @click="submit">确认使用</mt-button>
    </div>
  </div>
</div>
</template>

<script>
import { Toast, Indicator } from 'mint-ui'
import { mapState, mapMutations } from 'vuex'
import $ from 'jquery'
import { MessageBox } from '../MessageBox/index.js'
import warnImage from '../../../static/image/warn.png'
import videoImage from '../../../static/image/video.png'
import 'mint-ui/lib/style.css'

const deviceSystem = (() => {
  let equipmentType = ''
  const agent = navigator.userAgent.toLowerCase()
  const android = agent.indexOf('android')
  const iphone = agent.indexOf('iphone')
  const ipad = agent.indexOf('ipad')
  if (android != -1) {
    equipmentType = 'android'
  }
  if (iphone != -1 || ipad != -1) {
    equipmentType = 'ios'
  }
  // console.log(equipmentType)
  return equipmentType
})()

export default {
  name: 'Video-step2',
  data() {
    return {
      // 录制步骤
      videoStep: 1,
      error: '人脸核验失败，请网站负责人按照要求重新拍摄',
      showError: false,
      num: '9 3 7 0',
      number: '',
      videoSrc: '',
      warnImage,
      videoImage,
      videoBlob: null,
      // 确定使用按钮状态
      disabled: false,
      deviceSystem
    }
  },
  mounted() {
    if (document.body.clientWidth <= 364) {
      $('.clearfix').css('justify-content', 'space-between')
      $('.clearfix').css('display', 'flex')
    }
    this.setDocumentTitle('拍摄核验视频')
    this.generateCode()
    this.showMessageBox()
  },
  destroyed() {
    MessageBox.close()
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData
    })
  },
  methods: {
    ...mapMutations({
      setData: 'SET_DATA'
    }),

    showMessageBox() {
      const options = {
        title: '',
        message: `<p style="font-size: 14px; color: #000;">请牢记如下核验码,并在拍摄视频时大声朗读<br><br><span style="font-size: 18px; font-weight: bold; color: #26a2ff;">${this.num}</span></p>`,
        confirmButtonClass: 'confirm-button'
      }
      MessageBox.executeCountdown()
      MessageBox(options).then(() => {
        this.callCamera()
      })
    },

    // 调用相机录像
    callCamera() {
      if (this.videoStep == 1) {
        const $camera = $(this.$refs.camera)
        $camera.attr('capture', 'camcorder')
        $camera.trigger('click')
      }
    },

    loadData(result) {
      const self = this
      self.videoSrc = result
      self.setDocumentTitle('核验视频确认')
      let arr = result.split(',')
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: 'video/mp4' })
      self.videoBlob = blob
      self.videoStep = 2
      console.log('loadData')
      self.$nextTick(() => {
        console.log('nextTick')
        Indicator.close()
        self.disabled = false
        Toast({ message: '录制成功！', duration: 3000, className: 'noticeError' })
        $(self.$refs.video).on('canplay', () => {
          console.log('canplay')
        })
        $(self.$refs.video).on('loadedmetadata', () => {
          console.log('loadedmetadata')
        })
        // $(self.$refs.video).on('canplay', () => {
        // const video = self.$refs.video
        // if (video) {
        //   Indicator.close()

        //   // 控制时长
        //   const min = 4
        //   const max = 7
        //   self.disabled = false
        //   console.log(video.duration)
        //   if (video.duration < min) {
        //     Toast({ message: '视频录制时长不足规定时长', duration: 3000, className: 'noticeError' })
        //     self.disabled = true
        //   } else if (video.duration >= max) {
        //     Toast({ message: '视频录制时长超过规定时长', duration: 3000, className: 'noticeError' })
        //     self.disabled = true
        //   } else {
        //     Toast({ message: '录制成功！', duration: 3000, className: 'noticeError' })
        //   }
        // }
        // })
      })
    },

    /* eslint-disable */
    async compressVideo(video) {
      const { createFFmpeg, fetchFile } = FFmpeg
      const ffmpeg = createFFmpeg({ log: true })
      console.log('ready load')
      await ffmpeg.load()
      console.log('ready write')
      // ajax文件后写入
      ffmpeg.FS('writeFile', '1.mp4', await fetchFile(video))
      console.log('ready run')
      // 压缩
      await ffmpeg.run('-i', '1.mp4', '-s', '480x272', '2.mp4')
      console.log('ready read')
      // 读取文件
      const data = ffmpeg.FS('readFile', '2.mp4')
      const res = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
      console.log('压缩后大小：' + data.length)
      Indicator.close()

      return res
    },

    // 录像完成
    changeCamera() {
      const self = this
      const camera = self.$refs.camera.files[0]
      console.log('压缩前大小：' + camera.size)
      // if (camera.size / 1024 > 1024 * 15) {
      //   Toast({ message: '视频大小请小于15M', duration: 3000, className: 'noticeError' })
      //   setTimeout(() => {
      //     self.generateCode()
      //     self.showMessageBox()
      //   }, 2000)
      //   return
      // }

      // const reader = new FileReader()
      /* eslint-disable */
      // if (FFmpeg && FFmpeg.createFFmpeg) {
      //   console.log('兼容FFmpeg')
      //   Indicator.open('压缩中..')
      //   this.videoBlob = self.compressVideo(camera)
      // } else {
      //   this.videoBlob = camera
      // }
      this.videoBlob = camera
      self.videoStep = 2
      // reader.onload = function() {
      //   console.log(reader)
      //   self.loadData(this.result)
      // }
      // reader.readAsDataURL(camera)
    },

    restart() {
      this.videoStep = 1
      this.showError = false
      this.error = ''
      this.videoSrc = ''
      this.disabled = false
      this.$nextTick(() => {
        this.$refs.camera.value = ''
        this.generateCode()
        this.showMessageBox()
      })
      this.setDocumentTitle('拍摄核验视频')
    },

    generateCode() {
      const { generateNum } = this
      const num1 = generateNum()
      const num2 = generateNum()
      const num3 = generateNum()
      const num4 = generateNum()
      // 显示的数据
      const num = Array.of(num1, num2, num3, num4).join(' ')
      // 接口使用数据
      const number = Array.of(num1, num2, num3, num4).join('')
      this.num = num
      this.number = number
    },

    generateNum() {
      return Math.round(Math.random() * 9)
    },

    setErrorInfo(showError = false, error = '') {
      this.showError = showError
      this.error = error
    },

    submit() {
      Indicator.open('请稍后..')
      let orderCode = this.globalData.orderCode
      console.log(orderCode)
      if (!orderCode) {
        orderCode = this.getParams(window.location.search).orderCode
      }
      const formData = new FormData()
      formData.append('video', this.videoBlob, 'video')
      formData.append('orderCode', orderCode)
      formData.append('number', this.number)
      formData.append('ext', 'MP4')
      formData.append('requestTime', new Date().getTime())
      console.log(this.number)
      console.log(orderCode)
      this.request({
        url: '/silentImageVerify',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 1000 * 60 * 60,
        success: (res) => {
          if (res.data.code === 'error') {
            this.disabled = true
          } else {
            Indicator.close()
            const self = this
            const { code, message, data } = res.data
            if (res && res.status != 200) {
              Toast({ message: '网络异常，请稍后重试', duration: 3000, className: 'noticeError' })
              return
            }

            const errorMsg = self.uploadFileTimeoutErrorMsg(message)
            if (code != 'success') {
              self.setErrorInfo(true, errorMsg)
            } else if (data && !data.passed) {
              self.setErrorInfo(true, errorMsg)
            } else if (data && data.passed) {
              self.setErrorInfo()
              self.setData({ videoVerifyImage: data.base64FaceImage })
              self.$router.push('/video_verify/step3')
            }
          }
        },
        catch(error) {
          Indicator.close()
          const errorMsg = self.uploadFileTimeoutErrorMsg(error.errMsg)
          self.setErrorInfo(true, errorMsg)
        }
      }, () => {
        Indicator.close()
      })
    },

    uploadFileTimeoutErrorMsg(error) {
      let errorMsg = error
      if (error == 'uploadFile:fail socket timeout error') {
        errorMsg = '视频核验失败，请网站负责人按照要求重新拍摄'
      }
      return errorMsg
    }
  }
}
</script>
<style scoped>
.video-step2 {
  width: 100%;
  height: 100%;
  background: #e4eaf6;
}

.videotape {
  width: 100%;
  height: 100%;
  position: relative;
}

.layer {
  position: absolute;
  background: #333;
  opacity: 0.4;
}

.top-layer {
  width: 100%;
  height: 13%;
  top: 0;
  left: 0;
}
.bottom-layer {
  width: 100%;
  height: 13%;
  bottom: 20%;
  left: 0;
}
.left-layer {
  width: 13%;
  height: 54%;
  top: 13%;
  left: 0;
}
.right-layer {
  width: 13%;
  height: 54%;
  top: 13%;
  right: 0;
}
.foot-layer {
  position: absolute;
  background: #333;
  width: 100%;
  height: 20%;
  bottom: 0;
  left: 0;
}

.top-desc {
  position: absolute;
  top: 2%;
  font-size: 15px;
  color: #fff;
  width: 100%;
  text-align: center;
}
.num {
  position: absolute;
  font-size: 20px;
  font-weight: bold;
  color: #388de7;
  width: 100%;
  text-align: center;
}
.top-num {
  top: 7%;
}
.bottom-num {
  top: 72%;
}

.foot-desc {
  position: absolute;
  top: 82%;
  font-size: 16px;
  color: #fff;
  width: 100%;
  text-align: center;
}

.foot-time {
  position: absolute;
  top: 90%;
  right: 15%;
  font-size: 16px;
  color: #388de7;
}

.video-button {
  position: absolute;
  top: 88%;
  left: calc(50% - 25px);
  width: 50px;
  height: 50px;
  border: 5px solid #fff;
  border-radius: 50%;
  background: #f00;
}

.video-button-start {
  background: #fff;
}

.video-button-disabled {
  background: gray;
}

.video-button-start .block {
  width: 25px;
  height: 25px;
  background: #f00;
  margin: 12.5px;
}

.body {
  background: #fff;
  padding: 20px 0;
}

.video-wrap {
  width: 120px;
  height: 120px;
  border-radius: 2px;
  margin: 10px auto;
}

.video {
  width: 120px;
  height: 120px;
  /* margin: 10px; */
}

.video-desc {
  font-size: 13px;
  color: #333;
  text-align: center;
}

.video-error {
  font-size: 13px;
  line-height: 13px;
  color: #ff001d;
  text-align: center;
  margin-top: 10px;
}

.title {
  font-size: 15px;
  color: #1b1b20;
  margin: auto 15px;
}

.foot {
  margin: 30px 15px auto;
}

.foot .btn {
  width: 160px;
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

.foot .first {
  margin-right: 10px;
}

.foot .primary {
  float: right;
  color: #fff;
}

.btn-primary-bg {
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}

.call-camera {
  position: relative;;
  width: 100%;
  height: 100%;
}
.call-camera > p {
  position: absolute;
  top: 50%;
  left: 50%;
  text-align: center;
  transform: translate(-50%, -50%);
}

.msg-box {
  font-size: 14px !important;
}
</style>
<style>
.mint-msgbox-btns {
  line-height: 40px;
  height: 40px;
}
.mint-msgbox-confirm {
  font-size: 16px;
}
.confirm-button {
  display: block;
  flex: none;
  width: 140px;
  height: 34px;
  line-height: 34px;
  color: #fff;
  background: #22a5e4;
  margin: 3px auto auto;
  border-radius: 4px;
}

</style>

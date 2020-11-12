<template>
<div class="video-step2">
  <div v-if="videoStep == 1" class="videotape">
    <video ref="camera" autoplay style="height: 100%; width: 100%;"></video>
    <div class="top-layer layer" />
    <div class="left-layer layer" />
    <div class="right-layer layer" />
    <div class="bottom-layer layer" />
    <div class="foot-layer" />

    <div class="top-desc">请点击拍摄按键后，用普通话大声朗读以下数字</div>
    <div class="top-num num">{{num}}</div>
    <div class="bottom-num num">{{num}}</div>
    <div class="foot-desc">请保持完整人脸在视频框中（需纯色背景）</div>
    <div v-if="videoState" class="foot-time">{{time}}S</div>
    <div v-if="videoDisabled || videoState && time < 6" class="video-button video-button-disabled" />
    <div v-else @touch="handleClick" :class="['video-button', videoState ? 'video-button-start' : '']">
      <div class="block"></div>
    </div>
  </div>

  <div v-if="videoStep == 2">
    <div class="body">
      <div>
        <div class="video-wrap">
          <video class="video" :src="videoSrc" />
        </div>
        <div class="video-desc">点击查看视频</div>
        <div class="video-error" v-if="showError">
          <img class="error-icon" :src="errorImg" />
          <text>{{error}}</text>
        </div>
      </div>
    </div>

    <div class="foot clearfix">
      <button class="btn default" @touch="restart">重新拍摄</button>
      <button class="btn primary btn-primary-bg" @touch="submit">确认使用</button>
    </div>
  </div>
</div>
</template>

<script>
import 'mint-ui/lib/style.css'
import debounce from '../../common/debounce'
import { getFileInfo } from '../../common/compressImage'
import getUserMedia from '../../common/camera'
const app = {
  globalData: {}
}
let self

export default {
  name: "Video-step2",
  data() {
    return {
      // 录制步骤
      videoStep: 1,
      error: '人脸核验失败，请网站负责人按照要求重新拍摄',
      showError: false,
      num: '9 3 7 0',
      number: '',
      time: 0,
      ticktock: null,
      // 录制状态：true录制中，false停止
      videoState: false,
      imageSrc: '',
      videoSrc: '',
      videoDisabled: false,
      errorImg: '../../static/images/warn.png'
    }
  },
  created() {
    self = this
    const { navigator } = global
    if (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
      getUserMedia({ video: true, audio: true }, this.success)
    } else {
      Toast({ title: "你的浏览器不支持访问用户媒体设备" })
    }
  },
  mounted() {
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
  methods: {
    success(stream) {
      const { camera } = this.$refs
      console.log(camera)
      // 将视频流设置为video元素的源
      camera.srcObject = stream
      camera.onloadedmetadata = () => {
        camera.play()
      }
      //  录像api的调用
      self.mediaRecorder = new MediaStreamRecorder(stream)
      mediaRecorder.mimeType = 'video/mp4'
      mediaRecorder.ondataavailable = function (blob) {
        //  停止以后调用上传
        if (self.videoSrc == '') {
          self.videoSrc = blob
          self.submit(blob)
        }
      }

      mediaRecorder.onstart = function () {
        self.timer()
      }
      mediaRecorder.onstop = function () {
        camera.pause()
          Toast({ message: '录制成功！' })
          this.videoStep = 2
          // const videoSrc = res.tempVideoPath
          // getFileInfo(videoSrc).then(res => {
            // const { size } = res
            // console.log('step2-视频大小：' + size)
            // 返回的byte
            // if (size > 1024 * 8000) {
            //   wx.hideLoading()
            //   // wx.showLoading({ title: '压缩中..', mask: true })
            //   self.compressVideo(videoSrc, 'high', videoSrc => {
            //     // wx.hideLoading()
                  // this.videoSrc = videoSrc
                  // this.videoStep = 2
            //     wx.setNavigationBarTitle({
            //       title: '核验视频确认'
            //     })
            //   })
            // } else {
              // wx.hideLoading()
              // this.videoSrc = videoSrc
              // this.videoStep = 2
              // wx.setNavigationBarTitle({
              //   title: '核验视频确认'
              // })
            // }
          // })
      }
    },

    generateNum() {
      return Math.round(Math.random() * 9)
    },

    stopTimer() {
      clearInterval(this.ticktock)
      this.time = 0
    },

    action() {
      if (this.time < 10) {
        this.time += 1
      } else {
        // 视频建议3~6秒，超过10秒自动结束
        this.stopTimer()
        // 录制完毕
        this.stopRecord()
        this.videoState = false
      }
    },

    // 定时器
    timer() {
      this.ticktock = setInterval(this.action, 1000)
    },

    // 1.开始：开计时器，禁用按钮，开始录像，6秒后按钮可用
    // 2.解释：关闭计时器，结束录像
    handleClick() {
      const { videoState } = this

      this.action()

      if (!this.videoState) {
        // 录制开始
        this.startRecord()
        this.videoState = !videoState
      } else {
        // 关闭计时器
        this.stopTimer()
        // 录制完毕
        this.stopRecord()
        this.videoDisabled = true
        this.videoState = !videoState
        setTimeout(() => {
          this.videoDisabled = false
        }, 3000)
      }
    },

    restart() {
      this.videoStep = 1
      this.showError = false
      this.error = ''
      // wx.setNavigationBarTitle({
      //   title: '拍摄核验视频'
      // })
    },

    setErrorInfo(showError = false, error = '') {
      this.showError = showError
      this.error = error
    },

    submit() {
      // wx.showLoading({ title: '请稍后..', mask: true })
      // console.log(this.videoSrc)
      // console.log(this.number)
      // console.log(app.globalData.orderCode)
      request({
        url: `${app.globalData.apiPath}/silentImageVerify`,
        method: 'POST',
        data: {
          orderCode: app.globalData.orderCode,
          number: this.number,
          filePath: this.videoSrc,
          name: 'video',
          ext: 'MP4'
        },
        success: (res) => {
          const { code, message, data } = JSON.parse(res.data)
          // wx.hideLoading()
          if (res && res.statusCode != 200) {
            Toast({
              title: '网络异常，请稍后重试',
              duration: 3000
            })
            return
          }

          const errorMsg = self.uploadFileTimeoutErrorMsg(message)
          if (code != 'success') {
            self.setErrorInfo(true, errorMsg)
          } else if (data && !data.passed) {
            self.setErrorInfo(true, errorMsg)
          } else if (data && data.passed) {
            app.globalData.videoVerifyImage = data.base64FaceImage
            self.setErrorInfo()
            this.$router.push('/video_verify/step3')
          }
        },
        fail(error) {
          // wx.hideLoading()
          const errorMsg = self.uploadFileTimeoutErrorMsg(error.errMsg)
          self.setErrorInfo(true, errorMsg)
        }
      })
    },

    uploadFileTimeoutErrorMsg(error) {
      let errorMsg = error
      if (error == 'uploadFile:fail socket timeout error') {
        errorMsg = '视频核验失败，请网站负责人按照要求重新拍摄'
      }
      return errorMsg
    },

    // compressVideo(src, quality = 'high', completeFunc) {
    //   wx.compressVideo({
    //     src,
    //     quality,
    //     success(res) {
    //       console.log(res.size)
    //       // 返回的KB,压缩大于5M
    //       if (res.size > 1024 * 8) {
    //         if (quality == 'high') {
    //           quality = 'medium'
    //         } else {
    //           quality = 'low'
    //         }
    //         self.compressVideo(res.tempFilePath, quality, completeFunc)
    //       } else {
    //         completeFunc(res.tempFilePath)
    //       }
    //     }
    //   })
    // },
    
    startRecord() {
      self.mediaRecorder.start()
    },

    stopRecord() {
      Toast({ title: '请稍后...' })
      self.mediaRecorder.stop()
    },
  },
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
  font-size: 30rpx;
  color: #fff;
  width: 100%;
  text-align: center;
}
.num {
  position: absolute;
  font-size: 40rpx;
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
  font-size: 32rpx;
  color: #fff;
  width: 100%;
  text-align: center;
}

.foot-time {
  position: absolute;
  top: 90%;
  right: 15%;
  font-size: 32rpx;
  color: #388de7;
}

.video-button {
  position: absolute;
  top: 88%;
  left: calc(50% - 50rpx);
  width: 100rpx;
  height: 100rpx;
  border: 10rpx solid #fff;
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
  width: 50rpx;
  height: 50rpx;
  background: #f00;
  margin: 25rpx;
}

.body {
  background: #fff;
  padding: 40rpx 0 80rpx;
}

.video-wrap {
  width: 442rpx;
  height: 340rpx;
  background: #f4f8fe;
  border-radius: 4rpx;
  margin: 40rpx auto;
}

.video {
  width: 402rpx;
  height: 300rpx;
  margin: 20rpx;
}

.video-desc {
  font-size: 26rpx;
  color: #333;
  text-align: center;
}

.video-error {
  font-size: 26rpx;
  line-height: 26rpx;
  color: #ff001d;
  text-align: center;
  margin-top: 20rpx;
}

.title {
  font-size: 30rpx;
  color: #1b1b20;
  margin: auto 30rpx;
}

.foot {
  margin: 60rpx 30rpx auto;
}

.foot .btn {
  width: 330rpx;
  height: 90rpx;
  border-radius: 4rpx;
  font-size: 36rpx;
  line-height: 60rpx;
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
</style>

<template>
  <div id="video-step1">
    <div class="video-step1">
      <div class="banner"></div>
      <div class="title">人脸识别验证须知</div>
      <div class="content">
        <div class="text">1.点击进行核验按钮后，需再点击开始拍摄按钮开始录制视频，6秒后结束按钮才可点击。</div>
        <div class="text">2.点击开始拍摄按钮后需要等待1秒后用普通话大声朗读屏幕上的数字，数字间建议略作停顿。</div>
        <div class="text">3.必须保证环境安静，将人脸置于视频框中，请勿遮挡面部，且视频中不允许出现多张人脸。</div>
        <div class="text">4.拍摄时请保持衣冠端正，且背景必须为白色，不允许出现杂物。</div>
      </div>
      <div class="foot">
        <mt-button class="btn" @click="submit" type="primary">进行核验</mt-button>
        <!-- <button class="btn-submit" bindtap="submit">进行核验</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import 'mint-ui/lib/style.css'
export default {
  name: 'Video-step1',
  data () {
    return {
    }
  },
  methods: {
    submit () {
      this.$router.push('/video_verify/step2')
    }
  }
}
</script>
<style scoped>
#video-step1 {
  height: 100%;
}

.body {
  background: #fff;
}

.title {
  box-sizing: border-box;
  font-size: 18px;
  color: #2e73d5;
  text-align: center;
  margin: -45px 15px 20px;
  height: 49px;
  line-height: 49px;
  background: #fff;
  border-radius: 2px;
}

.content {
  /* margin: -22px 15px 15px; */
  margin: -2px 15px 15px;
  border-radius: 2px;
  padding: 21px 19px;
  background: #fff;
  font-size: 13px;
  font-weight: normal;
  color: #333333;
}

.content .text {
  margin-bottom: 21px;
  line-height: 22px;
}

.foot {
  margin: auto 15px;
}

.video-step1 {
  width: 100%;
  height: 100%;
  background-color: #e4eaf6;
}

.banner {
  width: 375px;
  height: 192px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url("~@/assets/video-verify-bg.png");
}
.btn {
  width: 100% !important;
  height: 40px !important;
  font-size: 18px !important;
  border-radius: 4px !important;
  background: linear-gradient(to right, #388de7, #2c6fd2) !important;
}
</style>

<template>
  <div id="org">
    <div v-if="cropper">
      <!-- <vue-cropper
        ref='cropper'
        :src="imgSrc"
        :ready="cropImage"
        :zoom="cropImage"
        :cropmove="cropImage"
        style="width:100%;height:300px;"
      /> -->
      <VueCropper
        ref="croppers"
        :img="option.img ? option.img : '~@/assets/front.jpg'"
        :outputSize="option.size"
        :outputType="option.type"
        :ready="cropImage"
        :zoom="cropImage"
        :cropmove="cropImage"
        :style="'width:' + cropperWidth + 'px;height:' + cropperHeight + 'px;display:block;'"
      />
      <img :src="srcs" style="width:300px;height:220px;" />
      <span class="image-cropper-hint">点击中间裁剪框可查看裁剪后的图片tttt</span>
      <div class="image-cropper-bottoms">
        <button
          class="image-cropper-button"
          type="primary"
          catchtouchstart='rotate'
          catchtouchend='end'
          data-type="rotate"
          size="mini"
        >
          旋转
        </button>
        <button
          class="image-cropper-button"
          type="primary"
          bindtap="getCropperImage"
          size="mini"
        >
          确定
        </button>
        <button
          class="image-cropper-button"
          type="warn"
          bindtap="resetImage"
          size="mini"
        >
          丢弃
        </button>
      </div>
    </div>
    <div>
      <div class="container-page log-list">
        <div class="error-info" v-if="showErrorInfo">
          <img class="error-icon" src="~@/assets/warn.png" />
          {{errorInfo}}
        </div>  
      </div>

      <div class="org-top">
        <span class="tit" @click="cropImage">{{orgTitle}}</span>
        <div class="bgtop">
          <div class="weui-cell" style="padding:0;">
            <div class="weui-cell__bd">
              <div class="weui-uploader upload-bgs" style="margin-left: 180rpx;">
                <upload-file
                  type="org"
                  id="org"
                  bind:cropperimage="cropperImage"
                  bind:chooseimage="chooseImage"
                  bind:clearimage="clearImage"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="image-info" v-if="orgDone && (org.name || org.code)">
          <div>
            <span class="label">主办单位名称：</span>
            <span class="value">{{org.name}}</span>
          </div>
          <div>
            <span class="label">主办单位证件号：</span>
            <span class="value">{{org.code}}</span>
          </div>
        <!--
        <div>
            <span class="label">主办单位负责人：</span>
            <span class="value">{{org.person}}</span>
        </div>
        -->
          <div v-if="allowUpdate" class="update-button" @click="updateOrg">修改</div>
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
      </div>

      <div class="org-bottom">
        <span class="tit">请上传法人证件信息11</span>
        <div class="bgtop">
          <div class="weui-cell" style="padding: 0;">
            <div>
              <div class="clearfix">
                <upload-file
                  class="box-left"
                  type="own"
                  :num="1"
                  id="front"
                  bind:cropperimage="cropperImage"
                  bind:chooseimage="chooseImage"
                  bind:clearimage="clearImage"
                />
                <upload-file
                  class="box-right"
                  type="own"
                  :num="2"
                  id="side"
                  bind:cropperimage="cropperImage"
                  bind:chooseimage="chooseImage"
                  bind:clearimage="clearImage"
                />
              </div>
            </div>
          </div>
        </div>

        <span class="tit">合成照</span>
        <merge-file id="merge" type="own" />

        <div class="image-info" v-if="frontDone && (own.person || own.code)">
          <div>
            <span class="label">主办单位负责人：</span>
            <span class="value">{{own.person}}</span>
          </div>
          <div>
            <span class="label">主办单位负责人证件号：</span>
            <span class="value">{{own.code}}</span>
          </div>
          <span v-if="allowUpdate" class="update-button" bindtap="updateOwn">修改</span>
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
        
        <div v-if="allowSubmit" class="confirm" bindtap="submit">完成</div>

        <!-- <mp-dialog
          mask-closable="{{false}}"
          title="{{dialogTitle}}"
          show="{{dialogShow}}"
          buttons="{{buttons}}"
          bindbuttontap="dialogButton"
          ext-class="beian-dialog"
        >
          <div class="form" wx:if="{{dialogType == 'org'}}">
            <label class="fields">
              <div class="label">主办单位名称：</div>
              <input class="weui-input" id="orgName" bindinput="bindinput" value="{{org.name}}" />
            </label>
            <label class="fields">
              <div class="label">主办单位证件号：</div>
              <input class="weui-input" id="orgCode" bindinput="bindinput" value="{{org.code}}" />
            </label>
          </div>

          <div class="form" wx:elif="{{dialogType == 'own'}}">
            <label class="fields">
              <div class="label">主办单位负责人：</div>
              <input class="weui-input" id="ownPerson" bindinput="bindinput" value="{{own.person}}" />
            </label>
            <label class="fields">
              <div class="label">主办单位证件号：</div>
              <input class="weui-input" id="ownCode" bindinput="bindinput" value="{{own.code}}" />
            </label>
          </div>
        </mp-dialog>

        <mp-dialog
          mask-closable="{{false}}"
          title="提示"
          show="{{tipsDialogShow1}}"
          buttons="{{tipsButtons1}}"
          bindbuttontap="tipsDialogButton1"
        >
          <div class="tips">与PC端填写信息不一致，是否使用手机端信息</div>
        </mp-dialog>

        <mp-dialog
          mask-closable="{{false}}"
          title="提示"
          show="{{tipsDialogShow2}}"
          buttons="{{tipsButtons2}}"
          bindbuttontap="tipsDialogButton2"
        >
          <div class="tips">{{tipsText}}</div>
        </mp-dialog> -->

        <canvas class="canvas-hidden" style="width: 290px; height: 360px;" canvas-id="Canvas"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import uploadFile from '../upload_file'
import mergeFile from '../merge_file'
import $ from 'jquery'
export default {
    name: "Org",
    components: { uploadFile, mergeFile },
    data() {
        return {// 开始裁剪状态
          option: {},
          cropper: false,
          cropperType: '',
          // image cropper
          src:'',
          srcs: '',
          cropperWidth: 300,//宽度
          cropperHeight: 220,//高度
          // 是否显示错误提示
          showErrorInfo: false,
          errorInfo: '',
          height: 0,
          canvasWidth: 375,
          canvasHight: 667,
          loading: false,
          // 状态
          orgDone: false,
          frontDone: false,
          sideDone: false,
          mergeDone: false,
          allowSubmit: false,
          allowUpdate: false,
          // dialog
          dialogTitle: '',
          dialogShow: false,
          // org, own
          dialogType: '',
          buttons: [{text: '取消'}, {text: '保存'}],
          // tips dialog
          tipsDialogShow1: false,
          tipsDialogShow2: false,
          tipsButtons1: [{text: '使用'}, {text: '修改'}],
          tipsButtons2: [{text: '去核实'}, {text: '继续'}],
          tipsText: '',
          // 主办单位信息
          org: {
            // 名称
            name: '',
            // 营业执照证件号
            code: '',
            // 负责人
            // person: ''
          },
          // 主办单位负责人信息
          own: {
            // 负责人
            person: '',
            // 负责人证件号
            code: ''
          },
          // 修改后表单数据
          orgName: '',
          orgCode: '',
          // orgPerson: '',
          ownPerson: '',
          ownCode: '',
          // 企业证件提示title
          orgTitle: '请上传营业执照',
          NewCheckIn: '',
          ChangeCheckIn: '',
          NewWebsite: '',
          NoOrgNewWebsite: ''
        }
    },
    mounted: function() {
      this.height = this.globalData.height * 2 + 100
    },
    methods: {
        // 丢弃图片数据
      resetImage(e) {
          this.src = ''
          this.cropper = false
          this.cropperType = ''
          // this.setData({ src: '', cropper: false, cropperType: '' })
      },
      realTime() {
        this.previews = data
      },
      cropImages(a) {
        this.src = a
        console.log(this.$refs.cropper, a, 'cropImages11')
        this.$refs.cropper && this.$refs.cropper.replace(a)
      },
      cropImagedata(a) {
        console.log(this.$refs.cropper, a, 'aaa')
        this.srcs = a
        this.option.img = a
        this.option.size = 0.1
        this.option.type = false
        console.log(this.option, 'opttt11')
        this.$refs.croppers.img = a
        // this.$refs.cropper && this.$refs.cropper.replace(a)
      },
      cropImage() {
        console.log(this.$refs.cropper, 'cropimage1')
      },
        // 调用裁剪工具
      cropperImage(e) {
        const { src } = e.detail
        const { id } = e.currentTarget
        this.src = src
        this.cropper = true
        this.cropperType = id
        Indicator.close()
        // this.setData({ src, cropper: true, cropperType: id })
        // wx.hideLoading()
      },
        // 完成裁剪
      getCropperImage() {
        const self = this
        this.cropper.getImg((o)=>{
          const tempFilePath = o.url
          const cropperType = self.cropperType
          this.cropper = false
          const cropper = self.$(`#${cropperType}`)
          cropper.getCropperImage(tempFilePath)
          //   self.setData({ cropper: false }, () => {
          //     const cropper = self.selectComponent(`#${cropperType}`)
          //     cropper.getCropperImage(tempFilePath)
          //   })
        })
      },
      toLoginPage() {
        this.$router.push('/login')
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
#org {
  background: #e4eaf6
}
.clearfix:after {
  content: '';
  clear: both;
  display: block
}

.box-left {
  float: left;
}

.box-right {
  float: right;
}

.container-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #e4eaf6;
  box-sizing: border-box;
}
.org-top, .org-bottom {
  background: #fff;
  padding: 0 15px 20px;
  margin-top: 15px;
  margin-bottom: 15px;
}

/* 文字样式 */
.tit {
  font-size: 15px;
  height: 55px;
  line-height: 55px;
  color: #1b1b20;
}
/* 身份证正反面上传 */
.bgtop {
  margin-bottom: 35px;
}
.log-item {
  margin: 5px;
}
.weui-cells:after {
  border:none;
}
.weui-cell:after {
  border:none;
}

.borders {
  position: absolute;
  width: 10px;
  height: 10px;
}

.upload-imgs {
  padding: 5px;
  box-sizing: border-box;
}

/* 身份证合成照 */
.compound-img {
  background: #f4f8fe;
  position: relative;
  width: 162px;
  height: 180px;
  margin: 0 auto;
}

.top-left-border2 {
  top: 7;
  left: 25px;
  border-top: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.top-right-border2 {
  top: 7px;
  left: 127px;
  border-top: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.bottom-left-border2 {
  bottom: 7px;
  left: 25px;
  border-bottom: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.bottom-right-border2 {
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
.confirm {
  background: #3485e1;
  color: #fff;
  font-size: 17px;
  text-align: center;
  height: 45px;
  width: 90%;
  border-radius: 5px;
  margin: 15px auto;
  line-height: 45px;
}
.image-desc {
  font-size: 10px;
  color: #ff001d;
}
.image-info {
  position: relative;
  font-size: 13px;
}
.update-button {
  position: absolute;
  top: 0;
  right: 0;
  width: 58px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  border-radius: 10px;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}
.image-info .label {
  color: #666;
}
.image-info .value {
  color: #333;
}

.dialog {}
.weui-dialog {
  width: 325px;
}
.weui-dialog__hd {
  border: 1px solid #ededed;
}
/*
.weui-dialog__hd {
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}
.weui-dialog__title {
  color: #fff;
}
*/
.weui-dialog__bd {
  padding: 0;
}
.weui-dialog .form {
  padding: 10px 0;
  font-size: 13px;
}
.weui-dialog .fields {
  display: flex;
  padding: 10px 10px 10px 24px;
  border-bottom: 1px solid #e5e5e5;
}
.weui-dialog .label {
  flex: 1 0 auto;
  color: #666;
  line-height: 22px;
}
.weui-dialog .weui-input {
  text-align: left;
  color: #333;
}

.weui-dialog .tips {
  padding-top: 15px;
  font-size: 13px;
  color: #333;
}

.error-info {
  height: 20px;
  line-height: 20px;
  text-align: left;
  font-size: 13px;
  color: #ff001d;
  padding: 10px 15px;
  background: #ffe9db;
}

.image-cropper-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99991;
  width: 100%;
  height: 100%;
  background: rgb(14, 13, 13);
}

.image-cropper-hint {
  position: absolute;
  top: 5px;
  width: 100%;
  font-size: 16px;
  text-align: center;
  color: white;
  z-index: 99992;
}

.image-cropper-bottoms {
  position: absolute;
  width: 100%;
  height: 50px;
  bottom: 0;
  z-index: 99992;
  text-align: center;
}

.image-cropper-button {
  margin-right: 5px;
}

.beian-dialog .weui-dialog {
  border-radius: 4px;
}

.beian-dialog .weui-dialog__hd {
  margin: 0;
  padding: 0;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  border: none;
  background: linear-gradient(to right, #3754c9 , #2a6bc7);
}

.beian-dialog .weui-dialog__hd .weui-dialog__title {
  font-weight: normal;
  height: 60px;
  line-height: 60px;
  letter-spacing: 2px;
}

.beian-dialog .weui-dialog__ft {
  position: relative;
  margin: 0 20px 25px;
  line-height: 18px;
  min-height: 18px;
  font-size: 18px;
}

.beian-dialog .weui-dialog__ft:after {
  border-top: none;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn {
  font-size: 18px;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
}

.beian-dialog .weui-dialog__ft :first-child {
  margin-right: 11px;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn_default {
  background: #f3f4f8;
  color: #333;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn_primary {
  background: linear-gradient(to right, #388de7 , #2c6fd2);
  color: #fff;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn:after {
  border-left: none;
}


</style>

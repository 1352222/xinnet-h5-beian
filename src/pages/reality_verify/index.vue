<template>
  <div id="reality_verify">
      <div class="reality-verify">
        <div class="page__bd loading" v-if="!loading">
          <!-- <mp-loading type="circle"></mp-loading> -->123
        </div>
        <div v-else>
          <div class="body">
            <div class="title">网站备案真实性核验单</div>
            <div class="photo-area">
              <div class="bg">
                {{checkForm}}
                <viewer v-if="checkForm">
                  <img id="checkForm" class="photo" :src="checkForm" />
                </viewer>
                <!-- <img @click="previewImage" id="checkForm" class="photo" :src="checkForm" /> -->
              </div>
            </div>
            <div class="desc">
              <span>点击查看核验单</span>
            </div>

            <div class="title">网站备案承诺书</div>
            <div class="photo-area">
              <div class="bg">
                <viewer v-if="promiseBook">
                  <img id="promiseBook" class="photo" :src="promiseBook" />
                </viewer>
                <!-- <img @click="previewImage" id="promiseBook" class="photo" :src="promiseBook" /> -->
              </div>
            </div>
            <div class="desc">
              <span>点击查看承诺书</span>
            </div>  
          </div>

          <div class="foot">
            <div class="field">
              <label class="checkbox" @click="checkboxChange">
                <!-- <checkbox :agree="agree" :checked="agree" /> -->
                <input type="checkbox" :agree="agree" :checked="agree" />
                <span class="aa">本人承诺以上所填信息真实准确，如有虚报，自愿承担法律责任</span>
              </label>
            </div>
            <div>
              <mt-button class="btn" @click="submit" :disabled="!agree || loading ? true : ''" size="large">完成</mt-button>
              <!-- <button class="btn-submit" bindtap="submit" :disabled="!agree || loading ? true : ''">完成</button> -->
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import { Indicator, Toast } from 'mint-ui'
import $ from 'jquery'
export default {
  name: "Reality_verify",
  data() {
    return {
      agree: false,
      loading: true,
      checkForm: '',
      checkFormBase64: '',
      promiseBook: '',
      promiseBookBase64: '',
      img: ''
    }
  },
  mounted: function () {
    this.onLoad()
  },
  methods: {
    checkboxChange(e) {
      this.agree = !this.agree
    },
    submit(e) {
      const agree = this.agree
      const checkFormBase64 = this.checkFormBase64
      const promiseBookBase64 = this.promiseBookBase64
      // const { agree, checkFormBase64, promiseBookBase64 } = this.data
      const { orderCode, recordType, orgState, websiteState, realityVerifyState, screenState } = this.globalData
      const self = this
      if (agree) {
        // 已经上传了核验单和承诺书不重复提交
        if (realityVerifyState === 'right') {
          self.$router.push('/result')
          // wx.redirectTo({ url: '../result/result' })
          return
        }

        // 如果前面步骤全部完成跳提交数据转到成功页面

        // 否则跳转失败页面 => 个人
        if (recordType === '5' && !(websiteState === 'right' && screenState === 'right')) {
          self.$router.push('/result')
          // wx.redirectTo({ url: '../result/result' })
          return
        }
        // 否则跳转失败页面 => 企业
        if (recordType != '5' && !(orgState === 'right' && websiteState === 'right' && screenState === 'right')) {
          self.$router.push('/result')
          // wx.redirectTo({ url: '../result/result' })
          return
        }

        const data = {
          orderCode,
          checkFormAttachment: {
            ...getAttachmentParam({
              isWebsiteChecklist: '1',
              filePurpose: 1,
              picSequenceNum: '1',
              fileState: 'MERGE',
              type: 'WEBSITE',
              byteFile: checkFormBase64
            })
          },
          promiseAttachment: {
            ...getAttachmentParam({
              isWebsiteChecklist: '2',
              filePurpose: 1,
              picSequenceNum: '1',
              fileState: 'MERGE',
              type: 'WEBSITE',
              byteFile: promiseBookBase64,
              otherFileType: '1'
            })
          }
        }

        Indicator.open('请稍后...');
        //   wx.showLoading({ title: '请稍后..', mask: true })
        $.ajax({
          url: `/api/miniprogram/saveAttachment`,
          method: 'POST',
          data,
          success(res) {
            const { code } = res.data
            Indicator.close()
            //   wx.hideLoading()
            let globalDatas = self.globalData
            if (code === 'success') {
              globalDatas.realityVerifyState = 'right'
              self.setData(globalDatas)
              self.$router.push('/result')
            } else {
              Toast({
                message: '操作失败！',
                duration: 3000
              })
            }
          }
        })
      }
    },
    getCheckForm() {
      console.log('form1123')
      console.log(this, 'ttt11')
      const self = this
      // const _wx = wx
      return new Promise((resolve) => {
        $.ajax({
          // url: `/apiPath/checkForm?orderCode=${this.globalData.orderCode}`,
          url: `/api/miniprogram/checkForm?orderCode=${this.globalData.orderCode}`,
          responseType: 'ArrayBuffer',
          success(res) {
            // this.checkForm = res
            if (res && res.statusCode != 200) {
              Toast({
                message: '网络异常，请稍后重试',
                duration: 3000
              })
            } else {
              const { data } = res
              // const filePath = _wx.env.USER_DATA_PATH + '/checkForm.jpg'
              // self.saveNetImage(filePath, data, 'checkForm', resolve)
            }
          },
          fail(title) {
            Toast({
              message: title,
              duration: 3000
            })
          }
        })
      })
    },
    getPromiseBook() {
      const _wx = wx
      const self = this
      // 使用封装request有问题
      return new Promise((resolve) => {
        $.ajax({
          url: `/api/miniprogram/promise?orderCode=${this.globalData.orderCode}`,
          responseType: 'ArrayBuffer',
          success(res) {
            if (res && res.statusCode != 200) {
              Toast({
                message: '网络异常，请稍后重试',
                duration: 3000
              })
            } else {
              const { data } = res
              const filePath = _wx.env.USER_DATA_PATH + '/promiseBook.jpg'
              self.saveNetImage(filePath, data, 'promiseBook', resolve)
            }
          },
          fail(title) {
            Toast({
              message: title,
              duration: 3000
            })
          }
        })
      })
    },
    // 图片以流的形式返回，需要先写到本地路径然后压缩再转base64
    saveNetImage(filePath, data, key, resolve) {
      const _wx = wx
      const self = this
      _wx.getFileSystemManager().writeFile({
        filePath,
        data,
        encoding: 'binary',
        success() {
          getImageInfo(filePath).then(res => {
            self.setValue(key, res.path, resolve)
            // const systemInfo = wx.getSystemInfoSync()
            // const windowW = systemInfo.windowWidth
            // const maxSide = Math.max(res.width, res.height)
            // let scale = 1
            // if (maxSide > windowW) {
            //   scale = windowW / maxSide
            // }
            // const imageW = Math.trunc(res.width * scale)
            // const imageH = Math.trunc(res.height * scale)
            // wxml Canval已注释
            // compressImage('Canvas', res.path, imageW, imageH, 0.3, imagePath => {
            //   getLessLimitSizeImage('Canvas', imagePath, 130, imageW, path => {
            //     self.setValue(key, path, resolve)
            //   })
            // })
          })
        }
      })
    },
    setValue(key, imagePath, resolve) {
      const self = this
      // 预览图
      this.key = imagePath
      // self.setData({ [key]: imagePath })
      // 转base64
      getBase64(imagePath).then(res => {
        const fileBase64 = res.data
        const a = key + 'Base64'
        this.a = fileBase64
        //   self.setData({ [`${key}Base64`]: fileBase64 })
        resolve(fileBase64)
      })
    },
    onLoad() {
      const { images } = this.globalData
      if (images.realityVerify && images.realityVerify.id) {
        this.agree = images.realityVerify.id ? true : false
        //   this.setData({ agree: images.realityVerify.id ? true : false })
      }

      // return Promise.all([this.getCheckForm(), this.getPromiseBook()]).then(() => {
      // this.setData({ loading: false })
      // 把网络图片同步写入本地，异步会出现图片混乱
      this.getCheckForm().then(() => {
        this.getPromiseBook().then(() => {
          this.loading = false
        })
      })

      // 转base64后preview响应性能，无法查看
      // const checkForm = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(_checkForm)
      // const promiseBook = 'data:image/jpeg;base64,' + wx.arrayBufferToBase64(_promiseBook)
      // this.setData({ checkForm, promiseBook, loading: false })
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
.reality-verify {
  position: relative;
  width: 100%;
  height: 100%;
  background: #e4eaf6;
}

.body {
  background: #fff;
}

.loading {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.title {
  font-size: 15px !important;
  color: #1b1b20 !important;
  padding-top: 15px;
  margin: auto auto 20px 15px;
  text-align: left !important;
}

.photo-area {
  margin-bottom: 20px;
}

.photo-area .bg {
  width: 162px;
  height: 190px;
  margin: auto;
  text-align: center;
  background-size: 100% 100%;
  background-image: url("~@/assets/reality-verify-bg.png");
}

.photo-area .photo {
  width: 100px;
  height: 143px;
  margin-top: 23px;
}

.desc {
  text-align: center;
  padding-bottom: 20px;
}

.foot {
  padding: 20px 15px;
}

.field {
  margin-bottom: 20px;
}

.checkbox {
  /* font-size: 22px; */
  /* transform: scale(0.83); */
  color: #999;
  /* font-size: 12px; */
  white-space: nowrap;
  /* -webkit-transform-origin-x: 0; 缩小后文字居左 */
  /* -webkit-transform: scale(0.90); */
}
.aa {
  /* font-size:10px;
  -webkit-text-size-adjust: none; */
  font-size: 12px;
  transform: scale(0.5);
}
.btn {
  height: 41px !important;
  font-size: 18px !important;
  border-radius: 4px !important;
}
</style>

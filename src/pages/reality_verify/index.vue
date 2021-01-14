<template>
  <div id="reality_verify">
    <div class="reality-verify">
      <div class="loading" v-if="loading">
        <mt-spinner></mt-spinner>
      </div>
      <div v-else style="background: #e4eaf6;">
        <div class="body">
          <div class="title">网站备案真实性核验单</div>
          <div class="photo-area">
            <div class="bg">
              <viewer>
                <img class="photo" :src="checkForm()" />
              </viewer>
            </div>
          </div>
          <div class="desc">
            <span>点击查看核验单</span>
          </div>

          <div class="title">网站备案承诺书</div>
          <div class="photo-area">
            <div class="bg">
              <viewer>
                <img class="photo" :src="promiseBook()" />
              </viewer>
            </div>
          </div>
          <div class="desc">
            <span>点击查看承诺书</span>
          </div>
        </div>

        <div class="foot">
          <div class="field">
            <label class="checkbox" @click="checkboxChange">
              <input type="checkbox" :agree="agree" :checked="agree" />
              <span class="agree"
                >本人承诺以上所填信息真实准确，如有虚报，自愿承担法律责任</span
              >
            </label>
          </div>
          <div class="btn_done">
            <mt-button
              class="btn btn_submit"
              size="large"
              :disabled="!agree || loading"
              @click="submit"
              >完成</mt-button
            >
          </div>
        </div>
      </div>
    </div>

    <canvas width="1240" height="1754" class="canvas-hidden" ref="checkForm" />
    <canvas width="826" height="1169" class="canvas-hidden2" ref="promiseBook" />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import getAttachmentParam from '../../common/getAttachmentParam'
import { Indicator, Toast } from 'mint-ui'

export default {
  name: 'Reality_verify',
  data() {
    return {
      agree: false,
      loading: true,
      checkFormBase64: '',
      promiseBookBase64: ''
    }
  },
  mounted () {
    this.setDocumentTitle('核验单')
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
  methods: {
    onLoad() {
      const { images } = this.globalData
      if (images.realityVerify && images.realityVerify.id) {
        this.agree = !!images.realityVerify.id
      }

      this.toBase64().then((res) => {
        if (res.length) {
          this.checkFormBase64 = res[0].slice(23)
          this.promiseBookBase64 = res[1].slice(23)
        }
        this.loading = false
      })
    },
    checkboxChange(e) {
      this.agree = !this.agree
    },
    checkForm() {
      return `/api/miniprogram/checkForm?orderCode=${this.globalData.orderCode}`
    },
    promiseBook() {
      return `/api/miniprogram/promise?orderCode=${this.globalData.orderCode}`
    },
    toBase64() {
      return Promise.all([
        new Promise(resolve => {
          const canvas = this.$refs.checkForm
          const ctx = canvas.getContext('2d')
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, 0, 1250, 1800)
            const res = canvas.toDataURL('image/jpeg', 0.5)
            resolve(res)
          }
          img.src = this.checkForm()
        }),
        new Promise(resolve => {
          const canvas = this.$refs.promiseBook
          const ctx = canvas.getContext('2d')
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, 0, img.width, img.height)
            const res = canvas.toDataURL('image/jpeg', 0.5)
            resolve(res)
          }
          img.src = this.promiseBook()
        })
      ])
    },
    submit(e) {
      const agree = this.agree
      const checkFormBase64 = this.checkFormBase64
      const promiseBookBase64 = this.promiseBookBase64
      const {
        orderCode,
        recordType,
        orgState,
        websiteState,
        realityVerifyState,
        screenState,
        icp
      } = this.globalData
      const self = this
      const arr = []
      const id = []
      const ids = []
      icp.icpAttachmentOrders.forEach(row => {
        if (row.filePurpose === '1' && (row.isWebsiteChecklist === '1' || row.isWebsiteChecklist === '2')) {
          arr.push(row)
          if (row.isWebsiteChecklist === '1') {
            id.push(row.id)
          } else if (row.isWebsiteChecklist === '2') {
            ids.push(row.id)
          }
        }
      })
      if (agree) {
        // 已经上传了核验单和承诺书不重复提交
        if (realityVerifyState == 'right' && !arr.length) {
          self.$router.push('/result')
          return
        }

        // 如果前面步骤全部完成跳提交数据转到成功页面
        // 否则跳转失败页面 => 个人
        if (
          recordType == '5' &&
          !(websiteState == 'right' && screenState == 'right')
        ) {
          self.$router.push('/result')
          return
        }
        // 否则跳转失败页面 => 企业
        if (
          recordType != '5' &&
          !(
            orgState == 'right' &&
            websiteState == 'right' &&
            screenState == 'right'
          )
        ) {
          self.$router.push('/result')
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
            }, self.globalData)
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
            }, self.globalData)
          }
        }

        Indicator.open('请稍后...')

        if (arr.length) {
          const param = `attachmentOrderIds=${id}&attachmentOrderIds=${ids}`
          const that = this
          this.request({
            url: `/deleteAttachment?${param}`,
            method: 'GET',
            // arrdata,
            success(res) {
              const { code, message } = res.data
              if (code == 'success') {
                let globalDatas = self.globalData
                globalDatas.images.orgCertificate = {}
                self.setData(globalDatas)
                that.request({
                  url: '/saveAttachment',
                  method: 'POST',
                  data,
                  success(res) {
                    const { code } = res.data
                    Indicator.close()
                    if (code == 'success') {
                      self.setData({ realityVerifyState: 'right' })
                      self.$router.push('/result')
                    } else {
                      Toast({
                        message: '操作失败！',
                        duration: 3000,
                        className: 'noticeError'
                      })
                    }
                  }
                })
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
          this.request({
            url: '/saveAttachment',
            method: 'POST',
            data,
            success(res) {
              const { code } = res.data
              Indicator.close()
              if (code == 'success') {
                self.setData({ realityVerifyState: 'right' })
                self.$router.push('/result')
              } else {
                Toast({
                  message: '操作失败！',
                  duration: 3000,
                  className: 'noticeError'
                })
              }
            }
          })
        }

        // this.request({
        //   url: '/saveAttachment',
        //   method: 'POST',
        //   data,
        //   success(res) {
        //     const { code } = res.data
        //     Indicator.close()
        //     if (code == 'success') {
        //       self.setData({ realityVerifyState: 'right' })
        //       self.$router.push('/result')
        //     } else {
        //       Toast({
        //         message: '操作失败！',
        //         duration: 3000,
        //         className: 'noticeError'
        //       })
        //     }
        //   }
        // })
      }
    },
    ...mapMutations({
      setData: 'SET_DATA'
    })
  },
  computed: {
    ...mapState({
      globalData: (state) => state.home.globalData
    })
  }
}
</script>
<style scoped>
#reality_verify {
  height: 100%;
}
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
.agree {
  /* font-size:10px;
  -webkit-text-size-adjust: none; */
  font-size: 12px;
  letter-spacing: -.5px;
  transform: scale(0.5);
}

.btn {
  height: 41px !important;
  font-size: 18px !important;
  border-radius: 4px !important;
}

.btn_submit {
  font-size: 18px;
	border: 1px solid #fff;
  color: #fff;
	border-radius: 4px;
	font-weight: normal;
  background: linear-gradient(to right, #388de7 , #2c6fd2);
  margin-top: 20px;
}

.btn_done {
  width: 100%;
  margin: auto;
}

.loading {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
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

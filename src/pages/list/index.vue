
<template>
  <div id="list">
    <div class="container-page">
      <div class="con-msg">
        <!-- 企业或企业变更主体 -->
        <div v-if="step === 4 || step === 1 && globalData.recordType != 5" style="margin:0;" class="con-item" @click="toOrg">
          <div>
            <img src="~@/assets/icon01.jpg" class="imgs" />
            <span>上传主体证件</span>
          </div>
          <div>
            <img v-if="state.orgState === 'right'" src="~@/assets/yes.jpg" class="imgs" />
            <img v-if="state.orgState === 'wrong'" src="~@/assets/no.jpg" class="imgs" />
            <img src="~@/assets/right.jpg" class="imgs" />
          </div>
        </div>

        <div v-if="step === 4 || step === 3 || step === 1 && globalData.recordType === 5" class="con-item" @click="toWebsite">
          <div>
            <img src="~@/assets/icon02.jpg" class="imgs" />
            <span>{{uploadOrgWebsiteTitle}}</span>
          </div>
          <div>
            <img v-if="state.websiteState === 'right'" src="~@/assets/yes.jpg" class="imgs" />
            <img v-if="state.websiteState === 'wrong'" src="~@/assets/no.jpg" class="imgs" />
            <img src="~@/assets/right.jpg" class="imgs" />
          </div>
        </div>

        <div v-if="step > 1" class="con-item" @click="toScreen">
          <div>
            <img src="~@/assets/icon04.jpg" class="imgs">
            <span>人脸识别验证</span>
          </div>
          <div>
            <img v-if="state.screenState === 'right'" src="~@/assets/yes.jpg" class="imgs">
            <img v-if="state.screenState === 'wrong'" src="~@/assets/no.jpg" class="imgs">
            <img src="~@/assets/right.jpg" class="imgs">
          </div>
        </div>

        <div v-if="step > 1" class="con-item" @click="toRealityVerify">
          <div>
            <img src="~@/assets/icon03.jpg" class="imgs" />
            <span>上传核验单&承诺书</span>
          </div>
          <div>
            <img v-if="state.realityVerifyState === 'right'" src="~@/assets/yes.jpg" class="imgs" />
            <img v-if="state.realityVerifyState === 'wrong'" src="~@/assets/no.jpg" class="imgs" />
            <img src="~@/assets/right.jpg" class="imgs" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import { Toast } from 'mint-ui'
import $ from 'jquery'
export default {
  name: "List",
  data() {
    return {
      first: false,
      // 取值right, wrong, none
      state: {
        orgState: 'none',
        websiteState: 'none',
        realityVerifyState: 'none',
        screenState: 'none',
      }
    }
  },
  mounted () {
    const phone = window.sessionStorage.getItem('phone')
    const orderCode = window.sessionStorage.getItem('orderCode')
    const self = this
    if (phone && orderCode) {
      self.setData({ loading: true })
      $.ajax({
        url: `/api/miniprogram/checkPhone?orderCode=${orderCode}&phone=${phone}`,
        success(data) {
          const res = data.data
          if (data.code === 'success') {
            self.getData(res, phone)
          } else {
            Toast({
              message: data.message,
              duration: 3000
            })
          }
        },
        error() {
          self.setData({ loading: false })
        }
      })
    }
    // if (!this.globalData.loading) {
    //   this.getData()
    // }
    // this.$watch('globalData.loading', (loading) => {
    //   if (!loading) {
    //     this.getData()
    //   }
    // })
    this.first = true
    // this.$router.push('/login')
  },
  methods: {
    toOrg () {
      this.$router.push('/org')
    },
    toWebsite () {
      // const { state, step } = this.data
      const state = this.state
      const step = this.step
      // 企业判断完成第一步
      // 个人不用判断
      // 变更主体不用判断
      // if (step === 4 && state.orgState === 'right' || step === 1 || step === 3) {
      this.$router.push('/website')
      // }
    },
    toScreen () {
      // const step = this.step
      // const { orgState, websiteState, realityVerifyState, screenState } = this.state
      const { screenState } = this.state
      // 企业主体网站附件，个人网站附件上传完成才能下一步
      // if ((step === 4 && orgState === 'right' && websiteState === 'right') || (step === 3 && websiteState === 'right')) {
      if (screenState === 'right') {
        this.$router.push('/video-verify/step3')
      } else {
        this.$router.push('/video_verify/step1')
      }
      // }
    },
    toRealityVerify () {
      // const step = this.step
      // const { orgState, websiteState, screenState } = this.state
      // if ((step === 4 && orgState === 'right' && websiteState === 'right' && screenState === 'right') || (step === 3 && websiteState === 'right' && screenState === 'right')) {
      this.$router.push('/reality_verify')
      // }
    },
    getData (res, phone) {
      const { icpAttachmentOrders, icpOrder } = res
      let step
      let uploadOrgWebsiteTitle = '上传网站负责人证件'
      // 变更主体
      if (icpOrder.orderType === 'CHANGE_ORG') {
        step = 1
        // orgPropertyId: 5个人
      } else if (icpOrder.orgPropertyId === '5') {
        step = 3
        uploadOrgWebsiteTitle = '上传主体/网站负责人证件'
        // 非个人机构
      } else {
        step = 4
      }
      const images = icpAttachmentOrders.reduce((res, image) => {
        // 主办单位证件
        if (image.filePurpose === '2' && image.type === 'ORG' && !image.otherFileType) {
          res['orgCertificate'] = image
        }

        // 主体负责人证件
        if (image.filePurpose === '3' && image.type === 'ORG' && !image.otherFileType) {
          res[`ownCertificate${image.picSequenceNum}`] = image
        }

        // 网站负责人证件
        if (image.filePurpose === '4' && image.type === 'WEBSITE' && !image.otherFileType) {
          res[`websiteCertificate${image.picSequenceNum}`] = image
        }

        // 非变更主体：核验单、承诺书和幕布
        if (step > 1) {
          // 核验单（承诺书并存）
          if (image.filePurpose === 1 && !image.otherFileType) {
            res['realityVerify'] = image
          }
          if (image.filePurpose === 1 && image.isWebsiteChecklist === '2') {
            res['promiseBook'] = image
          }
          if (image.filePurpose === 5 && !image.otherFileType) {
            res['screen'] = image
          }
        }
        return res
      }, {})


      // state: right, wrong, none
      // this.orgState = 'none'
      // this.websiteState = 'none'
      // this.realityVerifyState = 'none'
      // this.screenState = 'none'
      const state = {
        orgState: 'none',
        websiteState: 'none',
        realityVerifyState: 'none',
        screenState: 'none'
      }

      // 变更备案
      if (step === 1) {
        const useOrgCertificate = icpOrder.orgPropertyId === '5' ? true : images.orgCertificate
        const useOrgCertificate2 = icpOrder.orgPropertyId === '5' ? false : images.orgCertificate
        if (images.ownCertificate1 && images.ownCertificate2 && images.ownCertificate3 && useOrgCertificate) {
          state.orgState = 'right'
          state.websiteState = 'right'
        } else if (images.ownCertificate1 || images.ownCertificate2 || images.ownCertificate3 || useOrgCertificate2) {
          state.orgState = 'wrong'
          state.websiteState = 'wrong'
        }
        // 个人只判断身份证正反合成照
      } else if (step === 3) {
        if (images.ownCertificate1 && images.ownCertificate2 && images.ownCertificate3) {
          state.orgState = 'right'
          state.websiteState = 'right'
        } else if (images.ownCertificate1 || images.ownCertificate2 || images.ownCertificate3) {
          state.orgState = 'wrong'
          state.websiteState = 'wrong'
        }
        // 企业（非个人）个人三张证件 + 企业证件
      } else if (step === 4) {
        // 主体负责人
        if (images.ownCertificate1 && images.ownCertificate2 && images.ownCertificate3 && images.orgCertificate) {
          state.orgState = 'right'
        } else if (images.ownCertificate1 || images.ownCertificate2 || images.ownCertificate3 || images.orgCertificate) {
          state.orgState = 'wrong'
        }

        // 网站负责人
        if (images.websiteCertificate1 && images.websiteCertificate2 && images.websiteCertificate3) {
          state.websiteState = 'right'
        } else if (images.websiteCertificate1 || images.websiteCertificate2 || images.websiteCertificate3) {
          state.websiteState = 'wrong'
        }
      }

      // 非变更备案有核验单和幕布
      if (step > 1) {
        if (images.realityVerify && images.promiseBook) {
          state.realityVerifyState = 'right'
        } else if (images.realityVerify || images.promiseBook) {
          state.realityVerifyState = 'wrong'
        } else {
          state.realityVerifyState = 'none'
        }
        if (images.screen) {
          state.screenState = 'right'
        }
      }

      this.state = state
      let globalDatas = this.globalData
      globalDatas.icp = res
      globalDatas.orderCode = res.icpOrder.orderCode
      globalDatas.recordType = res.icpOrder.orgPropertyId
      globalDatas.orderType = res.icpOrder.orderType
      globalDatas.phone = phone
      globalDatas.loading = false
      globalDatas.orgState = state.orgState
      globalDatas.websiteState = state.websiteState
      globalDatas.realityVerifyState = state.realityVerifyState
      globalDatas.screenState = state.screenState
      globalDatas.images = images
      globalDatas.step = step
      globalDatas.uploadOrgWebsiteTitle = uploadOrgWebsiteTitle
      this.setData(globalDatas)
    },

    ...mapMutations({
      setData: 'SET_DATA'
    })
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData,
      step: state => state.home.globalData.step,
      uploadOrgWebsiteTitle: state => state.home.globalData.uploadOrgWebsiteTitle
    })
  }
}
</script>
<style scope>
#list {
  width: 100%;
  height: 100%;
  background: #e4eaf6;
}
.container-page {
  padding: 10px 15px;
}
.tit {
  color: #343537;
  font-size: 26px;
  line-height: 90px;
  display: inline-block;
}
.con-msg {
  padding-top: 15px;
  height: 600px;
}
.con-item {
  display: flex;
  justify-content: space-between;
  padding: 0 0 0 15px;
  height: 55px;
  line-height: 55px;
  background: #fff;
  margin-top: 15px;
  font-size: 15px;
  box-shadow: -1px -2px 2px #dadee7;
}
.imgs {
  width: 25px;
  height: 25px;
  vertical-align: middle;
  margin-right: 20px;
}
.con-item text {
  font-size: 32px;
}
</style>

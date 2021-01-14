<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { Toast } from 'mint-ui'
import { getParams } from './common/util'
// import $ from 'jquery'

export default {
  name: 'App',
  created() {
    let phone = ''
    const self = this
    // 页面刷新调用接口确保有数据
    // list，login，home不需要调用接口
    const listPage = window.location.hash.indexOf('list') > -1
    const loginPage = window.location.hash.indexOf('login') > -1
    const homePage = window.location.hash == '#/'
    // console.log(window.location.hash)
    const { orderType, orderCode } = getParams(window.location.search)
    // 不用登录输入手机号直接进入
    if (orderType === 'NEW_CHECK_IN' || orderType === 'CHANGE_ORG' || orderType === 'NO_ORG_NEW_CHECK_IN') {
      window.sessionStorage.clear()
      window.sessionStorage.setItem('orderCode', orderCode)
    } else {
      phone = window.sessionStorage.getItem('phone')
    }
    if (orderCode && !listPage && !loginPage && !homePage) {
      self.setData({ loading: true })
      let url = `/checkPhone?orderCode=${orderCode}&phone=${phone}`
      if (!phone) {
        url = `/checkPhone?orderCode=${orderCode}`
      }
      self.request({
        url,
        success(data) {
          const res = data.data
          if (res.code === 'success') {
            const { icpAttachmentOrders, icpOrder } = res.data
            let step
            let uploadOrgWebsiteTitle = '上传网站负责人证件'
            // 变更主体
            if (icpOrder.orderType === 'CHANGE_ORG') {
              step = 1
              // orgPropertyId: 5个人
            } else if (icpOrder.orgPropertyId == '5') {
              step = 3
              uploadOrgWebsiteTitle = '上传主体/网站负责人证件'
              // 非个人机构
            } else {
              step = 4
            }
            const images = icpAttachmentOrders.reduce((res, image) => {
              // 主办单位证件
              if (image.filePurpose == '2' && image.type === 'ORG' && !image.otherFileType) {
                res['orgCertificate'] = image
              }

              // 主体负责人证件
              if (image.filePurpose == '3' && image.type === 'ORG' && !image.otherFileType) {
                res[`ownCertificate${image.picSequenceNum}`] = image
              }

              // 网站负责人证件
              if (image.filePurpose == '4' && image.type === 'WEBSITE' && !image.otherFileType) {
                res[`websiteCertificate${image.picSequenceNum}`] = image
              }

              // 非变更主体：核验单、承诺书和幕布
              if (step > 1) {
                // 核验单（承诺书并存）
                if (image.filePurpose == 1 && !image.otherFileType) {
                  res['realityVerify'] = image
                }
                if (image.filePurpose == 1 && image.isWebsiteChecklist == '2') {
                  res['promiseBook'] = image
                }
                if (image.filePurpose == 5 && !image.otherFileType) {
                  res['screen'] = image
                }
              }
              return res
            }, {})

            const state = {
              orgState: 'none',
              websiteState: 'none',
              realityVerifyState: 'none',
              screenState: 'none'
            }

            // 变更备案
            if (step == 1) {
              const useOrgCertificate = icpOrder.orgPropertyId == '5' ? true : images.orgCertificate
              const useOrgCertificate2 = icpOrder.orgPropertyId == '5' ? false : images.orgCertificate
              if (images.ownCertificate1 && images.ownCertificate2 && images.ownCertificate3 && useOrgCertificate) {
                state.orgState = 'right'
                state.websiteState = 'right'
              } else if (images.ownCertificate1 || images.ownCertificate2 || images.ownCertificate3 || useOrgCertificate2) {
                state.orgState = 'wrong'
                state.websiteState = 'wrong'
              }
              // 个人只判断身份证正反合成照
            } else if (step == 3) {
              if (images.ownCertificate1 && images.ownCertificate2 && images.ownCertificate3) {
                state.orgState = 'right'
                state.websiteState = 'right'
              } else if (images.ownCertificate1 || images.ownCertificate2 || images.ownCertificate3) {
                state.orgState = 'wrong'
                state.websiteState = 'wrong'
              }
              // 企业（非个人）个人三张证件 + 企业证件
            } else if (step == 4) {
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

            const globalDatas = {}
            globalDatas.icp = res.data
            globalDatas.orderCode = res.data.icpOrder.orderCode
            globalDatas.recordType = res.data.icpOrder.orgPropertyId
            globalDatas.orderType = res.data.icpOrder.orderType
            globalDatas.phone = phone
            globalDatas.loading = false
            globalDatas.orgState = state.orgState
            globalDatas.websiteState = state.websiteState
            globalDatas.realityVerifyState = state.realityVerifyState
            globalDatas.screenState = state.screenState
            globalDatas.images = images
            globalDatas.step = step
            globalDatas.uploadOrgWebsiteTitle = uploadOrgWebsiteTitle
            self.setData(globalDatas)
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
          self.setData({ loading: false })
        }
      })
    }
  },
  methods: {
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

<style>
#app {
  -webkit-tap-highlight-color:rgba(0,0,0,0);
}
.noticeError > .mint-toast-text {
  font-size: 15px!important;
}
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
.mint-indicator-wrapper {
  z-index: 10000;
}
.mint-indicator-mask {
  z-index: 10000;
}
</style>

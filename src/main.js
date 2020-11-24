// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import 'lib-flexible'
import App from './App'
import Vuex from 'vuex'
import Mint from 'mint-ui'
import store from './store'
import router from './router'
import Viewer from 'v-viewer'
import 'mint-ui/lib/style.css'
import 'viewerjs/dist/viewer.css'
import utils from './common/utils'
import VueCropper from 'vue-cropper'
import request from './common/request'
import $ from 'jquery'
// import FastClick from 'fastclick'

// FastClick.attch(document.body)
Vue.use(Mint)
Vue.use(Vuex)
Vue.use(VueCropper)
Vue.prototype.utils = utils
Vue.prototype.request = request
Vue.config.productionTip = false
Vue.use(Viewer, {
  defaultOptions: {
    zIndex: 9999
  }
})
Vue.prototype.getDeviceSystem = () => {
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
  return equipmentType
}

// $.ajaxSetup({
//   timeout: 1000 * 45
// })

/* eslint-disable no-new */
const vm = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

function orient() {
  const $org = $('#orgs')
  const $website = $('#website')

  // 竖屏
  if (window.orientation == 0 || window.orientation == 180) {
    $('body').css('overflow', 'auto')
    $('#layer').css('display', 'none')
    $('#layer').removeClass('layer')
    if ($org && $org.length) {
      $org.show()
    }
    if ($website && $website.length) {
      $website.show()
    }
    // 横屏
  } else if (window.orientation == 90 || window.orientation == -90) {
    $('body').css('overflow', 'hidden')
    $('#layer').css('display', 'block')
    $('#layer').addClass('layer')
    if ($org && $org.length) {
      $org.hide()
    }
    if ($website && $website.length) {
      $website.hide()
    }
  }
}
$(function() {
  orient()
})
$(window).on('orientationchange', function(e) {
  orient()
})

function getParams(url) {
  const start = url.indexOf('?') + 1
  const orderCodeUrl = url.slice(start)
  const aOrderCodeUrl = orderCodeUrl.split('&')
  const params = {}
  for (let i = 0; i < aOrderCodeUrl.length; i++) {
    const temp = aOrderCodeUrl[i].split('=')
    const key = temp[0]
    const val = temp[1]
    params[key] = val
  }
  return params
}

router.beforeEach((to, from, next) => {
  const storeOrderCode = window.sessionStorage.getItem('orderCode')
  const { orderType, orderCode } = getParams(window.location.search)
  const loginPage = to.path.indexOf('login') > -1
  if (!loginPage && !storeOrderCode) {
    if (orderType === 'NEW_CHECK_IN' || orderType === 'CHANGE_CHECK_IN' || orderType === 'CHANGE_ORG' || orderType === 'NO_ORG_NEW_CHECK_IN') {
      vm.request({
        url: `/checkPhone?orderCode=${orderCode}`,
        success(data) {
          const res = data.data
          const globalDatas = {}
          if (res.code === 'success') {
            window.sessionStorage.setItem('orderCode', orderCode)
            globalDatas.icp = res.data
            globalDatas.orderCode = res.data.icpOrder.orderCode
            globalDatas.recordType = res.data.icpOrder.orgPropertyId
            globalDatas.orderType = res.data.icpOrder.orderType
            vm.$store.commit('SET_DATA', globalDatas)
            next()
          }
        }
      })
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

// 解决Loading chunk 1 failed的BUG
router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g
  const isChunkLoadFailed = error.message.match(pattern)
  const targetPath = router.history.pending.fullPath
  if (isChunkLoadFailed) {
    router.replace(targetPath)
  }
})

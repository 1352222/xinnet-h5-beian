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

/* eslint-disable no-new */
const vm = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

function orient() {
  // 竖屏
  if (window.orientation == 0 || window.orientation == 180) {
    $('body').attr('overflow', 'auto')
    $('#layer').removeClass('layer')
    // 横屏
  } else if (window.orientation == 90 || window.orientation == -90) {
    $('body').attr('overflow', 'hidden')
    $('#layer').addClass('layer')
  }
}
$(function(){
  orient()
})
$(window).on( 'orientationchange', function(e){
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
      $.ajax({
        url: `/api/miniprogram/checkPhone?orderCode=${orderCode}`,
        success(data) {
          const globalDatas = {}
          if (data.code === 'success') {
            window.sessionStorage.setItem('orderCode', orderCode)
            globalDatas.icp = data.data
            globalDatas.orderCode = data.data.icpOrder.orderCode
            globalDatas.recordType = data.data.icpOrder.orgPropertyId
            globalDatas.orderType = data.data.icpOrder.orderType
            vm.$store.commit('setData', globalDatas)
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

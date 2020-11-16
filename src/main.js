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
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

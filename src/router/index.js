import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: (resolve) => require(['@/pages/Home'], resolve)
    }, {
      path: '/login',
      name: 'Login',
      component: (resolve) => require(['@/pages/login'], resolve)
    }, {
      path: '/list',
      name: 'List',
      component: (resolve) => require(['@/pages/list'], resolve)
    }, {
      path: '/org',
      name: 'Org',
      component: (resolve) => require(['@/pages/org'], resolve)
    }, {
      path: '/website',
      name: 'Website',
      component: (resolve) => require(['@/pages/website'], resolve)
    }, {
      path: '/reality_verify',
      name: 'Reality_verify',
      component: (resolve) => require(['@/pages/reality_verify'], resolve)
    }, {
      path: '/video_verify/step1',
      name: 'Video_step1',
      component: (resolve) => require(['@/pages/video_verify/step1'], resolve)
    }, {
      path: '/video_verify/step2',
      name: 'Video_step2',
      component: (resolve) => require(['@/pages/video_verify/step2'], resolve)
    } , {
      path: '/video_verify/step3',
      name: 'Video_step3',
      component: (resolve) => require(['@/pages/video_verify/step3'], resolve)
    }, {
      path: '/upload_file',
      name: 'Upload_file',
      component: (resolve) => require(['@/pages/upload_file'], resolve)
    }, {
      path: '/merge_file',
      name: 'Merge_file',
      component: (resolve) => require(['@/pages/merge_file'], resolve)
    }, {
      path: '/result',
      name: 'Result',
      component: (resolve) => require(['@/pages/result'], resolve)
    }
  ]
})

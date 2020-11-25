import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Login from '@/pages/login'
import List from '@/pages/list'
import Org from '@/pages/org'
import Website from '@/pages/website'
import RealityVerify from '@/pages/reality_verify'
import Step1 from '@/pages/video_verify/step1'
import Step2 from '@/pages/video_verify/step2'
import Step3 from '@/pages/video_verify/step3'
import UploadFile from '@/pages/upload_file'
import MergeFile from '@/pages/merge_file'
import Result from '@/pages/result'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }, {
      path: '/list',
      name: 'List',
      component: List
    }, {
      path: '/org',
      name: 'Org',
      component: Org
    }, {
      path: '/website',
      name: 'Website',
      component: Website
    }, {
      path: '/reality_verify',
      name: 'Reality_verify',
      component: RealityVerify
    }, {
      path: '/video_verify/step1',
      name: 'Video_step1',
      component: Step1
    }, {
      path: '/video_verify/step2',
      name: 'Video_step2',
      component: Step2
    }, {
      path: '/video_verify/step3',
      name: 'Video_step3',
      component: Step3
    }, {
      path: '/upload_file',
      name: 'Upload_file',
      component: UploadFile
    }, {
      path: '/merge_file',
      name: 'Merge_file',
      component: MergeFile
    }, {
      path: '/result',
      name: 'Result',
      component: Result
    }
  ]
})

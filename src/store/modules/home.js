import * as types from '../mutation-type'

const home = {
    state: {
        number: 1,
        globalData: {
            height: 0,
            // 企业
            // orderCode: 'ICP4257698047009124',
            // 个人
            // orderCode: 'ICP4522313971377992',
            orderCode: '',
            
            apiPath: 'https://tiaoshi.xincache.cn/api/miniprogram',
            serverPath: 'http://tiaoshi.xincache.cn/group1/',
            // phone: 13717616202,
            // phone: 18536595047,
            phone: '',
            // 视频检测图片
            videoVerifyImage: '',
            // 所有备案数据
            icp: {},
            // 备案类型个人，企业等
            recordType: '',
            // 订单业务类型，新增备案，新增接入等
            orderType: '',
            // 上传步骤，上传主体、核验单等
            recordStep: '',
            // 所有附件
            images: {},
            // 上传状态
            orgState: 'none',
            websiteState: 'none',
            realityVerifyState: 'none',
            screenState: 'none',
            org: {
              // 名称
              name: '',
              // 营业执照证件号
              code: '',
              images: [],
              done: false
              // 负责人
              // person: ''
            },
            front: {
              name: '',
              code: '',
              images: [],
              done: false
            },
            side: {
              name: '',
              code: '',
              images: [],
              done: false
            },
        }
    },
    mutations: {
        [types.SET_DATA](state, globalData) {
            state.globalData = globalData
        }
    },
    actions: {},
    getters: {
        globalData: state => {
            return state.globalData
        }
    }
}

export default home
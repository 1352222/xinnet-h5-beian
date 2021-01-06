<template>
  <div id="website" :style="cropper ? 'padding: 0 10px;box-sizing:border-box;background: #000;' : ''">
    <div v-if="cropper" class="croppers">
      <VueCropper
        style="padding: 0 10px;box-sizing:border-box;"
        ref="cropper"
        :img="option.img"
        :outputSize="option.size"
        :outputType="option.outputType"
        :info="true"
        :full="option.full"
        :canMove="option.canMove"
        :canMoveBox="option.canMoveBox"
        :original="option.original"
        :autoCrop="option.autoCrop"
        :fixed="option.fixed"
        :fixedNumber="option.fixedNumber"
        :centerBox="option.centerBox"
        :infoTrue="option.infoTrue"
        :fixedBox="option.fixedBox"
      />
      <!-- :style="'width:' + cropperWidth + 'px;height:' + cropperHeight + 'px;display:block;'" -->
      <span class="image-cropper-hint">
        拖动裁剪框可对图片进行裁剪；<br>
        请将证件照按照示意框的大小和方向进行裁剪；
      </span>
      <img v-if="id === 'side'" id="sides" src="~@/assets/02.png" class="image-cropper-hints" />
      <img v-if="id === 'front'" id="fronts" src="~@/assets/01.png" class="image-cropper-hints" />
      <div class="image-cropper-bottoms">
        <!-- <button
          class="image-cropper-button"
          type="primary"
          @click="changeScale(1)"
          size="mini"
        >
          放大
        </button>
        <button
          class="image-cropper-button"
          type="primary"
          @click="changeScale(-1)"
          size="mini"
        >
          缩小
        </button> -->
        <button
          class="image-cropper-button"
          type="primary"
          data-type="rotate"
          size="mini"
          @click="rotate"
        >
          旋转
        </button>
        <button
          class="image-cropper-button"
          type="primary"
          @click="getCropperImage('blob')"
          size="mini"
        >
          确定
        </button>
        <button
          class="image-cropper-button"
          type="warn"
          @click="resetImage"
          size="mini"
          style="background: #f2f2f2; color: #fa5151"
        >
          丢弃
        </button>
      </div>
    </div>
    <div v-else>
      <div class="container-page log-list">
        <div class="error-info" v-if="showErrorInfo">
          <img class="error-icon" src="~@/assets/warn.png" />
          {{ errorInfo }}
        </div>
      </div>
      <div style="padding: 0px 15px 15px;">
        <div class="bottom">
          <span class="tit">{{ uploadTips }}</span>
          <div class="bgtop">
            <div class="weui-cell" style="padding: 0">
              <div>
                <div ref="clearfix" class="clearfix">
                  <upload-file
                    class="box-left"
                    :type="compType"
                    :num="1"
                    id="front"
                    ref="front"
                    :data="front"
                    bind:cropperimage="cropperImage"
                    bind:chooseimage="chooseImage"
                    bind:clearimage="clearImage"
                  />
                  <upload-file
                    class="box-right"
                    :type="compType"
                    :num="2"
                    ref="side"
                    id="side"
                    :data="side"
                    bind:cropperimage="cropperImage"
                    bind:chooseimage="chooseImage"
                    bind:clearimage="clearImage"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <span class="tit">合成照</span>
        <merge-file ref="merge" id="merge" :type="compType" />
        <div
          class="image-info"
          v-if="frontDone && (websiteOwn.person || websiteOwn.code)"
        >
          <div>
            <span class="label">网站负责人：</span>
            <span class="value">{{ websiteOwn.person }}</span>
          </div>
          <div>
            <span class="label">网站负责人证件号：</span>
            <span class="value">{{ websiteOwn.code }}</span>
          </div>
          <span v-if="allowUpdate" class="update-button" @click="updateOwn"
            >修改</span
          >
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
        <!-- v-if="allowSubmit" -->
        <div v-if="allowSubmit" class="confirm" @click="submit">完成</div>
        <div id="dialog" v-show="dialogShow">
          <div class="border" >
            <div>
                <p class="titleXStyle">{{dialogTitle}}</p>
            </div>
            <div class="table-style">
              <div class="table-describe-style">网站负责人：</div>
              <div class="table-content-style">
                <input class="weui-input" id="websiteOwnPerson" @input="bindinput" :value="websiteOwn.person" />
              </div>
            </div>
            <div class="table-style">
              <div class="table-describe-style">网站负责人证件号：</div>
              <div class="table-content-style">
                <input class="weui-input" id="websiteOwnCode" @input="bindinput" :value="websiteOwn.code" />
              </div>
            </div>
            <div class="button-align-bottom">
              <div class="horizontal-line-style"></div>
              <div class="button-align-bottom-style">
                <div class="cancel-button" @click="() => {this.dialogShow = false}">取消</div>
                <div class="vertical-line-style"></div>
                <div class="punch-button" @click="dialogButton">确定</div>
              </div>
            </div>
          </div>
        </div>
        <div id="dialog" v-show="tipsDialogShow1">
          <div class="border" style="height:30%;top:34%;" >
            <div>
                <p class="titleXStyle">提示</p>
            </div>
            <div class="tips" style="height: 50px;line-height: 20px;">与PC端填写信息不一致，是否使用手机端信息</div>
            <div class="button-align-bottom">
              <div class="horizontal-line-style"></div>
              <div class="button-align-bottom-style">
                <div class="punch-button" v-if="use" @click="tipsDialogButton1('use')">使用</div>
                <div class="vertical-line-style"></div>
                <div class="cancel-button" :style="!use ? 'width:100%' : ''" @click="tipsDialogButton1('modify')">修改</div>
              </div>
            </div>
          </div>
        </div>
        <img v-show="false" id="frontimg" src="~@/assets/01.png" class="image-cropper-hints" />
        <canvas
          class="canvas-hidden"
          ref="canvasimage"
          style="width: 580px; height: 360px;"
          canvas-id="Canvas"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { Indicator, Toast } from 'mint-ui'
import uploadFile from '../upload_file'
import mergeFile from '../merge_file'
import getAttachmentParam from '../../common/getAttachmentParam'
import $ from 'jquery'

export default {
  name: 'Website',
  components: { uploadFile, mergeFile },
  data() {
    return {
      use: true,
      // 开始裁剪状态
      cropper: false,
      cropperType: '',
      // image cropper
      src: '',
      cropperWidth: 300, // 宽度
      cropperHeight: 220, // 高度
      // 是否显示错误提示
      showErrorInfo: false,
      errorInfo: '',
      height: 0,
      canvasWidth: 375,
      canvasHight: 667,
      loading: false,
      // 状态
      frontDone: false,
      sideDone: false,
      mergeDone: false,
      allowSubmit: false,
      allowUpdate: false,
      // dialog
      dialogTitle: '',
      dialogShow: false,
      buttons: [{ text: '取消' }, { text: '保存' }],
      // tips dialog
      tipsDialogShow1: false,
      tipsDialogShow2: false,
      tipsButtons1: [{ text: '使用' }, { text: '修改' }],
      tipsButtons2: [{ text: '去核实' }, { text: '继续' }],
      tipsText: '',
      // 网站负责人信息
      websiteOwn: {
        // 负责人
        person: '',
        // 负责人证件号
        code: ''
      },
      front: {
        name: '',
        code: '',
        done: false,
        option: {},
        images: [],
        image: {},
        imagePath: '',
        imageBase64: '',
        buttonText: ''
      },
      side: {
        name: '',
        code: '',
        done: false,
        option: {},
        images: [],
        image: {},
        imagePath: '',
        imageBase64: '',
        buttonText: ''
      },
      // 开始裁剪状态
      option: {
        img: '',
        info: true, // 裁剪框的大小信息
        outputSize: 0.8, // 裁剪生成图片的质量
        outputType: 'jpeg', // 裁剪生成图片的格式
        canScale: false, // 图片是否允许滚轮缩放
        autoCrop: true, // 是否默认生成截图框
        // autoCropWidth: 300, // 默认生成截图框宽度
        // autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: false, // 固定截图框大小 不允许改变
        fixed: false, // 是否开启截图框宽高固定比例
        fixedNumber: [1, 1], // 截图框的宽高比例
        full: true, // 是否输出原图比例的截图
        canMoveBox: false, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
        infoTrue: true // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
      },
      baseurl: '',
      bb: '',
      // 修改后表单数据
      websiteOwnPerson: '',
      websiteOwnCode: '',
      uploadTips: '',
      // 子组件参数：own，website
      compType: 'website',
      NewCheckIn: false,
      ChangeCheckIn: false,
      NewWebsite: false,
      NoOrgNewWebsite: false,
      NoOrgNewCheckIn: false,
      ChangeOrg: false,
      isPersonal: false
    }
  },
  watch: {
    cropper: {
      handler(newName, oldName) {
        if(newName) {
          setTimeout(() => {
            if (this.id === 'front') {
              const height = (document.documentElement.clientHeight - $("#fronts").height()) / 2
              $("#fronts").css('top', height)
            } else if (this.id === 'side') {
              const height = (document.documentElement.clientHeight - $("#sides").height()) / 2
              $("#sides").css('top', height)
            }
          }, 100)
        } else {
          setTimeout(() => {
            this.$refs.clearfix.className = 'clearfixs'
          }, 0.1)
        }
      }
    }
  },
  mounted() {
    this.overSize()
    // window.onresize = () => {
    //   return(() => {
    //     if (document.body.clientWidth <= 354 && this.$refs.clearfix.className == 'clearfix') {
    //       this.$refs.clearfix.className = 'clearfixs'
    //     } else if (document.body.clientWidth >= 354 && this.$refs.clearfix.className == 'clearfixs') {
    //       this.$refs.clearfix.className = 'clearfix'
    //     }
    //   })()
    // }
    this.height = this.globalData.height * 2 + 100
    if (this.globalData.orderCode) {
      this.onLoad()
    } else {
      this.$watch('globalData.loading', loading => {
        if (!loading) {
          this.onLoad()
        }
      })
    }
    window.addEventListener('resize', this.onOrientationchange, false)
  },
  methods: {
    overSize() {
      if (document.body.clientWidth <= 354 && this.$refs.clearfix.className == 'clearfix') {
        this.$refs.clearfix.className = 'clearfixs'
      }
    },
    onOrientationchange() {
      const { cropper } = this.globalData
      let width = document.documentElement.clientWidth
      let height = document.documentElement.clientHeight
      if (width > height) {
        if (cropper.cropperflag && cropper.croppernum === 0) {
          this.cropper = false
          const croppers = this.globalData.cropper
          croppers.croppernum += 1
          croppers.cropper = false
          this.setData({ cropper: croppers })
        }
      } else {
        if (cropper.cropperflag && cropper.croppernum === 1 && cropper.cropper === false) {
          this.cropper = true
          const croppers = this.globalData.cropper
          croppers.cropper = true
          this.setData({ cropper: croppers })
        }
      }
    },
    onLoad() {
      const { orderType, recordType } = this.globalData
      const NewCheckIn = orderType === 'NEW_CHECK_IN'
      const ChangeCheckIn = orderType === 'CHANGE_CHECK_IN'
      const NewWebsite = orderType === 'NEW_WEBSITE'
      const NoOrgNewWebsite = orderType === 'NO_ORG_NEW_WEBSITE'
      const ChangeOrg = orderType === 'CHANGE_ORG'
      const NoOrgNewCheckIn= orderType === 'NO_ORG_NEW_CHECK_IN'
      const isPersonal = recordType == '5'
      this.NewCheckIn = NewCheckIn
      this.ChangeCheckIn = ChangeCheckIn
      this.NewWebsite = NewWebsite
      this.NoOrgNewWebsite = NoOrgNewWebsite
      this.ChangeOrg = ChangeOrg
      this.isPersonal = isPersonal
      this.NoOrgNewCheckIn = NoOrgNewCheckIn
      // this.setData({ NewCheckIn, ChangeCheckIn, NewWebsite, NoOrgNewWebsite, ChangeOrg, isPersonal })

      // 个人有主体新增网站或变更主体，无主体新增网站，有主体新增接入信息与PC端不一致时只能修改不能使用
      // 无主体新增接入，变更接入 个人或企业都限制
      if (
        (isPersonal && NewWebsite) ||(isPersonal && ChangeOrg)
         || (isPersonal && NoOrgNewWebsite) || ChangeCheckIn
         || (isPersonal && NewCheckIn) || (isPersonal && NoOrgNewCheckIn)
        ) {
        this.use = false
        // this.tipsButtons1 = [{ text: "修改" }]
        // this.setData({ tipsButtons1: [{text: '修改'}] })
      }

      // 获取到image-cropper实例
      // this.cropper = this.selectComponent('#image-cropper')
      this.cropper = this.$refs.cropper
      if (orderType === 'CHANGE_ORG' && recordType == '5') {
        this.setDocumentTitle('主体负责人证件信息')
        this.uploadTips = '请上传主体负责人证件信息'
        // this.setData({ uploadTips: '请上传主体负责人证件信息' })
      } else if (recordType == '5') {
        this.setDocumentTitle('主体/网站负责人证件信息')
        this.uploadTips = '请上传主体/网站负责人证件信息'
        // this.setData({ uploadTips: '请上传主体/网站负责人证件信息' })
      } else {
        this.setDocumentTitle('网站负责人证件信息')
        this.uploadTips = '请上传网站负责人证件信息'
        // this.setData({ uploadTips: '请上传网站负责人证件信息' })
      }

      const compType = recordType == '5' ? 'own' : 'website'
      this.compType = compType
      const merge = this.$refs.merge

      const { images, serverPath } = this.globalData
      const {
        ownCertificate1,
        ownCertificate2,
        ownCertificate3,
        websiteCertificate1,
        websiteCertificate2,
        websiteCertificate3
      } = images

      let frontDone = this.front.done
      let sideDone = this.side.done
      let mergeDone = merge._data.done
      let certificate1
      let certificate2
      let certificate3

      if (recordType == '5' && orderType != 'CHANGE_ORG') {
        certificate1 = ownCertificate1
        certificate2 = ownCertificate2
        certificate3 = [ownCertificate3, websiteCertificate3]
      } else if (recordType == '5' && orderType === 'CHANGE_ORG') {
        certificate1 = ownCertificate1
        certificate2 = ownCertificate2
        certificate3 = [ownCertificate3]
      } else {
        certificate1 = websiteCertificate1
        certificate2 = websiteCertificate2
        certificate3 = [websiteCertificate3]
      }
      if (certificate1 && certificate1.id) {
        frontDone = true
        this.front.imagePath = serverPath + certificate1.filePath
        this.front.images = [serverPath + certificate1.filePath]
        this.front.image = certificate1
        this.front.done = true
        this.$refs.front.setImage(serverPath + certificate1.filePath, certificate1)
      }
      if (certificate2 && certificate2.id) {
        sideDone = true
        this.side.imagePath = serverPath + certificate2.filePath
        this.side.images = [serverPath + certificate2.filePath]
        this.side.image = certificate2
        this.side.done = true
        this.$refs.side.setImage(serverPath + certificate2.filePath, certificate2)
      }
      if (certificate3[0] && certificate3[0].id) {
        mergeDone = true
        merge.setImage(serverPath + certificate3[0].filePath, certificate3)
      }

      const { icpOrgOrder, icpWebsiteOrder } = this.globalData.icp
      const websiteOwn = {}
      let websiteOwnPerson = ''
      let websiteOwnCode = ''

      // 个人取主体数据，企业取网站数据
      if (this.globalData.recordType == 5) {
        // 主办单位信息
        // websiteOwn.orgName = icpOrgOrder.orgName
        // 主办单位证件号
        // websiteOwn.orgCode = icpOrgOrder.certificateCode
        // 主办单位负责人
        // websiteOwn.orgPerson = icpOrgOrder.orgOwnerCertificateCode

        // 有主体新增网站从获取icpWebsiteOrder数据
        if (orderType === 'NEW_WEBSITE') {
          if (icpWebsiteOrder) {
            websiteOwn.person = icpWebsiteOrder.websiteOwnerName
            websiteOwnPerson = icpWebsiteOrder.websiteOwnerName
            websiteOwn.code = icpWebsiteOrder.websiteOwnerCertificateCode
            websiteOwnCode = icpWebsiteOrder.websiteOwnerCertificateCode
          }
        } else {
          if (icpOrgOrder) {
            // 网站负责人
            websiteOwn.person = icpOrgOrder.orgOwnerName
            websiteOwnPerson = icpOrgOrder.orgOwnerName
            // 网站负责人证件号
            websiteOwn.code = icpOrgOrder.certificateCode
            websiteOwnCode = icpOrgOrder.certificateCode
          }
        }
      } else {
        if (icpWebsiteOrder) {
          websiteOwn.person = icpWebsiteOrder.websiteOwnerName
          websiteOwnPerson = icpWebsiteOrder.websiteOwnerName
          websiteOwn.code = icpWebsiteOrder.websiteOwnerCertificateCode
          websiteOwnCode = icpWebsiteOrder.websiteOwnerCertificateCode
        }
      }
      this.websiteOwn = websiteOwn
      this.websiteOwnPerson = websiteOwnPerson
      this.websiteOwnCode = websiteOwnCode
      this.frontDone = frontDone
      this.sideDone = sideDone
      this.mergeDone = mergeDone

      if (frontDone && sideDone && mergeDone) {
        this.setAllowSubmit()
      }
    },
    // 放大缩小
    changeScale(num) {
      num = num || 1
      this.$refs.cropper.changeScale(num)
    },
    // 裁剪图片旋转
    rotate(e) {
      e.preventDefault()
      this.$refs.cropper.rotateRight()
    },
    // 丢弃图片数据
    resetImage(e) {
      this.srcs = ''
      this.option.img = ''
      this.cropper = false
      const croppers = this.globalData.cropper
      croppers.cropper = false
      croppers.cropperflag = true
      croppers.croppernum = 0
      this.setData({cropper: croppers})
      this.cropperType = ''
      // setTimeout(() => {
      //   this.$refs.clearfix.className = 'clearfixs'
      //   console.log(this.$refs.clearfix, 'nn')
      // //   this.overSize()
      // }, 0.0001)
    },
    cropImagedata(a, file, id, imageBase64) {
      this.srcs = a
      this.option.img = a
      let width = document.documentElement.clientWidth
      let height = document.documentElement.clientHeight
      if (width < height) {
        this.cropper = true
      }
      this.fileName = file.name
      this.id = id
    },
    // 调用裁剪工具
    cropperImage(e) {
      const { src } = e.detail
      const { id } = e.currentTarget
      this.src = src
      this.cropper = true
      this.cropperType = id
      Indicator.close()
    },
    // 完成裁剪
    getCropperImage(type) {
      // let _this = this
      let formData = new FormData()
      if (type === 'blob') {
        this.$refs.cropper.getCropBlob((data) => {
          let img = window.URL.createObjectURL(data)
          this.model = true
          this.modelSrc = img
          formData.append('file', data, this.fileName)
          this.cropper = false
          const croppers = this.globalData.cropper
          croppers.cropper = false
          croppers.cropperflag = true
          croppers.croppernum = 0
          this.setData({cropper: croppers})
          this.bb = img
          this.$refs.cropper.getCropData(data => {
            let url = data.substring(data.indexOf(',') + 1, data.length)
            this.baseurl = url
            this.chooseImage(url, img)
          })
        })
      }
    },
    cropperload(e) {},
    end(e) {
      clearInterval(this.data[e.currentTarget.dataset.type])
    },

    setAllowSubmit(allowSubmit = true) {
      this.allowSubmit = allowSubmit
    },
    // 修改负责人信息
    updateOwn() {
      this.dialogTitle = '修改证件信息'
      this.dialogShow = true
    },
    // 修改单条数据触发
    bindinput(e) {
      const key = e.currentTarget.id
      const value = e.target.value
      this[key] = value
    },
    // 修改数据
    saveData() {
      const self = this
      const { orderCode } = this.globalData
      const websiteOwnPerson = this.websiteOwnPerson
      const websiteOwnCode = this.websiteOwnCode
      const data = {
        orderCode,
        idCardFrontAttachment: {
          ocrOrgOwnerName: websiteOwnPerson,
          ocrOrgOwnerCode: websiteOwnCode
        }
      }

      return new Promise((resolve) => {
        Indicator.open('请稍后...')
        self.request({
          url: `/saveWebsiteInfo`,
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          // dataType: 'json',
          // data: JSON.stringify(data),
          data,
          success(res) {
            Indicator.close()
            // 保存成功后同步数据
            self.websiteOwn.code = websiteOwnCode
            self.websiteOwn.person = websiteOwnPerson
            resolve()
          }
        })
      })
    },
    saveLocalData() {
      this.websiteOwn.person = this.websiteOwnPerson
      this.websiteOwn.code = this.websiteOwnCode
    },
    // 修改确认
    dialogButton() {
      this.saveLocalData()
      this.dialogShow = false
    },
    setUploadSuccessData() {
      // const self = this
      // const front = this.selectComponent('#front')
      // const side = this.selectComponent('#side')
      // const merge = this.selectComponent('#merge')
      const front = this.front
      const side = this.side
      const merge = this.$refs.merge

      // 正反面均已上传执行合并
      if (front.done && side.done) {
        // 营业执照上传完成，调用回调显示提交按钮状态
        merge.mergeImage(
          front.imagePath,
          side.imagePath,
          true,
          this.setAllowSubmit
        )
      }

      // 设置各附件上传状态
      if (front.done && side.done && merge._data.done) {
        this.setAllowSubmit(true)
      } else {
        this.setAllowSubmit(false)
      }
      this.frontDone = front.done
      this.sideDone = side.done
      this.mergeDone = merge._data.done
    },
    setUploadFailData(id) {
      const front = this.$refs.front
      const side = this.$refs.side

      if (id === 'side') {
        side.clearImageData()
      } else if (id === 'front') {
        front.clearImageData()
      }
    },
    setErrorInfo(showErrorInfo = false, errorInfo = '') {
      this.showErrorInfo = showErrorInfo
      this.errorInfo = errorInfo
    },
    writeimage(url, img) {
      // let org = this.$refs.org._data
      // let front = this.$refs.front._data
      // let side = this.$refs.side._data
      let front = this.front
      let side = this.side
      if (this.id === 'front') {
        front.imageBase64 = url
        front.imagePath = img
        front.images = [img]
        front.done = true
      } else if (this.id === 'side') {
        side.imageBase64 = url
        side.imagePath = img
        side.images = [img]
        side.done = true
      }
    },
    chooseImage(url, img) {
      const self = this
      // const front = $('#front')
      // const side = $('#side')
      // const merge = this.$refs.merge

      const id = this.id
      const data = { orderCode: this.globalData.orderCode }
      const NewCheckIn = this.NewCheckIn
      const ChangeCheckIn = this.ChangeCheckIn
      // 新增接入，变更接入，变更主体不做OCR
      // OCR识别数据回显
      // if (!NewCheckIn && !ChangeCheckIn) {
      data.idCardFrontAttachment = {
        byteFile: url,
        side: id === 'side' ? 'back' : 'front'
      }
      Indicator.open('识别中...')
      self.request({
        url: `/ocrIdCard`,
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // dataType: 'json',
        // data: JSON.stringify(data),
        data,
        success(res) {
          Indicator.close()
          const { code, data, message } = res.data
          if (code === 'success' && id === 'front') {
            // 每次OCR后更新修改操作表单
            const websiteOwnPerson = data.ocrOrgOwnerName
            const websiteOwnCode = data.ocrOrgOwnerCode
            self.websiteOwn.person = data.ocrOrgOwnerName
            self.websiteOwn.code = data.ocrOrgOwnerCode
            self.websiteOwnPerson = websiteOwnPerson
            self.websiteOwnCode = websiteOwnCode
            self.writeimage(self.baseurl, self.bb)
            self.setUploadSuccessData()
            self.setErrorInfo()
            self.allowUpdate = true
          } else if (code === 'success' && id === 'side') {
            self.writeimage(self.baseurl, self.bb)
            self.setUploadSuccessData()
            self.setErrorInfo()
          } else {
            self.setUploadFailData(self.idCardBackAttachment)
            self.setErrorInfo(true, message)
          }
        }
      }, () => self.setUploadFailData(self.id))
      // } else {
      //   self.writeimage(self.baseurl, self.bb)
      //   self.setUploadSuccessData()
      // }
    },
    clearScreenAndVerifyImage() {
      const { screen, realityVerify, promiseBook } = this.globalData.images
      let param = ''
      const self = this
      if (screen && screen.id) {
        param += `attachmentOrderIds=${screen.id}`
      }
      if (realityVerify && realityVerify.id) {
        const url = `attachmentOrderIds=${realityVerify.id}`
        param = param ? param + '&' + url : url
      }
      if (promiseBook && promiseBook.id) {
        const url = `attachmentOrderIds=${promiseBook.id}`
        param = param ? param + '&' + url : url
      }
      if (param) {
        self.request({
          url: `/deleteAttachment?${param}`,
          success(res) {
            const { code, message } = res.data
            if (code === 'success') {
              let globalDatas = self.globalData
              globalDatas.images.screen = {}
              self.setData(globalDatas)
              // app.globalData.images.screen = {}
            } else {
              Toast({
                message: message,
                duration: 3000,
                className: 'noticeError'
              })
            }
          }
        })
      }
    },
    delOrgImage() {
      const self = this
      const image = this.globalData.images.orgCertificate
      if (image && image.id) {
        const param = `attachmentOrderIds=${image.id}`
        this.request({
          url: `/deleteAttachment?${param}`,
          success(res) {
            const { code, message } = res.data
            if (code === 'success') {
              let globalDatas = self.globalData
              globalDatas.images.orgCertificate = {}
              self.setData(globalDatas)
            } else {
              Toast({
                message: message,
                duration: 3000,
                className: 'noticeError'
              })
            }
          }
        })
      }
    }, // 删除网站负责人附件也删除幕布照和合成照
    clearImage(id) {
      const { orderType, recordType } = this.globalData
      // const front = this.front
      // const side = this.side
      const merge = this.$refs.merge

      if (id === 'front') {
        merge.clearImage()
        this.frontDone = false
        this.mergeDone = false
        this.front = {
          name: '',
          code: '',
          done: false,
          option: {},
          images: [],
          image: {},
          imagePath: '',
          imageBase64: '',
          buttonText: ''
        }
      } else if (id === 'side') {
        merge.clearImage()
        this.sideDone = false
        this.mergeDone = false
        this.side = {
          name: '',
          code: '',
          done: false,
          option: {},
          images: [],
          image: {},
          imagePath: '',
          imageBase64: '',
          buttonText: ''
        }
      }
      // 非变更主体
      if (orderType != 'CHANGE_ORG') {
        this.clearScreenAndVerifyImage()
        // 个人备案需要删除营业执照证件
        if (recordType == 5) {
          this.delOrgImage()
        }
      }
      this.setAllowSubmit(false)
      this.delImageLock()
    },
    delImageLock() {
      const { orderCode, orderType, recordType } = this.globalData
      let type
      if (orderType == 'CHANGE_ORG') {
        type = 'types=ORG'
      } else if (recordType == 5) {
        type = 'types=ORG&type=WEBSITE'
      } else if (recordType != 5) {
        type = 'types=WEBSITE'
      }
      this.request({
        url: `/unlock?orderCode=${orderCode}&${type}`,
        success(res) {
          const { code, message } = res.data
          if (code != 'success') {
            Toast({
              message: message,
              duration: 3000,
              className: 'noticeError'
            })
          }
        }
      })
    },
    // 调用对局比对、检验工商接口
    checkData() {
      Indicator.open('请稍后...')
      const self = this
      const { orderCode } = this.globalData
      const websiteOwn = this.websiteOwn
      const data = {
        orderCode,
        idCardFrontAttachment: {
          ocrOrgOwnerName: websiteOwn.person,
          ocrOrgOwnerCode: websiteOwn.code
        }
      }
      return new Promise((resolve) => {
        self.request({
          url: `/idCardAttachment`,
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          // dataType: 'json',
          // data: JSON.stringify(data),
          data,
          success(res) {
            Indicator.close()
            const { code, data, message } = res.data
            if (!data) {
              self.setErrorInfo(true, message)
              return
            }
            const { idCardFrontAttachment } = data
            // OCR数据和库中不一样
            if (
              !(
                idCardFrontAttachment.ocrOrgOwnerNameResult &&
                idCardFrontAttachment.ocrOrgOwnerCodeResult
              ) ||
              code != 'success'
            ) {
              self.tipsDialogShow1 = true
              // self.setData({ tipsDialogShow1: true })
              return
            }

            resolve()
          }
        })
      })
    },
    // 完成提交所有附件
    submitData() {
      const front = this.front
      const side = this.side
      const merge = this.$refs.merge
      const { orderCode, recordType } = this.globalData
      const data = { orderCode: orderCode }
      const type = recordType == '5' ? 'ORG' : 'WEBSITE'
      const filePurpose = recordType == '5' ? 3 : 4
      const self = this
      if (!front.image.id) {
        data.idCardFrontAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            picSequenceNum: 1,
            fileState: 'SINGLE',
            filePurpose,
            type,
            byteFile: front.imageBase64
          }, this.globalData)
        }
      }
      if (!side.image.id) {
        data.idCardBackAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            picSequenceNum: 2,
            fileState: 'SINGLE',
            filePurpose,
            type,
            byteFile: side.imageBase64
          }, this.globalData)
        }
      }
      const mergeImage = merge._data.image
      if (!(mergeImage.length && mergeImage[0].id)) {
        data.idCardMergeAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            picSequenceNum: 3,
            fileState: 'MERGE',
            filePurpose,
            type,
            byteFile: merge._data.imageBase64.slice(23)
          }, this.globalData)
        }
      }
      // 3张附件未修改不用提交
      if (
        front.image.id &&
        side.image.id &&
        mergeImage.length &&
        mergeImage[0].id
      ) {
        // wx.showToast({ title: '上传成功！' })
        Toast({
          message: '上传成功！',
          duration: 3000,
          className: 'noticeError'
        })
        self.$router.push('/list')
        // wx.navigateBack()
        return
      }

      Indicator.open('请稍后...')
      self.request({
        url: `/saveAttachment`,
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // dataType: 'json',
        // data: JSON.stringify(data),
        data,
        success(res) {
          Indicator.close()
          const { code, message } = res.data
          if (code === 'success') {
            Toast({
              message: '上传成功！',
              duration: 3000,
              className: 'noticeError'
            })
            self.$router.push('/list')
          } else {
            Toast({
              message: message,
              duration: 3000,
              className: 'noticeError'
            })
          }
        }
      })
    },
    // 完成
    submit() {
      // const { NewCheckIn, ChangeCheckIn, NoOrgNewWebsite } = this.data
      const NewCheckIn = this.NewCheckIn
      const ChangeCheckIn = this.ChangeCheckIn
      const NoOrgNewWebsite = this.NoOrgNewWebsite
      const NoOrgNewCheckIn = this.NoOrgNewCheckIn
      //与pc端做比对 有主体新增接入，变更接入，无主体新增网站，无主体新增接入
      // if (NewCheckIn || ChangeCheckIn || NoOrgNewWebsite || NoOrgNewCheckIn) {
      //   this.submitData()
      // } else {
      this.checkData().then(this.submitData)
      // }
    },
    // 数据不一致
    tipsDialogButton1(action) {
      const { NewCheckIn, ChangeCheckIn, NoOrgNewWebsite, NoOrgNewCheckIn } = this
      // 使用：先保存数据然后工商校验，校验通过提交所有附件数据
      if (action === 'use') {
        this.tipsDialogShow1 = false
        if (NewCheckIn || ChangeCheckIn || NoOrgNewWebsite || NoOrgNewCheckIn) {
          this.saveData().then(this.submitData)
        } else {
          this.saveData().then(this.checkData).then(this.submitData)
        }
        // 修改：展示修改操作
      } else if (action === 'modify') {
        // 关闭弹窗，显示修改按钮
        this.tipsDialogShow1 = false
        this.allowUpdate = true
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
#website {
  width: 100%;
  height: 100%;
}
.croppers {
  width: 100%;
  height: 100%;
  position: relative;
}
.croppers > div:first-child {
  display: block;
  position: absolute;
  left: 0;
  /* top: 91px; */
  z-index: 9991;
  background: rgb(14, 13, 13);
  width: 100%;
  height: 100%;
}

.image-cropper-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99991;
  width: 100%;
  height: 100%;
  background: rgb(14, 13, 13);
}

.image-cropper-hint {
  position: absolute;
  top: 5px;
  width: 100%;
  font-size: 16px;
  text-align: center;
  color: white;
  z-index: 99992;
}

.image-cropper-hints {
  position: absolute;
  left: 0;
  top: 224px;
  width: 100%;
  font-size: 16px;
  text-align: center;
  color: white;
  z-index: 99992;
  pointer-events: none;
}

.image-cropper-bottoms {
  position: absolute;
  width: 100%;
  height: 50px;
  bottom: 0;
  z-index: 99992;
  text-align: center;
}

.image-cropper-button {
  margin-right: 5px;
  padding: 7px 12px;
  border-radius: 4px;
  border: none;
  color: #fff;
  background: #07c160;
  font-weight: 600;
  outline: 0;
}
.image-cropper-button:focus {
  outline: 0;
}

.container-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #e4eaf6;
  box-sizing: border-box;
}
.top,
.bottom {
  background: #fff;
  /* padding: 0 15px 15px; */
  margin-bottom: 15px;
}
.top {
  padding-bottom: 10px;
}
/* 文字样式 */
.tit {
  font-size: 15px;
  height: 55px;
  line-height: 55px;
  color: #1b1b20;
}
/* 身份证正反面上传 */
.bgtop {
  margin-bottom: 35px;
}
.log-item {
  margin: 5px;
}
.weui-cells:after {
  border: none;
}
.weui-cell:after {
  border: none;
}

.clearfix:after {
  content: "";
  clear: both;
  display: block;
}

.clearfixs:after {
  content: "";
  clear: both;
  display: block;
}

.clearfixs > div:first-child {
  margin-bottom: 40px;
}

.clearfixs > div {
  float: none;
  text-align: center;
}

.box-left {
  float: left;
}

.box-right {
  float: right;
}

.borders {
  position: absolute;
  width: 10px;
  height: 10px;
}

.upload-imgs {
  padding: 5px;
  box-sizing: border-box;
}

.confirm {
  background: #3485e1;
  color: #fff;
  font-size: 17px;
  text-align: center;
  height: 45px;
  width: 90%;
  border-radius: 5px;
  margin: 15px auto;
  line-height: 45px;
}

/* 身份证合成照 */
.compound-img {
  background: #f4f8fe;
  position: relative;
  width: 162px;
  height: 180px;
  margin: 0 auto;
}

.top-left-border2 {
  top: 7px;
  left: 25px;
  border-top: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.top-right-border2 {
  top: 7px;
  left: 127px;
  border-top: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.bottom-left-border2 {
  bottom: 7px;
  left: 25px;
  border-bottom: 2px #4280f2 solid;
  border-left: 2px #4280f2 solid;
}
.bottom-right-border2 {
  bottom: 7px;
  left: 127px;
  border-bottom: 2px #4280f2 solid;
  border-right: 2px #4280f2 solid;
}
.compound-imgs {
  width: 104px;
  height: 137px;
  margin-left: 30px;
  margin-top: 20px;
}
.confirm {
  background: #3485e1;
  color: #fff;
  font-size: 17px;
  text-align: center;
  height: 45px;
  width: 90%;
  border-radius: 5px;
  margin: 15px auto;
  line-height: 45px;
}
.image-desc {
  font-size: 10px;
  color: #ff001d;
}
.image-info {
  position: relative;
  font-size: 13px;
}
.update-button {
  position: absolute;
  top: 0;
  right: 0;
  width: 58px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  border-radius: 10px;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(to right, #388de7, #2c6fd2);
}
.image-info .label {
  color: #666;
}
.image-info .value {
  color: #333;
}

.dialog {
}
.weui-dialog {
  width: 325px;
}
.weui-dialog__hd {
  border: 1px solid #ededed;
}
/*
.weui-dialog__hd {
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}
.weui-dialog__title {
  color: #fff;
}
*/
.weui-dialog__bd {
  padding: 0;
}
.weui-dialog .form {
  padding: 0;
  font-size: 13px;
}
.weui-dialog .fields {
  display: flex;
  padding: 17px 0 10px;
  border-bottom: 1px solid #e5e5e5;
}
.weui-dialog .label {
  flex: 1 0 auto;
  color: #666;
  line-height: 22px;
  margin-left: 24px;
}
.weui-dialog .weui-input {
  text-align: left;
  color: #333;
}

.weui-input:focus {
  outline: none;
  border: solid 1px #0069ff;
}

.weui-dialog .tips {
  padding-top: 15px;
  font-size: 13px;
  color: #333;
}

.error-info {
  height: 20px;
  line-height: 20px;
  text-align: left;
  font-size: 13px;
  color: #ff001d;
  padding: 10px 15px;
  background: #ffe9db;
  margin-bottom: 15px;
}

.error-icon {
  width: 12px;
}

.image-cropper-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99991;
  width: 100%;
  height: 100%;
  background: #fff;
  background: rgb(14, 13, 13);
}

.image-cropper-hint {
  position: absolute;
  top: 5px;
  width: 100%;
  font-size: 16px;
  text-align: center;
  color: white;
  z-index: 99992;
}

.image-cropper-bottoms {
  position: absolute;
  width: 100%;
  height: 50px;
  bottom: 0;
  z-index: 99992;
  text-align: center;
}

.image-cropper-button {
  margin-right: 5px;
}

.beian-dialog .weui-dialog {
  border-radius: 4px;
}

.beian-dialog .weui-dialog__hd {
  margin: 0;
  padding: 0;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  border: none;
  background: linear-gradient(to right, #3754c9, #2a6bc7);
}

.beian-dialog .weui-dialog__hd .weui-dialog__title {
  font-weight: normal;
  height: 60px;
  line-height: 60px;
  letter-spacing: 2px;
}

.beian-dialog .weui-dialog__ft {
  position: relative;
  margin: 0 20px 25px;
  line-height: 18px;
  min-height: 18px;
  font-size: 18px;
}

.beian-dialog .weui-dialog__ft:after {
  border-top: none;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn {
  font-size: 18px;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
}

.beian-dialog .weui-dialog__ft :first-child {
  margin-right: 11px;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn_default {
  background: #f3f4f8;
  color: #333;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn_primary {
  background: linear-gradient(to right, #388de7, #2c6fd2);
  color: #fff;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn:after {
  border-left: none;
}

#dialog {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  z-index: 1000;
}
.fc-black {
  color: #333 !important;
}
.check-mes {
  display: block;
  width: 100%;
  height: 80px;
  background-color: #f7f7f7;
  padding: 10px;
  font-size: 16px;
  line-height: 20px;
  border-radius: 5px;
}

.horizontal-line-style {
  background: #dcdcdc;
  width: 100%;
  height: 1px;
}
.vertical-line-style {
  background: #000;
  width: 1px;
  height: 100%;
}
.titleXStyle {
  margin-top: 20px;
  font-size: 18px;
  color: #333333;
  letter-spacing: 0;
  text-align: center;
  line-height: 26px;
  font-weight: bold;
}
.table-style {
  margin-left: 20px;
  margin-right: 20px;
  /* display: flex; */
}
.table-content-style {
  font-size: 16px;
  color: #333333;
  line-height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  order: 2;
  word-wrap: break-word;
  overflow: hidden;
}
.table-describe-style {
  color: #999999;
  letter-spacing: 0;
  font-size: 16px;
  line-height: 24px;
  padding-top: 5px;
  padding-bottom: 5px;
  /* width: 40px; */
  display: block;
  order: 1;
  flex: 0 0 auto;
}
.table-content-remark {
  background: #f7f7f7;
  border-radius: 6px;
  font-size: 16px;
  color: #333333;
}

.border {
  background-color: white;
  border-radius: 6px;
  width: 80%;
  height: 300px;
  position: absolute;
  left: 10%;
  top: 17%;
  z-index: 1000;
  /*transform: translate(-50%,-50%);*/
}
.media-upload-categray-type {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
  /* display: flex; */
}
.cancel-button {
  width: 50%;
  text-align: center;
  font-size: 18px;
  color: #666666;
  letter-spacing: 0;
  line-height: 44px;
  background: #ffffff;
}
.punch-button {
  flex-grow: 1;
  text-align: center;
  color: #3a90f6;
  line-height: 44px;
  font-size: 18px;
  letter-spacing: 0;
  background: #ffffff;
}
.button-align-bottom {
  bottom: 5px;
  position: absolute;
  width: 100%;
}
.button-align-bottom-style {
  width: 100%;
  display: flex;
}
input {
  line-height: 30px;
  border-radius: 4px;
  border: solid 1px #ccc;
  padding: 0 4px;
  width: 100%;
}

.canvas-hidden {
  position: absolute;
  top: -10000px;
  left: 0;
}
.tips {
  line-height: 30px;
  margin-left: 10px;
  font-size: 14px;
}
</style>

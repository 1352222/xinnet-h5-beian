<template>
  <div id="orgs" :style="cropper ? 'padding: 0 10px;box-sizing:border-box;background: #000;' : ''">
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
        :ready="cropImage"
        :zoom="cropImage"
        :cropmove="cropImage"
      />
        <!-- :style="'width:' + cropperWidth + 'px;height:' + cropperHeight + 'px;display:block;'" -->
      <span class="image-cropper-hint">点击中间裁剪框可查看裁剪后的图片</span>
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
          style="background:#f2f2f2;color:#fa5151;"
        >
          丢弃
        </button>
      </div>
    </div>
    <div :style="!cropper ? '' : 'display:none;'">
      <div class="container-page log-list">
        <div class="error-info" v-if="showErrorInfo">
          <img class="error-icon" src="~@/assets/warn.png" />
          {{errorInfo}}
        </div>
      </div>

      <div class="org-top">
        <span class="tit" @click="cropImage">{{orgTitle}}</span>
        <div class="bgtop">
          <div class="weui-cell" style="padding:0;">
            <div class="weui-cell__bd">
              <div id="org1" class="weui-uploader upload-bgs" style="text-align:center">
                <upload-file
                  type="org"
                  id="org"
                  ref="org"
                  :data="org"
                  bind:cropperimage="cropperImage"
                  bind:chooseimage="chooseImage"
                  bind:clearimage="clearImage"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="image-info" v-if="orgDone && (org.name || org.code)">
          <div>
            <span class="label">主办单位名称：</span>
            <span class="value">{{org.name}}</span>
          </div>
          <div>
            <span class="label">主办单位证件号：</span>
            <span class="value">{{org.code}}</span>
          </div>
          <div v-if="allowUpdate" class="update-button" @click="updateOrg">修改</div>
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
      </div>

      <div class="org-bottom">
        <span class="tit">请上传法人证件信息</span>
        <div class="bgtop">
          <div class="weui-cell" style="padding: 0;">
            <div>
              <div id="front1" class="clearfix">
                <upload-file
                  class="box-left"
                  type="own"
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
                  type="own"
                  :num="2"
                  id="side"
                  ref="side"
                  :data="side"
                  bind:cropperimage="cropperImage"
                  bind:chooseimage="chooseImage"
                  bind:clearimage="clearImage"
                />
              </div>
            </div>
          </div>
        </div>

        <span class="tit">合成照</span>
        <merge-file ref="merge" id="merge" type="own" />
        <div class="image-info" v-if="frontDone && (own.person || own.code)">
          <div>
            <span class="label">主办单位负责人：</span>
            <span class="value">{{own.person}}</span>
          </div>
          <div>
            <span class="label">主办单位负责人证件号：</span>
            <span class="value">{{own.code}}</span>
          </div>
          <span v-if="allowUpdate" class="update-button" @click="updateOwn">修改</span>
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
        <div v-if="allowSubmit" class="confirm" @click="submit">完成</div>

        <div id="dialog" v-show="dialogShow">
          <div class="border" >
            <div>
                <p class="titleXStyle">{{dialogTitle}}</p>
            </div>
           <div v-if="dialogType === 'org'">
              <div class="table-style">
                <div class="table-describe-style">主办单位名称：</div>
                <div class="table-content-style">
                  <input class="weui-input" id="orgName" @input="bindinput" :value="org.name" />
                </div>
              </div>
              <div class="table-style">
                <div class="table-describe-style">主办单位证件号：</div>
                <div class="table-content-style">
                  <input class="weui-input" id="orgCode" @input="bindinput" :value="org.code" />
                </div>
              </div>
           </div>
           <div v-else-if="dialogType === 'own'">
              <div class="table-style">
                <div class="table-describe-style">主办单位负责人：</div>
                <div class="table-content-style">
                  <input class="weui-input" id="ownPerson" @input="bindinput" :value="own.person" />
                </div>
              </div>
              <div class="table-style">
                <div class="table-describe-style">主办单位证件号：</div>
                <div class="table-content-style">
                  <input class="weui-input" id="ownCode" @input="bindinput" :value="own.code" />
                </div>
              </div>
           </div>
            <div class="button-align-bottom">
              <div class="horizontal-line-style"></div>
              <div class="button-align-bottom-style">
                <div class="cancel-button" @click="dialogHidden">取消</div>
                <div class="vertical-line-style"></div>
                <div class="punch-button" @click="dialogButton">确定</div>
              </div>
            </div>
          </div>
        </div>

        <div id="dialog" v-show="tipsDialogShow1">
          <div class="border" style="height:25%;top:34%;">
            <div>
                <p class="titleXStyle">提示</p>
            </div>
            <div class="tips">与PC端填写信息不一致，是否使用手机端信息</div>
            <div class="button-align-bottom">
              <div class="horizontal-line-style"></div>
              <div class="button-align-bottom-style">
                <div class="punch-button" v-if="use" :buttons="tipsButtons1" @click="tipsDialogButton1('use')">使用</div>
                <div class="vertical-line-style"></div>
                <div class="cancel-button" :style="!use ? 'width:100%' : ''"  @click="tipsDialogButton1('modify')">修改</div>
              </div>
            </div>
          </div>
        </div>

        <div id="dialog" v-show="tipsDialogShow2">
          <div class="border" style="height:25%;top:34%;">
            <div>
              <p class="titleXStyle">提示</p>
            </div>
            <div class="tips">{{tipsText}}</div>
            <div class="button-align-bottom">
              <div class="horizontal-line-style"></div>
              <div class="button-align-bottom-style">
                <div class="cancel-button" @click="tipsDialogButton2('verify')">去核实</div>
                <div class="vertical-line-style"></div>
                <div class="punch-button" @click="tipsDialogButton2('continue')">继续</div>
              </div>
            </div>
          </div>
        </div>
        <canvas class="canvas-hidden" ref="canvasimage" style="width: 580px; height: 360px;" canvas-id="Canvas"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import uploadFile from '../upload_file'
import mergeFile from '../merge_file'
import { Indicator, Toast } from 'mint-ui'
import getAttachmentParam from '../../common/getAttachmentParam'
// import $ from 'jquery'

export default {
  name: 'Orgs',
  components: { uploadFile, mergeFile },
  data() {
    return {
      use: true,
      bb: '',
      baseurl: '',
      type: '',
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
      id: '',
      fileName: '',
      cropper: false,
      cropperType: '',
      // image cropper
      src: '',
      srcs: '',
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
      orgDone: false,
      frontDone: false,
      sideDone: false,
      mergeDone: false,
      allowSubmit: false,
      allowUpdate: false,
      // dialog
      dialogTitle: '',
      dialogShow: false,
      // org, own
      dialogType: '',
      buttons: [{ text: '取消' }, { text: '保存' }],
      // tips dialog
      tipsDialogShow1: false,
      tipsDialogShow2: false,
      tipsButtons1: [{ text: '使用' }, { text: '修改' }],
      tipsButtons2: [{ text: '去核实' }, { text: '继续' }],
      tipsText: '',
      // 主办单位信息
      org: {
        // 名称
        name: '',
        // 营业执照证件号
        code: '',
        done: false,
        option: {},
        images: [],
        image: {},
        imagePath: '',
        imageBase64: '',
        buttonText: ''
        // 负责人
        // person: ''
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
      // 主办单位负责人信息
      own: {
        // 负责人
        person: '',
        // 负责人证件号
        code: ''
      },
      // 修改后表单数据
      orgName: '',
      orgCode: '',
      // orgPerson: '',
      ownPerson: '',
      ownCode: '',
      // 企业证件提示title
      orgTitle: '请上传营业执照',
      NewCheckIn: '',
      ChangeCheckIn: '',
      NewWebsite: '',
      NoOrgNewWebsite: ''
    }
  },
  mounted: function () {
    this.setDocumentTitle('主体证件信息')
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
  },
  methods: {
    onLoad() {
      // 获取到image-cropper实例
      this.cropper = this.$refs.cropper

      const org = this.org
      const front = this.front
      const side = this.side
      const merge = this.$refs.merge

      const images = this.globalData.images
      const {
        orgCertificate,
        ownCertificate1,
        ownCertificate2,
        ownCertificate3
      } = images
      let orgDone = org.done
      let frontDone = front.done
      let sideDone = side.done
      let mergeDone = merge._data.done

      const serverPath = this.globalData.serverPath
      if (orgCertificate && orgCertificate.id) {
        orgDone = true
        this.org.imagePath = serverPath + orgCertificate.filePath
        this.org.images = [serverPath + orgCertificate.filePath]
        this.org.image = orgCertificate
        this.org.done = true
        this.$refs.org.setImage(serverPath + orgCertificate.filePath, orgCertificate)
      }
      if (ownCertificate1 && ownCertificate1.id) {
        frontDone = true
        this.front.imagePath = serverPath + ownCertificate1.filePath
        this.front.images = [serverPath + ownCertificate1.filePath]
        this.front.image = ownCertificate1
        this.front.done = true
        this.$refs.front.setImage(serverPath + ownCertificate1.filePath, ownCertificate1)
      }
      if (ownCertificate2 && ownCertificate2.id) {
        sideDone = true
        this.side.imagePath = serverPath + ownCertificate2.filePath
        this.side.images = [serverPath + ownCertificate2.filePath]
        this.side.image = ownCertificate2
        this.side.done = true
        this.$refs.side.setImage(serverPath + ownCertificate2.filePath, ownCertificate2)
      }
      if (ownCertificate3 && ownCertificate3.id) {
        mergeDone = true
        merge.setImage(serverPath + ownCertificate3.filePath, [ownCertificate3])
      }

      const { icpOrgOrder, icpOrder } = this.globalData.icp
      const _own = {}
      let orgName = ''
      let orgCode = ''
      // let orgPerson = ''
      let ownPerson = ''
      let ownCode = ''
      // 组织机构代码弹窗不同提示
      // 组织机构代码orgTitle不同
      if (icpOrder) {
        const certificateTypeId = icpOrder.certificateTypeId || icpOrgOrder.certificateTypeId
        if (certificateTypeId == 12) {
          this.tipsText = '组织机构代码证信息不正确，请核实'
          this.orgTitle = '请上传组织机构代码'
          this.org.buttonText = '点击拍摄组织机构代码'
          // this.setData({ tipsText: '组织机构代码证信息不正确，请核实', orgTitle: '请上传组织机构代码' })
          // org.setData({ buttonText: '点击拍摄组织机构代码' })
        } else {
          this.tipsText = '工商信息不正确，是否继续进行备案操作'
          // this.setData({ tipsText: '工商信息不正确，是否继续进行备案操作' })
        }
      }

      if (icpOrgOrder) {
        if (icpOrgOrder && icpOrgOrder.orgName) {
          this.org.name = icpOrgOrder.orgName
          // 修改操作表单的数据
          orgName = icpOrgOrder.orgName
        }
        if (icpOrgOrder && icpOrgOrder.certificateCode) {
          this.org.code = icpOrgOrder.certificateCode
          orgCode = icpOrgOrder.certificateCode
        }
        if (icpOrgOrder && icpOrgOrder.orgOwnerName) {
          this.org.person = icpOrgOrder.orgOwnerName
          _own.person = icpOrgOrder.orgOwnerName
          // orgPerson = icpOrgOrder.orgOwnerName
          ownPerson = icpOrgOrder.orgOwnerName
        }
        if (icpOrgOrder && icpOrgOrder.orgOwnerCertificateCode) {
          _own.code = icpOrgOrder.orgOwnerCertificateCode
          ownCode = icpOrgOrder.orgOwnerCertificateCode
        }
      }

      const { orderType } = this.globalData
      const NewCheckIn = orderType == 'NEW_CHECK_IN'
      const ChangeCheckIn = orderType == 'CHANGE_CHECK_IN'
      const NewWebsite = orderType == 'NEW_WEBSITE'
      const NoOrgNewWebsite = orderType == 'NO_ORG_NEW_WEBSITE'
      const ChangeOrg = orderType == 'CHANGE_ORG'

      // 变更主体 信息与PC端不一致时只能修改不能使用
      if (ChangeOrg) {
        this.use = false
        // this.tipsButtons1 = [{ text: '修改' }]
        // this.setData({ tipsButtons1: [{ text: '修改' }] })
      }

      this.NewCheckIn = NewCheckIn
      this.ChangeCheckIn = ChangeCheckIn
      this.NewWebsite = NewWebsite
      this.NoOrgNewWebsite = NoOrgNewWebsite
      this.ChangeOrg = ChangeOrg
      this.own = _own
      this.orgName = orgName
      this.orgCode = orgCode
      this.ownPerson = ownPerson
      this.ownCode = ownCode
      this.orgDone = orgDone
      this.frontDone = frontDone
      this.sideDone = sideDone
      this.mergeDone = mergeDone
      // this.setData({
      //   NewCheckIn,
      //   ChangeCheckIn,
      //   NewWebsite,
      //   NoOrgNewWebsite,
      //   ChangeOrg,
      //   org: _org,
      //   own: _own,
      //   orgName,
      //   orgCode,
      //   // orgPerson,
      //   ownPerson,
      //   ownCode,
      //   orgDone,
      //   frontDone,
      //   sideDone,
      //   mergeDone
      // })
      if (orgDone && frontDone && sideDone && mergeDone) {
        this.setAllowSubmit()
      }
    },
    setAllowSubmit(allowSubmit = true) {
      this.allowSubmit = allowSubmit
    },
    changeScale(num) {
      num = num || 1
      this.$refs.cropper.changeScale(num)
    },
    // 裁剪图片旋转
    rotate() {
      this.$refs.cropper.rotateRight()
    },
    // 丢弃图片数据
    resetImage(e) {
      this.srcs = ''
      this.option.img = ''
      this.cropper = false
      this.cropperType = ''
    },
    updateOrg() {
      this.dialogTitle = '修改营业执照'
      this.dialogType = 'org'
      this.dialogShow = true
    },
    updateOwn() {
      this.dialogTitle = '修改证件信息'
      this.dialogType = 'own'
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
      const {
        orgName,
        orgCode,
        // orgPerson,
        ownPerson,
        ownCode
      } = this
      const data = {
        orderCode: this.globalData.orderCode,
        orgAttachment: {
          ocrOrgName: orgName,
          ocrOrgCode: orgCode
          // ocrOrgOwnerName: orgPerson
        },
        idCardFrontAttachment: {
          ocrOrgOwnerName: ownPerson,
          ocrOrgOwnerCode: ownCode
        }
      }
      return new Promise(resolve => {
        Indicator.open('请稍后..')
        const self = this
        // wx.showLoading({ title: '请稍后..', mask: true })
        self.request({
          url: `/saveOrgInfo`,
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          // dataType: 'json',
          // data: JSON.stringify(data),
          data,
          success(res) {
            Indicator.close()
            // 保存成功后同步数据
            self.org.name = orgName
            self.org.code = orgCode
            self.own.code = ownCode
            self.own.person = ownPerson

            resolve()
          }
        })
      })
    },
    // 修改确认
    dialogButton(e) {
      this.saveLocalData()
      this.dialogShow = false
    },
    dialogHidden() {
      this.dialogShow = false
    },
    saveLocalData() {
      const { dialogType, orgName, orgCode, ownPerson, ownCode } = this
      if (dialogType == 'org') {
        this.org.name = orgName
        this.org.code = orgCode
      } else if (dialogType == 'own') {
        this.own.code = ownCode
        this.own.person = ownPerson
      }
    },
    setUploadFailData(id) {
      const org = this.$refs.org
      const front = this.$refs.front
      const side = this.$refs.side

      if (id == 'org') {
        org.clearImageData()
      } else if (id == 'side') {
        side.clearImageData()
      } else if (id == 'front') {
        front.clearImageData()
      }
    },
    setErrorInfo(showErrorInfo = false, errorInfo = '') {
      this.showErrorInfo = showErrorInfo
      this.errorInfo = errorInfo
    },
    delImageLock() {
      const { orderCode } = this.globalData
      this.request({
        url: `/unlock?orderCode=${orderCode}&types=ORG`,
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
    clearVerifyImage() {
      const { realityVerify, promiseBook } = this.globalData.images
      const self = this
      let param = ''
      if (realityVerify && realityVerify.id) {
        param = `attachmentOrderIds=${realityVerify.id}`
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
            if (code == 'success') {
              self.globalData.images.screen = {}
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
    clearImage(id) {
      const { orderType } = this.globalData
      // const org = this.org
      // const front = this.front
      // const side = this.side
      const merge = this.$refs.merge

      if (id == 'org') {
        this.orgDone = false
        this.org = {
          name: '',
          code: '',
          done: false,
          option: {},
          images: [],
          image: {},
          imagePath: '',
          imageBase64: ''
          // buttonText: ''
        }
      } else if (id == 'front') {
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
          imageBase64: ''
          // buttonText: ''
        }
      } else if (id == 'side') {
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
          imageBase64: ''
          // buttonText: ''
        }
      }

      // 非变更主体
      if (orderType != 'CHANGE_ORG') {
        this.clearVerifyImage()
      }
      this.setAllowSubmit(false)
      this.delImageLock()
    },
    // 调用比对数据、检验工商接口
    checkData() {
      Indicator.open('加载中...')
      const self = this
      const { orderCode } = this.globalData
      const { org, own } = this
      const data = {
        orderCode,
        orgAttachment: {
          ocrOrgName: org.name,
          ocrOrgCode: org.code
          // ocrOrgOwnerName: org.person
        },
        idCardFrontAttachment: {
          ocrOrgOwnerName: own.person,
          ocrOrgOwnerCode: own.code
        }
      }

      return new Promise(resolve => {
        self.request({
          url: `/orgAttachment`,
          method: 'POST',
          // headers: { 'Content-Type': 'application/json' },
          // dataType: 'json',
          // data: JSON.stringify(data),
          data,
          success(res) {
            Indicator.close()
            const { data, message } = res.data
            if (!data) {
              self.setErrorInfo(true, message)
              return
            }
            const { orgAttachment, idCardFrontAttachment } = data
            // OCR数据和库中不一样
            if (!(orgAttachment.ocrOrgCodeResult && orgAttachment.ocrOrgNameResult && idCardFrontAttachment.ocrOrgOwnerCodeResult && idCardFrontAttachment.ocrOrgOwnerNameResult)) {
              self.tipsDialogShow1 = true
              return
            }

            // 工商信息或组织机构代码不正确
            if (!orgAttachment.orgInfoVerify) {
              self.tipsDialogShow2 = true
              self.setErrorInfo(true, message)
              return
            }

            resolve()
          }
        })
      })
    },
    // 完成提交所有附件
    submitData() {
      // const org = this.$refs.org
      // const front = this.$refs.front
      // const side = this.$refs.side
      const org = this.org
      const front = this.front
      const side = this.side
      const merge = this.$refs.merge
      const self = this
      const data = { orderCode: this.globalData.orderCode }
      if (!org.image.id) {
        data.orgAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            filePurpose: 2,
            picSequenceNum: '1',
            fileState: 'MERGE',
            type: 'ORG',
            byteFile: org.imageBase64
          }, this.globalData)
        }
      }
      if (!front.image.id) {
        data.idCardFrontAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            filePurpose: 3,
            picSequenceNum: 1,
            fileState: 'SINGLE',
            type: 'ORG',
            byteFile: front.imageBase64
          }, this.globalData)
        }
      }
      if (!side.image.id) {
        data.idCardBackAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            filePurpose: 3,
            picSequenceNum: 2,
            fileState: 'SINGLE',
            type: 'ORG',
            byteFile: side.imageBase64
          }, this.globalData)
        }
      }
      const mergeImage = merge._data.image
      if (!(mergeImage.length && mergeImage[0].id)) {
        data.idCardMergeAttachment = {
          ...getAttachmentParam({
            isWebsiteChecklist: '0',
            filePurpose: 3,
            picSequenceNum: 3,
            fileState: 'MERGE',
            type: 'ORG',
            byteFile: merge._data.imageBase64.slice(23)
          }, this.globalData)
        }
      }

      // 4张附件未修改不用提交
      if (org.image.id && front.image.id && side.image.id && mergeImage.length && mergeImage[0].id) {
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
      // wx.showLoading({ title: '请稍后..', mask: true })
      self.request({
        url: `/saveAttachment`,
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        // dataType: 'json',
        // data: JSON.stringify(data),
        data,
        success(res) {
          // wx.hideLoading()
          Indicator.close()
          const { code, message } = res.data
          if (code == 'success') {
            // wx.showToast({ title: '上传成功！' })
            Toast({
              message: '上传成功！',
              duration: 3000,
              className: 'noticeError'
            })
            self.$router.push('/list')
            // wx.navigateBack()
          } else {
            Toast({
              message,
              duration: 3000,
              className: 'noticeError'
            })
          }
        }
      })
    },
    // 完成
    submit() {
      const { NewCheckIn, ChangeCheckIn, NewWebsite, NoOrgNewWebsite } = this
      // 变更接入不用数据对比，不用校验工商数据
      if (NewCheckIn || ChangeCheckIn || NewWebsite || NoOrgNewWebsite) {
        this.submitData()
      } else {
        this.checkData().then(this.submitData)
      }
    },
    // 数据不一致
    tipsDialogButton1(action) {
      const { NewCheckIn, ChangeCheckIn, NewWebsite, NoOrgNewWebsite } = this
      // 使用：先保存数据然后工商校验，校验通过提交所有附件数据
      // 如果是变更主体或变更网站隐藏第一个按钮后，第二个按钮index是0，所以用文本判断
      if (action === 'use') {
        this.tipsDialogShow1 = false
        // this.setData({ tipsDialogShow1: false })
        if (NewCheckIn || ChangeCheckIn || NewWebsite || NoOrgNewWebsite) {
          this.saveData().then(this.submitData)
        } else {
          this.saveData().then(this.checkData).then(this.submitData)
        }
        // 修改：展示修改操作
      } else if (action === 'modify') {
        // 关闭弹窗，显示修改按钮
        this.tipsDialogShow1 = false
        this.allowUpdate = true
        // this.setData({
        //   tipsDialogShow1: false,
        //   allowUpdate: true
        // })
      }
    },
    // 工商数据错误
    tipsDialogButton2(action) {
      // 去核实：停留当前页
      if (action === 'verify') {
        this.tipsDialogShow2 = false
        this.allowUpdate = true
        // this.setData({
        //   tipsDialogShow2: false,
        //   allowUpdate: true
        // })
        // 继续：做标记后提交数据
      } else if (action === 'continue') {
        this.tipsDialogShow2 = false
        // this.setData({
        //   tipsDialogShow2: false
        // })
        this.submitData()
      }
    },
    // realTime() {
    //   this.previews = data
    // },
    cropImagedata(a, file, id, imageBase64) {
      this.srcs = a
      this.option.img = a
      this.cropper = true
      this.fileName = file.name
      this.id = id
    },
    cropImage() {
      console.log(this.$refs.cropper, 'cropimage1')
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
      let formData = new FormData()
      if (type === 'blob') {
        this.$refs.cropper.getCropBlob((data) => {
          let img = window.URL.createObjectURL(data)
          this.model = true
          this.modelSrc = img
          formData.append('file', data, this.fileName)
          this.cropper = false
          this.bb = img
          this.$refs.cropper.getCropData(data => {
            let url = data.substring(data.indexOf(',') + 1, data.length)
            this.baseurl = url
            this.chooseImage(url, img)
          })
        })
      }
      // const self = this
      // this.cropper.getImg((o) => {
      //   const tempFilePath = o.url
      //   const cropperType = self.cropperType
      //   this.cropper = false
      //   const cropper = self.$(`#${cropperType}`)
      //   cropper.getCropperImage(tempFilePath)
      //   self.setData({ cropper: false }, () => {
      //     const cropper = self.selectComponent(`#${cropperType}`)
      //     cropper.getCropperImage(tempFilePath)
      //   })
      // })
    },
    blockToDataURL(blob, callback) {
      let a = new FileReader()
      a.onload = function (e) { callback(e.target.result) }
      a.readAsDataURL(blob)
    },
    bytes(e) {
      let bytes = new Uint8Array(e.target.result)
      let binary = ''
      bytes.map(i => {
        binary += String.fromCharCode(bytes[i])
      })
      return window.btoa(binary)
    },
    writeimage(url, img) {
      // let org = this.$refs.org._data
      // let front = this.$refs.front._data
      // let side = this.$refs.side._data
      let org = this.org
      let front = this.front
      let side = this.side
      if (this.id === 'org') {
        org.imageBase64 = url
        org.imagePath = img
        org.images = [img]
        org.image = {}
        org.done = true
      } else if (this.id === 'front') {
        front.imageBase64 = url
        front.imagePath = img
        front.images = [img]
        front.image = {}
        front.done = true
      } else if (this.id === 'side') {
        side.imageBase64 = url
        side.imagePath = img
        side.images = [img]
        side.image = {}
        side.done = true
      }
    },
    chooseImage(url, img) {
      // console.log(this.$refs, this.id, this.baseurl, this.bb, 'fronttttt')
      // this.writeimage(this.baseurl, this.bb)
      const self = this
      // const org = $('#org1 > div')
      // const front = $('#front1 > div:first-child')
      // const side = $('#front1 > div:last-child')
      // const merge = this.$refs.merge
      const id = this.id
      const data = { orderCode: this.globalData.orderCode }
      const { NewCheckIn, ChangeCheckIn, NewWebsite, NoOrgNewWebsite } = this
      // 新增接入、无主体新增接入不做OCR
      // OCR识别数据回显
      if (id == 'org') {
        if (!NewCheckIn && !ChangeCheckIn && !NewWebsite && !NoOrgNewWebsite) {
          data.orgAttachment = {
            byteFile: url
          }
          Indicator.open('识别中..')
          self.request({
            url: `/ocrOrg`,
            method: 'POST',
            // headers: { 'Content-Type': 'application/json' },
            // dataType: 'json',
            // data: JSON.stringify(data),
            data,
            success(res) {
              Indicator.close()
              const { code, data, message } = res.data
              if (code === 'success') {
                const org = {
                  name: data.ocrOrgName,
                  code: data.ocrOrgCode,
                  person: data.ocrOrgOwnerName
                }
                // 每次OCR后更新修改操作表单
                const orgName = org.name
                const orgCode = org.code
                // const orgPerson = org.person
                self.org = org
                self.orgName = orgName
                self.orgCode = orgCode
                self.writeimage(self.baseurl, self.bb)
                self.setUploadSuccessData('org')
                self.setErrorInfo()
                // ORC识别成功可以修改
                self.allowUpdate = true
                // self.baseurl = ''
                // self.bb = ''
              } else {
                Toast({
                  message: res.message,
                  duration: 3000,
                  className: 'noticeError'
                })
                self.setUploadFailData(id)
                self.setErrorInfo(true, message)
              }
            }
          // }, () => {
          //   self.setUploadFailData(this.id)
          })
        } else {
          self.writeimage(self.baseurl, self.bb)
          self.setUploadSuccessData('org')
        }
      } else if (id == 'front' || id == 'side') {
        if (!NewCheckIn && !ChangeCheckIn && !NewWebsite && !NoOrgNewWebsite) {
          data.idCardFrontAttachment = {
            byteFile: url,
            side: id == 'side' ? 'back' : 'front'
          }
          Indicator.open('识别中..')
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
                const own = {
                  person: data.ocrOrgOwnerName,
                  code: data.ocrOrgOwnerCode
                }
                // 每次OCR后更新修改操作表单
                const ownPerson = own.person
                const ownCode = own.code
                self.own = own
                self.ownPerson = ownPerson
                self.ownCode = ownCode
                // self.setData({ own, ownPerson, ownCode })
                self.writeimage(self.baseurl, self.bb)
                self.setUploadSuccessData('front')
                self.setErrorInfo()
                self.allowUpdate = true
                // self.setData({
                //   allowUpdate: true
                // })

                // self.baseurl = ''
                // self.bb = ''
                // self.$refs.mergeFile.setImages(self.bb)
                // self.$refs.merge.setImages(self.baseurl, self.bb)
                // console.log(self.front, self.side, 'fffff')
              } else if (code === 'success' && id === 'side') {
                self.writeimage(self.baseurl, self.bb)
                self.setUploadSuccessData('side')
                self.setErrorInfo()
                // self.baseurl = ''
                // self.bb = ''
              } else {
                Toast({
                  message: res.message,
                  duration: 3000,
                  className: 'noticeError'
                })
                self.setUploadFailData(id)
                self.setErrorInfo(true, message)
              }
            }
          // }, () => self.setUploadFailData(this.id)
          })
        } else {
          self.writeimage(self.baseurl, self.bb)
          self.setUploadSuccessData()
        }
      }
    },
    setUploadSuccessData(type) {
      // const org = this.$refs.org
      // const front = this.$refs.front
      // const side = this.$refs.side
      const org = this.org
      const front = this.front
      const side = this.side
      const merge = this.$refs.merge
      // const merge = this.selectComponent('#merge')

      // 正反面均已上传执行合并
      if (front.done && side.done && type !== 'org') {
        // 营业执照上传完成，调用回调显示提交按钮状态
        merge.mergeImage(
          front.imagePath,
          side.imagePath,
          org.done,
          this.setAllowSubmit
        )
      }
      // 设置各附件上传状态
      if (front.done && side.done && merge._data.done && org.done) {
        this.setAllowSubmit(true)
      } else {
        this.setAllowSubmit(false)
      }
      this.orgDone = org.done
      this.frontDone = front.done
      this.sideDone = side.done
      this.mergeDone = merge._data.done
      // this.setData({
      //   orgDone: org.data.done,
      //   frontDone: front.data.done,
      //   sideDone: side.data.done,
      //   mergeDone: merge.data.done
      // })
    },
    toLoginPage() {
      this.$router.push('/login')
    },
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
<style scoped>
#orgs {
  background: #e4eaf6;
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

.clearfix:after {
  content: "";
  clear: both;
  display: block;
}

.box-left {
  float: left;
}

.box-right {
  float: right;
}

.container-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #e4eaf6;
  box-sizing: border-box;
}
.org-top,
.org-bottom {
  background: #fff;
  padding: 0 15px 20px;
  margin-top: 15px;
  margin-bottom: 15px;
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

.borders {
  position: absolute;
  width: 10px;
  height: 10px;
}

.upload-imgs {
  padding: 5px;
  box-sizing: border-box;
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
  top: 7;
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
  padding: 10px 0;
  font-size: 13px;
}
.weui-dialog .fields {
  display: flex;
  padding: 10px 10px 10px 24px;
  border-bottom: 1px solid #e5e5e5;
}
.weui-dialog .label {
  flex: 1 0 auto;
  color: #666;
  line-height: 22px;
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

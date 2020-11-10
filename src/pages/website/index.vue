<template>
  <div id="website">
      <div style="padding: 0 15px 15px;">
        
        <div class="container-page log-list">
          <div class="error-info" v-if="showErrorInfo">
            <img class="error-icon" src="~@/assets/warn.png" />
            {{errorInfo}}
          </div>
        </div>
        <div class="bottom">
          <span class="tit">{{uploadTips}}</span>
          <div class="bgtop">
            <div class="weui-cell" style="padding: 0;">
              <div>
                <div class="clearfix">
                  <!-- <input type="file" name="file" capture="camera" @change="takePhoto($event)"> -->
                  <!-- <input type="file" capture="camera" accept="image/*" @change="takePhoto($event)" name="file"> -->
                  <upload-file
                    class="box-left"
                    :type="compType"
                    :num="1"
                    id="front"
                    bind:cropperimage="cropperImage"
                    bind:chooseimage="chooseImage"
                    bind:clearimage="clearImage"
                  />
                  <upload-file
                    class="box-right"
                    :type="compType"
                    :num="2"
                    id="side"
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
        <merge-file id="merge" :type="compType" />
        <div class="image-info" v-if="frontDone && (websiteOwn.person || websiteOwn.code)">
          <div>
            <span class="label">网站负责人：</span>
            <span class="value">{{websiteOwn.person}}</span>
          </div>
          <div>
            <span class="label">网站负责人证件号：</span>
            <span class="value">{{websiteOwn.code}}</span>
          </div>
          <span v-if="allowUpdate" class="update-button" bindtap="updateOwn">修改</span>
        </div>
        <div class="image-desc" v-else>
          <div>拍照须知：</div>
          <div>1、请拍摄证件原件并确保证件干净、无折痕</div>
          <div>2、请确保照片完整清晰、无遮挡物以及杂物等</div>
          <div>3、请将证件照片方向调整为正向</div>
        </div>
        <!-- v-if="allowSubmit" -->
        <div v-if="allowSubmit" class="confirm" @click="submit">完成</div>
          <!-- 修改操作弹框 -->
        <!-- <mp-dialog
          mask-closable="{{false}}"
          title="{{dialogTitle}}"
          show="{{dialogShow}}"
          buttons="{{buttons}}"
          bindbuttontap="dialogButton"
          ext-class="beian-dialog"
        > -->
        <!-- 网站负责人form -->
          <!-- <div class="form">
          <label class="fields">
            <div class="label">网站负责人：</div>
            <input class="weui-input" id="websiteOwnPerson" bindinput="bindinput" :value="websiteOwn.person" />
          </label>
          <label class="fields">
            <div class="label">网站负责人证件号：</div>
            <input class="weui-input" id="websiteOwnCode" bindinput="bindinput" :value="websiteOwn.code" />
          </label>
          </div>
        </mp-dialog> -->
        <!-- 数据不一致提示 -->
        <!-- <mp-dialog
          mask-closable="{{false}}"
          title="提示"
          show="{{tipsDialogShow1}}"
          buttons="{{tipsButtons1}}"
          bindbuttontap="tipsDialogButton1"
        >
          <div class="tips">与PC端填写信息不一致，是否使用手机端信息</div>
        </mp-dialog> -->
        <canvas class="canvas-hidden" style="width: 290px; height: 360px;" canvas-id="Canvas"/>

      </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import uploadFile from '../upload_file'
import mergeFile from '../merge_file'
import $ from 'jquery'
export default {
    name: "Website",
    components: { uploadFile, mergeFile },
    data() {
        return {
           // 开始裁剪状态
          cropper: false,
          cropperType: '',
          // image cropper
          src:'',
          cropperWidth: 300,//宽度
          cropperHeight: 220,//高度

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
          buttons: [{text: '取消'}, {text: '保存'}],
          // tips dialog
          tipsDialogShow1: false,
          tipsDialogShow2: false,
          tipsButtons1: [{text: '使用'}, {text: '修改'}],
          tipsButtons2: [{text: '去核实'}, {text: '继续'}],
          tipsText: '',

          // 网站负责人信息
          websiteOwn: {
            // 负责人
            person: '',
            // 负责人证件号
            code: ''
          },
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
          ChangeOrg: false,
          isPersonal: false
        }
    },
    mounted: function() {
      this.height = this.globalData.height * 2 + 100
      this.onLoad()
    },
    methods: {
      takePhoto(e) {
        var file=e.target.files[0]
        var fd=new FormData()
        fd.append('file',file)
        fd.append('uid',this.$store.getters.getUid)
        console.log(fd, e, file, 'ee11')
      },
      onLoad() {
        const { orderType, recordType } = this.globalData
        const NewCheckIn = orderType == 'NEW_CHECK_IN'
        const ChangeCheckIn = orderType == 'CHANGE_CHECK_IN'
        const NewWebsite = orderType == 'NEW_WEBSITE'
        const NoOrgNewWebsite = orderType == 'NO_ORG_NEW_WEBSITE'
        const ChangeOrg = orderType == 'CHANGE_ORG'
        const isPersonal =  recordType == '5'
        this.NewCheckIn = NewCheckIn
        this.ChangeCheckIn = ChangeCheckIn
        this.NewWebsite = NewWebsite
        this.NoOrgNewWebsite = NoOrgNewWebsite
        this.ChangeOrg = ChangeOrg
        this.isPersonal = isPersonal
        // this.setData({ NewCheckIn, ChangeCheckIn, NewWebsite, NoOrgNewWebsite, ChangeOrg, isPersonal })

        // 个人有主体新增网站或变更主体 信息与PC端不一致时只能修改不能使用
        if (isPersonal && NewWebsite || isPersonal && ChangeOrg) {
          this.tipsButtons1 = [{text: '修改'}]
          // this.setData({ tipsButtons1: [{text: '修改'}] })
        }

        //获取到image-cropper实例
        // this.cropper = this.selectComponent("#image-cropper")
        this.cropper = $("#image-cropper")
        if (orderType == 'CHANGE_ORG' && recordType == '5') {
          // wx.setNavigationBarTitle({
          //   title: '主体负责人证件信息'
          // })
          this.uploadTips = '请上传主体负责人证件信息'
          // this.setData({ uploadTips: '请上传主体负责人证件信息' })
        } else if (recordType == '5') {
          // wx.setNavigationBarTitle({
          //   title: '主体/网站负责人证件信息'
          // })
          this.uploadTips = '请上传主体/网站负责人证件信息'
          // this.setData({ uploadTips: '请上传主体/网站负责人证件信息' })
        } else {
          // wx.setNavigationBarTitle({
          //   title: '网站负责人证件信息' 
          // })
          this.uploadTips = '请上传网站负责人证件信息'
          // this.setData({ uploadTips: '请上传网站负责人证件信息' })
        }

        const compType = recordType == '5' ? 'own' : 'website'
        this.compType = compType
        // this.setData({ compType })

        // const front = this.selectComponent('#front')
        // const side = this.selectComponent('#side')
        // const merge = this.selectComponent('#merge')
        const front = $('#front')
        const side = $('#side')
        const merge = $('#merge')

        const { images, serverPath } = this.globalData
        const {
          ownCertificate1,
          ownCertificate2,
          ownCertificate3,
          websiteCertificate1,
          websiteCertificate2,
          websiteCertificate3,
        } = images

        let frontDone = front.data.done
        let sideDone = side.data.done
        let mergeDone = merge.data.done
        let certificate1
        let certificate2
        let certificate3
        if (recordType == '5' && orderType != 'CHANGE_ORG') {
          certificate1 = ownCertificate1
          certificate2 = ownCertificate2
          certificate3 = [ownCertificate3, websiteCertificate3]
        } else if (recordType == '5' && orderType == 'CHANGE_ORG') {
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
          front.setImage(serverPath + certificate1.filePath, certificate1)
        }
        if (certificate2 && certificate2.id) {
          sideDone = true
          side.setImage(serverPath + certificate2.filePath, certificate2)
        }
        if (certificate3[0] && certificate3[0].id) {
          mergeDone = true
          merge.setImage(serverPath + certificate3[0].filePath, certificate3)
        }

        const { icpOrgOrder, icpWebsiteOrder } = this.globalData.icp
        const websiteOwn = {}
        let websiteOwnPerson = ''
        let websiteOwnCode = ''
        console.log(this.globalData)

        // 个人取主体数据，企业取网站数据
        if (this.globalData.recordType == 5) {
          // 主办单位信息
          // websiteOwn.orgName = icpOrgOrder.orgName
          // 主办单位证件号
          // websiteOwn.orgCode = icpOrgOrder.certificateCode
          // 主办单位负责人
          // websiteOwn.orgPerson = icpOrgOrder.orgOwnerCertificateCode

          // 有主体新增网站从获取icpWebsiteOrder数据
          if (orderType == 'NEW_WEBSITE') {
            console.log(this.globalData, '11')
            websiteOwn.person = icpWebsiteOrder.websiteOwnerName
            websiteOwnPerson = icpWebsiteOrder.websiteOwnerName
            websiteOwn.code = icpWebsiteOrder.websiteOwnerCertificateCode
            websiteOwnCode = icpWebsiteOrder.websiteOwnerCertificateCode
          } else {
            console.log(this.globalData, '22')
            // 网站负责人
            websiteOwn.person = icpOrgOrder.orgOwnerName
            websiteOwnPerson = icpOrgOrder.orgOwnerName
            // 网站负责人证件号
            websiteOwn.code = icpOrgOrder.certificateCode
            websiteOwnCode = icpOrgOrder.certificateCode
          }
        } else {
          console.log(this.globalData, '33')
          websiteOwn.person = icpWebsiteOrder.websiteOwnerName
          websiteOwnPerson = icpWebsiteOrder.websiteOwnerName
          websiteOwn.code = icpWebsiteOrder.websiteOwnerCertificateCode
          websiteOwnCode = icpWebsiteOrder.websiteOwnerCertificateCode
        }
        this.websiteOwn = websiteOwn
        this.websiteOwnPerson = websiteOwnPerson
        this.websiteOwnCode = websiteOwnCode
        this.frontDone = frontDone
        this.sideDone = sideDone
        this.mergeDone = mergeDone

        // this.setData({
        //   websiteOwn,
        //   websiteOwnPerson,
        //   websiteOwnCode,
        //   frontDone,
        //   sideDone,
        //   mergeDone
        // })
        if (frontDone && sideDone && mergeDone) {
          this.setAllowSubmit()
        }
      },
      resetImage(e) {
        this.src = ''
        this.cropper = false
        this.cropperType = ''
      },
      cropperImage(e) {
        const { src } = e.detail
        const { id } = e.currentTarget
        this.src = src
        this.cropper = true
        this.cropperType = id
        Indicator.close()
        // wx.hideLoading()
      },
      getCropperImage() {
        const self = this
        this.cropper.getImg((o)=>{
          const tempFilePath = o.url
          const { cropperType } = self.cropperType
          self.cropper = false
          // const cropper = self.selectComponent(`#${cropperType}`)
          const cropper = $(`#${cropperType}`)
          cropper.getCropperImage(tempFilePath)
          // self.setData({ cropper: false }, () => {
          //   const cropper = self.selectComponent(`#${cropperType}`)
          //   cropper.getCropperImage(tempFilePath)
          // })
        })
      },
      cropperload(e) {
      },
      loadimage(e) {
        // 重置图片角度、缩放、位置
        this.cropper.imgReset()
      },
      clickcut(e) {
        // 点击裁剪框阅览图片
        wx.previewImage({
          current: e.detail.url,
          urls: [e.detail.url]
        })
      },
      rotate(){
        //在用户旋转的基础上旋转90°
        this.cropper.setAngle(this.cropper.data.angle += 90)
      },
      end(e) {
        clearInterval(this.data[e.currentTarget.dataset.type])
      },

      setAllowSubmit(allowSubmit = true) {
        this.allowSubmit = allowSubmit
        // this.setData({ allowSubmit })
      },
      // 修改负责人信息
      updateOwn() {
        this.dialogTitle = '修改证件信息'
        this.dialogShow = true
        // this.setData({
        //   dialogTitle: '修改证件信息',
        //   dialogShow: true
        // })
      },
      // 修改单条数据触发
      bindinput(e) {
        const key = e.currentTarget.id
        const value = e.detail.value
        this.key = value
        // this.setData({ [key]: value })
      },
      // 修改数据
      saveData() {
        const self = this
        const { orderCode, recordType } = this.globalData
        const websiteOwnPerson = this.websiteOwnPerson
        const websiteOwnCode = this.websiteOwnCode
        const data = {
          orderCode,
          idCardFrontAttachment: {
            ocrOrgOwnerName: websiteOwnPerson,
            ocrOrgOwnerCode: websiteOwnCode
          }
        }

        return new Promise(resolve => {
          // wx.showLoading({ title: '请稍后..', mask: true })
          Indicator.open('请稍后...');
          $.ajax({
            url: `/api/miniprogram/saveWebsiteInfo`,
            method: 'POST',
            data,
            success(res) {
              // wx.hideLoading()
              Indicator.close()
              // 保存成功后同步数据
              self.websiteOwn = {
                  code: websiteOwnCode,
                  person: websiteOwnPerson
                }
              // self.setData({
              //   websiteOwn: {
              //     code: websiteOwnCode,
              //     person: websiteOwnPerson
              //   }
              // })
              resolve()
            }
          })
        })
      },
      saveLocalData() {
        // const { websiteOwnPerson, websiteOwnCode } = this.data
        const websiteOwnPerson = this.websiteOwnPerson
        const websiteOwnCode = this.websiteOwnCode
        const websiteOwn = {
          person: websiteOwnPerson,
          code: websiteOwnCode
        }
        this.websiteOwn = websiteOwn
        // this.setData({ websiteOwn })
      },
      // 修改确认
      dialogButton(e) {
        const { detail } = e
        // 确定
        if (detail.index == 1) {
          this.saveLocalData()
          this.dialogShow = false
          // this.setData({ dialogShow: false })
        } else {
          this.dialogShow = false
          // this.setData({
          //   dialogShow: false
          // })
        }
      },
      setUploadSuccessData(e) {
        const self = this
        // const front = this.selectComponent('#front')
        // const side = this.selectComponent('#side')
        // const merge = this.selectComponent('#merge')
        const front = $('#front')
        const side = $('#side')
        const merge = $('#merge')

        // 正反面均已上传执行合并
        if (front.data.done && side.data.done) {
          // 营业执照上传完成，调用回调显示提交按钮状态
          merge.mergeImage(
            front.data.imagePath,
            side.data.imagePath,
            true,
            this.setAllowSubmit
          )
        }

        // 设置各附件上传状态
        if (front.data.done && side.data.done && merge.data.done) {
          this.setAllowSubmit(true)
        } else {
          this.setAllowSubmit(false)
        }
        this.frontDone = front.data.done
        this.sideDone = side.data.done
        this.mergeDone = merge.data.done
        // this.setData({
        //   frontDone: front.data.done,
        //   sideDone: side.data.done,
        //   mergeDone: merge.data.done
        // })
      },
      setUploadFailData(e) {
        const { id } = e.target
        // const front = this.selectComponent('#front')
        // const side = this.selectComponent('#side')
        const front = $('#front')
        const side = $('#side')

        if (id == 'side') {
          side.clearImageData()
        } else if (id == 'front') {
          front.clearImageData()
        }
      },
      setErrorInfo(showErrorInfo = false, errorInfo = '') {
        this.showErrorInfo = errorInfo
        // this.setData({ showErrorInfo, errorInfo })
      },
      chooseImage(e) {
        const self = this
        const front = $('#front')
        const side = $('#side')
        const merge = $('#merge')

        const { id } = e.currentTarget
        const data = { orderCode: this.globalData.orderCode }
        const NewCheckIn = this.NewCheckIn
        const ChangeCheckIn = this.ChangeCheckIn
        // 新增接入，变更接入，变更主体不做OCR
        // OCR识别数据回显
        if (!NewCheckIn && !ChangeCheckIn) {
          data.idCardFrontAttachment = {
            byteFile: id == 'side' ? side.data.imageBase64 : front.data.imageBase64,
            side: id == 'side' ? 'back' : 'front'
          }
          Indicator.open('识别中...');
          $.ajax({
            url: `/api/miniprogram/ocrIdCard`,
            method: 'POST',
            data,
            success(res) {
              Indicator.close()
              const { code, data, message } = res.data
              console.log(res.data)
              if (code == 'success' && id == 'front') {
                const websiteOwn = {
                  person: data.ocrOrgOwnerName,
                  code: data.ocrOrgOwnerCode
                }
                // 每次OCR后更新修改操作表单
                const websiteOwnPerson = websiteOwn.person
                const websiteOwnCode = websiteOwn.code
                this.websiteOwn = websiteOwn
                this.websiteOwnPerson = websiteOwnPerson
                this.websiteOwnCode = websiteOwnCode
                // self.setData({ websiteOwn, websiteOwnPerson, websiteOwnCode })
                self.setUploadSuccessData(e)
                self.setErrorInfo()
                this.allowUpdate = true
                // self.setData({
                //   allowUpdate: true
                // })
              } else if (code == 'success' && id == 'side') {
                self.setUploadSuccessData(e)
                self.setErrorInfo()
              } else {
                self.setUploadFailData(e)
                self.setErrorInfo(true, message)
              }
            }
          }, () => self.setUploadFailData(e))
        } else {
          self.setUploadSuccessData(e)
        }
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
          param = param ? param +'&'+ url : url
        }
        if (promiseBook && promiseBook.id) {
          const url = `attachmentOrderIds=${promiseBook.id}`
          param = param ? param +'&'+ url : url
        }
        if (param) {
          $.ajax({
            url: `/api/miniprogram/deleteAttachment?${param}`,
            success(res) {
              const { code, message } = res.data
              if (code == 'success') {
                let globalDatas = self.globalData
                globalDatas.images.screen= {}
                self.setData(globalDatas)
                // app.globalData.images.screen = {}
              } else {
                Toast({
                  message: message,
                  duration: 3000
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
          request({
            url: `/api/miniprogram/deleteAttachment?${param}`,
            success(res) {
              const { code, message } = res.data
              if (code == 'success') {
                let globalDatas = self.globalData
                globalDatas.images.orgCertificate = {}
                self.setData(globalDatas)
              } else {
                Toast({
                  message: message,
                  duration: 3000
                })
              }
            }
          })
        }
      }, // 删除网站负责人附件也删除幕布照和合成照
      clearImage(e) {
        const { orderType, recordType } = this.globalData
        const front = $('#front')
        const side = $('#side')
        const merge = $('#merge')
        const { id } = e.currentTarget

        if (id == 'front') {
          merge.clearImage()
          this.frontDone = false
          this.mergeDone = false
          // this.setData({ frontDone: false, mergeDone: false })
        } else if (id == 'side') {
          merge.clearImage()
          this.sideDone = false
          this.mergeDone = false
          // this.setData({ sideDone: false, mergeDone: false })
        }
        // 非变更主体
        if (orderType != 'CHANGE_ORG') {
          this.clearScreenAndVerifyImage()
          // 个人备案需要删除营业执照证件
          if (recordType == 5) [
            this.delOrgImage()
          ]
        }
        this.setAllowSubmit(false)
        this.delImageLock()
      },
      // 调用对局比对、检验工商接口
      checkData() {
        Indicator.open('请稍后...')
        const self = this
        const { orderCode, icp } = this.globalData
        const websiteOwn = this.websiteOwn
        const data = {
          orderCode,
          idCardFrontAttachment: {
            ocrOrgOwnerName: websiteOwn.person,
            ocrOrgOwnerCode: websiteOwn.code
          }
        }
        return new Promise(resolve => {
          request({
            url: `/api/miniprogram/idCardAttachment`,
            method: 'POST',
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
              if (!(idCardFrontAttachment.ocrOrgOwnerNameResult && idCardFrontAttachment.ocrOrgOwnerCodeResult) || code != 'success') {
                this.tipsDialogShow1 = true
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
        const front = $('#front')
        const side = $('#side')
        const merge = $('#merge')
        const { orderCode, recordType } = this.globalData
        const data = { orderCode }
        const type = recordType == 5 ? 'ORG' : 'WEBSITE'
        const filePurpose = recordType == 5 ? 3 : 4
        if (!front.data.image.id) {
          data.idCardFrontAttachment = {
            ...getAttachmentParam({
              isWebsiteChecklist: '0',
              picSequenceNum: 1,
              fileState: 'SINGLE',
              filePurpose,
              type,
              byteFile: front.data.imageBase64
            })
          }
        }
        if (!side.data.image.id) {
          data.idCardBackAttachment = {
            ...getAttachmentParam({
              isWebsiteChecklist: '0',
              picSequenceNum: 2,
              fileState: 'SINGLE',
              filePurpose,
              type,
              byteFile: side.data.imageBase64
            })
          }
        }
        const mergeImage = merge.data.image
        if (!(mergeImage.length && mergeImage[0].id)) {
          data.idCardMergeAttachment = {
            ...getAttachmentParam({
              isWebsiteChecklist: '0',
              picSequenceNum: 3,
              fileState: 'MERGE',
              filePurpose,
              type,
              byteFile: merge.data.imageBase64
            })
          }
        }
        // 3张附件未修改不用提交
        if (front.data.image.id && side.data.image.id && mergeImage.length && mergeImage[0].id) {
          // wx.showToast({ title: '上传成功！' })
          Toast({
            message: '上传成功！',
            duration: 3000
          })
          wx.navigateBack()
          return
        }

        Indicator.open('请稍后...');
        request({
          url: `/api/miniprogram/saveAttachment`,
          method: 'POST',
          data,
          success(res) {
            Indicator.close()
            const { code, data, message } = res.data
            if (code == 'success') {
              Toast({
                message: '上传成功！',
                duration: 3000
              })
              wx.navigateBack()
            } else {
              Toast({
                message: message,
                duration: 3000
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
        if (NewCheckIn || ChangeCheckIn || NoOrgNewWebsite) {
          this.submitData()
        } else {
          this.checkData().then(this.submitData)
        }
      },
      // 数据不一致
      tipsDialogButton1(e) {
        const { detail } = e
        const { NewCheckIn, ChangeCheckIn, NoOrgNewWebsite } = this
        // 使用：先保存数据然后工商校验，校验通过提交所有附件数据
        if (detail.item.text == '使用') {
          this.tipsDialogShow1 = false
          // this.setData({
          //   tipsDialogShow1: false
          // })
          if (NewCheckIn || ChangeCheckIn || NoOrgNewWebsite) {
            this.saveData().then(this.submitData)
          } else {
            this.saveData().then(this.checkData).then(this.submitData)
          }
        // 修改：展示修改操作
        } else if(detail.item.text == '修改') {
          // 关闭弹窗，显示修改按钮
          this.tipsDialogShow1 = false
          this.allowUpdate = true
          // this.setData({
          //   tipsDialogShow1: false,
          //   allowUpdate: true
          // })
        }
      },
      ...mapMutations({
        setData: "SET_DATA",
      }),
    },
    computed: {
      ...mapState({
        globalData: state => state.home.globalData,
      }),
    },
}
</script>
<style scoped>
.container-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #e4eaf6;
  box-sizing: border-box;
}
.top, .bottom {
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
  border:none;
}
.weui-cell:after {
  border:none;
}

.clearfix:after {
  content: '';
  clear: both;
  display: block
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
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}
.image-info .label {
  color: #666;
}
.image-info .value {
  color: #333;
}

.dialog {}
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

.image-cropper-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99991;
  width: 100%;
  height: 100%;
  background: #fff;
  background:rgb(14, 13, 13);
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
  background: linear-gradient(to right, #3754c9 , #2a6bc7);
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
  background: linear-gradient(to right, #388de7 , #2c6fd2);
  color: #fff;
}

.beian-dialog .weui-dialog__ft .weui-dialog__btn:after {
  border-left: none;
}



</style>

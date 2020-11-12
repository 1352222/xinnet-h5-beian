const app = getApp()

export default function getAttachmentParam(image) {
  const { orderCode, icp } = app.globalData
  const { icpOrder, icpOrgOrder, icpWebsiteOrder } = icp
  const data = {
    extName: 'jpg',
    filePattern: 'jpg',
    /* 该参数是固定的，表明该图片是从客户端上传 */
    fileSource: 'CUSTOMER',
    // 附件的id，没有覆盖功能传null（有id不需要上传）
    attachmentOrderId: null,
    orderCode,
    orderId: icpOrder ? icpOrder.id : '',
    ispOrgId: icpOrgOrder ? icpOrgOrder.id : '',
    ispWebsiteId: icpWebsiteOrder ? icpWebsiteOrder.id : '',
    // checkPhone缺少
    orgRecordNumber: icpOrgOrder ? icpOrgOrder.orgRecordNumber : '',
    // isWebsiteChecklist是否核验单 1:是  0:不是   2:承诺书
    isWebsiteChecklist: image.isWebsiteChecklist,
    filePurpose: image.filePurpose,
    picSequenceNum: image.picSequenceNum,
    fileState: image.fileState,
    /* 去掉image/jpeg base64格式附件 */
    byteFile: image.byteFile,
    // 2,3为ORG，1,4,5为WEBSITE
    type: image.type
  }
  if (image.otherFileType) {
    data.otherFileType = image.otherFileType
  }
  return data
}

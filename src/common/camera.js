// 异常的回调函数
function error(error) {
  console.log("访问用户媒体设备失败：", error.name, error.message);
}

// 访问用户媒体设备的兼容方法
export default function getUserMedia(constrains, success) {
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      // 首先获取现存的getUserMedia(如果存在)
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      // 有些浏览器不支持，会返回错误信息
      // 保持接口一致
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      //否则，使用Promise将调用包装到旧的navigator.getUserMedia
      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }
  if (navigator.mediaDevices.getUserMedia) {
    //最新标准API
    navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error);
  } else if (navigator.webkitGetUserMedia) {
    //webkit内核浏览器
    navigator.webkitGetUserMedia(constrains).then(success).catch(error);
  } else if (navigator.mozGetUserMedia) {
    //Firefox浏览器
    navagator.mozGetUserMedia(constrains).then(success).catch(error);
  } else if (navigator.getUserMedia) {
    //旧版API
    navigator.getUserMedia(constrains).then(success).catch(error);
  }
}

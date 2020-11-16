<template>
  <div class="beian-result">
    <div
      v-if="done"
      type="success"
      title="核验成功"
      size="90"
      class="beian-result-msg"
    >
      <div slot="desc" class="desc">
        您可返回PC端上传其他附件、查看备案信息、提交审核
      </div>
      <div slot="handle">
        <button @click="back" class="weui-btn btn-submit" type="primary">
          返回
        </button>
      </div>
    </div>

    <div wx:else type="warn" size="90" class="beian-result-msg">
			<div class="icon"></div>
      <div class="desc">备案信息不完整，请返回上传资料</div>
      <div class="handle">
        <button @click="back" class="weui-btn btn-submit" type="primary">
          返回
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Result',
  data() {
    return {
      done: true,
    }
  },
  methods: {
		back() {
			this.$router.push('/list')
		}
  },
  computed: {
    ...mapState({
			globalData: state => state.home.globalData
    })
	},
	mounted() {
		const { recordType, orgState, websiteState, realityVerifyState, screenState } = this.globalData
    // 个人
    if (recordType == '5' && websiteState == 'right' && screenState == 'right' && realityVerifyState == 'right') {
			this.done = true
      // wx.setNavigationBarTitle({
      //   title: '提交成功'
      // })
    // 企业
    } else if (recordType != '5' && orgState == 'right' && websiteState == 'right' && screenState == 'right' && realityVerifyState == 'right') {
      this.done = true
      // wx.setNavigationBarTitle({
      //   title: '提交成功'
      // })
    } else {
			this.done = false
      // wx.setNavigationBarTitle({
      //   title: '提交失败'
      // })
    }
	}
}
</script>
<style scoped>
.beian-result {
  width: 100%;
  height: 100%;
}

.beian-result-msg {
	width: 100%;
  height: 100%;
}

.weui-btn {
  color: #fff;
  width: 70% !important;
}

.beian-result-msg {
  background: #e4eaf6;
}

.desc {
  color: #333;
}
</style>

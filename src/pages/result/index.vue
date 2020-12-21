<template>
  <div class="beian-result">
    <div
      v-if="done"
      type="success"
      title="核验成功"
      size="90"
      class="beian-result-msg"
    >
			<div class="icon">
				<img alt="right" src="~@/assets/right.png" />
			</div>
			<div class="title">核验成功</div>
      <div class="desc" style="color:#f00;">
        请您返回电脑端上传其他附件、查看备案信息、提交审核
        <!-- 您可返回PC端上传其他附件、查看备案信息、提交审核 -->
      </div>
      <div class="handle">
        <button @click="back" class="weui-btn btn-submit" type="primary">
          返回
        </button>
      </div>
    </div>

    <div v-else type="warn" size="90" class="beian-result-msg">
			<div class="icon">
				<img alt="right" src="~@/assets/wrong.png" />
			</div>
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
      done: true
    }
  },
  methods: {
    back() {
      this.$router.push('/list')
    },
    onLoad() {
      const { recordType, orgState, websiteState, realityVerifyState, screenState } = this.globalData
      // 个人
      if (recordType == '5' && websiteState == 'right' && screenState == 'right' && realityVerifyState == 'right') {
        this.done = true
        this.setDocumentTitle('提交成功')
      // 企业
      } else if (recordType != '5' && orgState == 'right' && websiteState == 'right' && screenState == 'right' && realityVerifyState == 'right') {
        this.done = true
        this.setDocumentTitle('提交成功')
      } else {
        this.done = false
        this.setDocumentTitle('提交失败')
      }
    }
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData
    })
  },
  mounted() {
    if (this.globalData.orderCode) {
      this.onLoad()
    } else {
      this.$watch('globalData.loading', loading => {
        if (!loading) {
          this.onLoad()
        }
      })
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
	min-height: 100%;
	padding-top: 48px;
	text-align: center;
	line-height: 1.4;
	box-sizing: border-box;

}

.icon {
	margin-bottom: 32px;
}

.title {
	font-weight: 700;
	font-size: 22px;
	margin-bottom: 20px;
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
	font-size: 17px;
	font-weight: normal;
	padding: 0 10%;
}

.handle {
	margin-top: 100px;
}

.btn-submit {
	height: 38px;
	line-height: 38px;
	font-size: 18px;
	border: 1px solid #fff;
	border-radius: 4px;
	font-weight: normal;
  background: linear-gradient(to right, #388de7 , #2c6fd2);
}
</style>

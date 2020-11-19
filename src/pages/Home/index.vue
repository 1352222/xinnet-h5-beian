<template>
  <div id="home" class="xinnet-beian-startup">
    <div class="xinnet-beian-title">ICP备案核验</div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
export default {
  name: 'Home',
  data() {
    return {
      num: 0
    }
  },
  mounted(query) {
    // let a = 0
    const b = setInterval(() => {
      // a += 1
      if (!query) {
        query = {}
      }
      this.onload(query)
      // this.utils.text()
      clearInterval(b)
    }, '2000')
    // this.$router.push('/login')
  },
  methods: {
    onload(query) {
      this.toLoginPage()
      // const scene = decodeURIComponent(query.scene)
      // // 微信扫一扫扫码二维码
      // const q = decodeURIComponent(query.q)
      // const url = query.scene ? scene : q
      // const { orderCode, orderType } = getParams(url)

      // this.setData({ orderCode, orderType }, () => {
      //   app.globalData.orderCode = orderCode
      //   // 备案类型为新增接入、变更接入和变更主体时，无网站信息，跳过输入手机号步骤
      //   if (orderType === 'NEW_CHECK_IN' || orderType === 'CHANGE_CHECK_IN' || orderType === 'CHANGE_ORG' || orderType === 'NO_ORG_NEW_CHECK_IN') {
      //     this.getUserData()
      //   } else {
      //     this.toLoginPage()
      //   }
      // })
    },
    toLoginPage() {
      this.$router.push('/login')
    },
    ...mapMutations({
      setNum: 'SET_NUM'
    }),
    increase() {
      this.num++
      this.setNum(this.num)
    }
  },
  computed: {
    ...mapState({
      number: state => state.home.number
    })
  }
}
</script>
<style scoped>
.xinnet-beian-startup {
  width: 100%;
  height: 100%;
  position: relative;
  background-size: 100% 100%;
  background-image: url("~@/assets/startup_bg.jpg");
}
.xinnet-beian-title {
  font-size: 30px;
  width: 100%;
  color: #ffffff;
  position: absolute;
  top: 74.9%;
  width: 100%;
  text-align: center;
}
</style>

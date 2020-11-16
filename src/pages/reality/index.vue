<template>
  <div id="reality">
      reality
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
export default {
  name: "Reality",
  data() {
    return {
      num: 0,
    }
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
      setNum: "SET_NUM",
    }),
    increase() {
      this.num++
      this.setNum(this.num)
    },
  },
  computed: {
    ...mapState({
      number: state => state.home.number,
    }),
  },
}
</script>
<style>
</style>

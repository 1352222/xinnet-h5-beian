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
    this.setDocumentTitle('ICP备案核验')
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
    getParams(url) {
      const start = url.indexOf('?') + 1
      const orderCodeUrl = url.slice(start)
      const aOrderCodeUrl = orderCodeUrl.split('&')
      const params = {}
      for (let i = 0; i < aOrderCodeUrl.length; i++) {
        const temp = aOrderCodeUrl[i].split('=')
        const key = temp[0]
        const val = temp[1]
        params[key] = val
      }
      return params
    },
    onload(query) {
      const { orderType } = this.getParams(window.location.search)
      // 备案类型为新增接入、变更接入和变更主体时，无网站信息，跳过输入手机号步骤
      if (orderType === 'NEW_CHECK_IN' || orderType === 'CHANGE_ORG' || orderType === 'NO_ORG_NEW_CHECK_IN') {
        this.toListPage()
      } else {
        this.toLoginPage()
      }
    },
    toLoginPage() {
      this.$router.push('/login')
    },
    toListPage() {
      this.$router.push('/list')
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

<template>
  <div id="home" class="xinnet-beian-startup">
    <div class="xinnet-beian-title">ICP备案核验</div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { getParams } from '../../common/util'

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
    ...mapMutations({
      setData: 'SET_DATA'
    }),
    onload(query) {
      const { orderType } = this.getParams(window.location.search)
      // 备案类型为新增接入、变更主体，无主体新增网站跳过输入手机号步骤
      if (orderType === 'NEW_CHECK_IN' || orderType === 'CHANGE_ORG' || orderType === 'NO_ORG_NEW_CHECK_IN') {
        this.setData({ businessType: 'noPhone' })
        this.toListPage()
      } else {
        this.setData({ businessType: 'existPhone' })
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

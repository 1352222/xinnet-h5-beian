<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from 'vuex'
import $ from 'jquery'

export default {
  name: 'App',
  created() {
    const phone = window.sessionStorage.getItem('phone')
    const orderCode = window.sessionStorage.getItem('orderCode')
    const self = this
    if (phone && orderCode) {
      self.setData({ loading: true })
      $.ajax({
        url: `/api/miniprogram/checkPhone?orderCode=${orderCode}&phone=${phone}`,
        success(data) {
          const res = data.data
          if (data.code === 'success') {
            self.setData({
              icp: res,
              orderCode: res.icpOrder.orderCode,
              recordType: res.icpOrder.orgPropertyId,
              orderType: res.icpOrder.orderType,
              phone: phone,
              loading: false
            })
          } else {
            Toast({
              message: data.message,
              duration: 3000
            })
          }
        },
        error() {
          self.setData({ loading: false })
        }
      })
    }
  },
  methods: {
    ...mapMutations({
      setData: 'SET_DATA'
    }),
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData
    })
  }
}
</script>

<style>
#app {
  -webkit-tap-highlight-color:rgba(0,0,0,0);
}
/* #app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
.mint-indicator-wrapper {
  z-index: 10000;
}
.mint-indicator-mask {
  z-index: 10000;
}
</style>

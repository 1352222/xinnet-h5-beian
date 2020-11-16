<template>
  <div id="login">
    <form style="padding:0 10px;" @submit="formSubmit" @click="() => { return false }">
      <div class="label-area">
        为确保本人操作请输入网站负责人手机号进行验证
      </div>
      <div class="input-area">
        <input v-model="phone" class="input" name="phone" placeholder-class="input-placeholder" type="text" placeholder="请输入网站负责人的手机号" />
      </div>
      <div class="error-area" v-if="showError">
      <!-- <icon color="#ff001d" type="info" size="20"></icon> -->
        <img style="width:14px;vertical-align: middle;" class="error-icon" src="~@/assets/warn.png" />
        <span>{{error}}</span>
      </div>

      <div class="btn-area">
        <mt-button type="primary" class="btn" size="large" :disabled="loading" :loading="loading">确认</mt-button>
        <!-- <mt-button type="primary" :disabled="loading" :loading="loading">确认</mt-button> -->
        <!-- <button
          class="btn mint-button mint-button--primary mint-button--large"
          formType="submit"
          :disabled="loading" 
          :loading="loading"
        >
          确认
        </button> -->
      </div>
    </form>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
import utils from '@/common/utils'
import $ from 'jquery'
import { Toast } from 'mint-ui'
export default {
  name: 'Login',
  data() {
    return {
      showError: false,
      error: '',
      loading: false,
      phone: ''
    }
  },
  methods: {
    formSubmit(e) {
      e.preventDefault()
      const phone = this.phone
      const globalData = this.globalData
      const self = this
      if (!phone) {
        this.error = '请输入手机号码'
        this.showError = true
        return false
      } else if (!utils.isPhone(phone)) {
        this.error = '手机号码不正确'
        this.showError = true
        return false
        // this.$router.push('/list')
      }

      this.loading = true
      this.error = ''
      this.showError = false

      const orderCode = globalData.orderCode
      // this.setData(this.num)
      $.ajax({
        url: `/api/miniprogram/checkPhone?orderCode=ICP4022671241036226&phone=13716918573`,
        // url: `/apiPath/checkPhone?orderCode=${this.globalData.orderCode}&phone=${phone}`,
        success(data) {
          // const { data } = res
          let globalDatas = globalData
          if (data.code === 'success') {
            globalDatas.icp = data.data
            globalDatas.orderCode = data.data.icpOrder.orderCode
            globalDatas.recordType = data.data.icpOrder.orgPropertyId
            globalDatas.orderType = data.data.icpOrder.orderType
            globalDatas.phone = phone
            self.setData(globalDatas)
            self.$router.push('/list')
            setTimeout(() => {
              self.loading = false
            }, 5000)
          } else {
            Toast({
              message: data.message,
              duration: 3000
            })
            self.loading = false
          }
        }
      }, () => { self.loading = false })
    },
    ...mapMutations({
      setData: "SET_DATA",
    }),
  },
  computed: {
    ...mapState({
      globalData: state => state.home.globalData,
    }),
  }
}
</script>

<style scoped>
#login {
  width: 100%;
  height: 100%;
}
.xinnet-beian-login {
  height: 100px;
  padding: 40px 30px;
  background: #fff;
}

.input-area {
  font-size: 15px;
  color: #333333;
  /* margin: 7px auto; */
}

.input {
  box-sizing: border-box;
  width: 100%;
  height: 50px;
  background-color: #f2f4f7;
  border-radius: 2px;
  padding-left: 10px;
  border: none;
  outline: none;
}

.input-placeholder {
  font-size: 28px;
}

.label-area {
  font-size: 14px;
  color: #333333;
  line-height: 40px;
}

.error-area {
  font-size: 12px;
  line-height: 20px;
  color: #ff001d;
}

.btn-area {
  margin-top: 138px;
}
.btn {
  height: 41px !important;
  font-size: 18px !important;
  border-radius: 4px !important;
}
</style>

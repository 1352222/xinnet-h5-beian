<template>
  <div id="result">
      result
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from "vuex"
export default {
    name: "Result",
    data() {
        return {
            num: 0,
        }
    },
    methods: {
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

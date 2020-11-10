import Vue from 'vue'
import Vuex from 'vuex'
import home from './modules/home'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)
const debug = true

export default new Vuex.Store({
    modules: {
        home
    },
    plugins: debug ? [createLogger()] : []
})
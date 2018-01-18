import Vue from 'vue'
import App from './App'

import ElementUI from 'element-ui'
import Croppa from 'vue-croppa'

import 'element-ui/lib/theme-chalk/index.css'
import 'vue-croppa/dist/vue-croppa.css'

Vue.use(ElementUI)
Vue.use(Croppa)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})

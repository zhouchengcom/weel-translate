// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'

import 'vuetify/dist/vuetify.min.css'

import router from '@/routers/options'
import store from '@/stores/options'
import WebExtUtils from '@/plugins/WebExtUtils'
import { generateStorageWatchers } from '@/functions/utils'
import { vuetify } from '@/globals'

import App from './App'
import {
  UPDATE_STORAGE_STATE,
  INITIAL_FROM_BACKGROUND
} from '@/types'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(Vuetify, vuetify)

Vue.use(WebExtUtils)

;(async () => [await store.dispatch(INITIAL_FROM_BACKGROUND)])()
.then(([success]) => {
  if (!success) return false

  generateStorageWatchers(store, (type, key) =>
    typeof store.dispatch(UPDATE_STORAGE_STATE, { type, key }))

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
    components: { App }
  })
})

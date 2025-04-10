import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
Vue.use(Buefy)

import VueRouter from "vue-router";
Vue.use(VueRouter);

require("@/assets/main.scss");

Vue.config.productionTip = false;

const routes = [
  { path: '/:communityId'}
]

const router = new VueRouter({
  mode: 'history',
  routes,
})

new Vue({
  router,
  store: store,
  render: (h) => h(App),
}).$mount("#app");

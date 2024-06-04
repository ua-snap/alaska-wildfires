import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
Vue.use(Buefy)

require("@/assets/main.scss");

Vue.config.productionTip = false;

new Vue({
  store: store,
  render: (h) => h(App),
}).$mount("#app");

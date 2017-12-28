import Vue from 'vue';
import App from './app.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI, { size: 'small' });

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  render: h => h(App)
});

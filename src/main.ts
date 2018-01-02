import Vue from 'vue';
import App from './app.vue';
import './assets/fonts/proximanova.css';
import 'normalize.css/normalize.css';
import 'muse-ui/dist/muse-ui.css';
import 'muse-ui/dist/theme-light.css'
import MuseUI from 'muse-ui';

Vue.use(MuseUI);


Vue.config.productionTip = false;

new Vue({
  el: '#app',
  render: h => h(App)
});

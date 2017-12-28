import Vue from 'vue';
import { TransformNetwork } from './transform-network/network';

export default Vue.extend({
  name: 'app',
  components: {
    'style-transfer': () => import('./components/StyleTransfer/style-transfer.vue')
  }
});

import Vue from 'vue';

export default Vue.extend({
  name: 'app',
  components: {
    'style-transfer': () => import('./components/StyleTransfer/style-transfer.vue')
  }
});

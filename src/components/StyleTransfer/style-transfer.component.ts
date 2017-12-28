import Vue from 'vue';
import Component from 'vue-class-component';
import { TransformNetwork } from "../../transform-network/network";
import { Array3D, render_ndarray_gpu_util, gpgpu_util, GPGPUContext, ENV } from "deeplearn";

const math = ENV.math;
declare const process: any;

@Component({
  name: 'style-transfer',
  props: {
    styleNames: {
      type: Array,
      default: () => [
        'udnie',
        'scream',
        'la_muse',
        'rain_princess',
        'wave',
        'wreck'
      ]
    },
    transformNetwork: {
      type: Object,
      default: () => new TransformNetwork()
    }
  }
})
export default class StyleTransferComponent extends Vue {

  // $data
  contentUrl = '';
  styleUrl = '';
  styleName = '';
  startBtnLoading = false;

  // $props
  styleNames: string[];
  transformNetwork: TransformNetwork;


  uploadContent({ target }: Event) {
    const files = (target as HTMLInputElement).files as FileList;
    Vue.nextTick(() => {
      this.contentUrl = URL.createObjectURL(files[0]);
    });
  }

  async selectStyle(styleName: string) {
    console.log(styleName);
    Vue.nextTick(() => {
      this.styleName = styleName;
    });

    let prefix = process.env.NODE_ENV === 'development' ? '/' : '/fast-style-transfer-front-end/';
    console.log(process.env);
    const response = await fetch(`${prefix}static/images/${styleName}.jpg`);
    const blob = await response.blob();
    Vue.nextTick(() => {
      this.styleUrl = URL.createObjectURL(blob);
    })
  }

  async startTransfer() {
    this.startBtnLoading = true;
    if (!(this.contentUrl && this.styleUrl)) {
      this.$message.error('Please set Content or Style!');
      this.startBtnLoading = false;
      return;
    }

    Vue.nextTick(async () => {
      await this.transformNetwork.setStyle(this.styleName);


      await math.scope(async (keep, track) => {
        const input = document.getElementById('transfer-content') as HTMLImageElement;
        const preprocessed = track(Array3D.fromPixels(input) as Array3D);
        const inferenceResult: Array3D = this.transformNetwork.predict(preprocessed);

        const canvas = this.$refs.output as HTMLCanvasElement;
        canvas.width = input.width;//inferenceResult.shape[0];
        canvas.height = input.height;//inferenceResult.shape[1];

        await renderToCanvas(inferenceResult, canvas as HTMLCanvasElement);
      });

      this.$message.info('Processing finished.');
      this.startBtnLoading = false;
    });
  }
}

async function renderToCanvas(a: Array3D, canvas: HTMLCanvasElement) {
  const [height, width,] = a.shape;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = new ImageData(width, height);
  const data = await a.data();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;
    imageData.data[j] = Math.round(255 * data[k]);
    imageData.data[j + 1] = Math.round(255 * data[k + 1]);
    imageData.data[j + 2] = Math.round(255 * data[k + 2]);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

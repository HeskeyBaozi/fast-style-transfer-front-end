import Vue from 'vue';
import Component from 'vue-class-component';
import { TransformNetwork } from "../../transform-network/network";
import { Array3D, ENV } from "deeplearn";

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
        'wreck',
        'btfly'
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
  log = '';
  progress = 0;
  useOrigin = false;

  // $props
  styleNames: string[];
  transformNetwork: TransformNetwork;

  // $computed
  get startable(): boolean {
    return !!(this.contentUrl && this.styleUrl);
  }


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
    const response = await fetch(`${prefix}static/images/${styleName}.jpg`);
    const blob = await response.blob();
    Vue.nextTick(() => {
      this.styleUrl = URL.createObjectURL(blob);
    })
  }

  async startTransfer() {
    this.log = '开始风格迁移...';
    this.progress = 1;
    this.startBtnLoading = true;
    if (!(this.contentUrl && this.styleUrl)) {
      this.startBtnLoading = false;
      return;
    }

    this.log = '加载模型中...';
    const interval = window.setInterval(() => {
      this.progress = this.progress + (50 - this.progress) / 4;
    }, 500);
    await this.transformNetwork.setStyle(this.styleName);
    this.progress = 50;
    window.clearInterval(interval);
    this.log = '计算合成图中...';


    Vue.nextTick(async () => {
      await math.scope(async (keep, track) => {
        const input = await getImage(this.contentUrl);
        if (!this.useOrigin) {
          const content = this.$refs.content as HTMLImageElement;
          input.width = content.width;
          input.height = content.height;
        }
        const preprocessed = track(Array3D.fromPixels(input) as Array3D);
        const inferenceResult: Array3D = this.transformNetwork.predict(preprocessed);
        this.progress = 90;
        this.log = '渲染中...';

        const canvas = this.$refs.output as HTMLCanvasElement;
        canvas.width = input.width;//inferenceResult.shape[0];
        canvas.height = input.height;//inferenceResult.shape[1];

        await renderToCanvas(inferenceResult, canvas as HTMLCanvasElement);
      });

      this.log = '风格迁移完成!';
      this.progress = 100;
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

async function getImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>(resolve => {
    const input = new Image();
    input.src = url;
    input.onload = () => {
      resolve(input);
    };
  });
}

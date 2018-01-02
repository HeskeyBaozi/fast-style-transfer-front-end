import Vue from 'vue';
import Component from 'vue-class-component';
import { Array3D } from "deeplearn";

@Component({
  name: 'layer-preview',
  props: {
    name: {
      required: true,
      type: String
    },
    layer: {
      required: true,
      type: Object
    }
  }
})
export default class LayerPreview extends Vue {
  name: string;
  layer: {
    layer: Array3D,
    data: any
  };
  canvas: HTMLCanvasElement;

  async mounted() {
    this.canvas = this.$refs.canvas as HTMLCanvasElement;
    console.log('render ', this.name);
    await renderToCanvas(this.layer, this.canvas);
  }
}


async function renderToCanvas(a: {
  layer: Array3D,
  data: any
}, canvas: HTMLCanvasElement) {
  const [height, width, channels] = a.layer.shape;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = new ImageData(width, height);
  const data = a.data;
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * channels;
    imageData.data[j] = Math.round(255 * data[k]);
    imageData.data[j + 1] = Math.round(255 * data[k + 1]);
    imageData.data[j + 2] = Math.round(255 * data[k + 2]);
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

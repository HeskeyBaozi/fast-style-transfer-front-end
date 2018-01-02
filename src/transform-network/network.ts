import { Array1D, Array3D, Array4D, CheckpointLoader, NDArray, ENV, Scalar, Model } from 'deeplearn';

declare const process: any;
let prefix = process.env.NODE_ENV === 'development' ? '/' : '/fast-style-transfer-front-end/';
const Check_Points_Path = prefix + 'static/checkpoints';


interface VariableRecording {
  [styleName: string]: Variables
}

interface Variables {
  [varName: string]: NDArray
}

export interface Step {
  [name: string]: {
    layer: Array3D,
    data: any
  }
}

export class TransformNetwork implements Model {
  varsRecording: VariableRecording = {};
  currentStyle = '';
  step: Step = {};
  math = ENV.math;

  get variables(): Variables {
    return this.varsRecording[this.currentStyle];
  }

  timesScalar: NDArray = Scalar.new(150);
  plusScalar: NDArray = Scalar.new(255. / 2);
  epsilonScalar: NDArray = Scalar.new(1e-3);

  async setStyle(styleName: string) {
    this.currentStyle = styleName;
    await this.load();
  }

  async load() {
    if (this.varsRecording[this.currentStyle]) {
      console.log(`${this.currentStyle} has been loaded.`);
    } else {
      const checkpointLoader = new CheckpointLoader(`${Check_Points_Path}/${this.currentStyle}/`);
      this.varsRecording[this.currentStyle] = await checkpointLoader.getAllVariables();
      console.log(`new style ${this.currentStyle} added.`);
    }
  }

  predict(preprocessedInput: Array3D): Array3D {
    const totalStep: any[] = [];
    const img = this.math.scope((keep, track) => {
      this.step = {};
      const conv1 = this.convLayer(preprocessedInput, 1, true, 0);
      const conv2 = this.convLayer(conv1, 2, true, 3);
      const conv3 = this.convLayer(conv2, 2, true, 6);
      const resid1 = this.residualBlock(conv3, 9);
      const resid2 = this.residualBlock(resid1, 15);
      const resid3 = this.residualBlock(resid2, 21);
      const resid4 = this.residualBlock(resid3, 27);
      const resid5 = this.residualBlock(resid4, 33);
      const convT1 = this.convTransposeLayer(resid5, 64, 2, 39);
      const convT2 = this.convTransposeLayer(convT1, 32, 2, 42);
      const convT3 = this.convLayer(convT2, 1, false, 45);
      const outTanh = this.math.tanh(convT3);
      const scaled = this.math.scalarTimesArray(this.timesScalar, outTanh);
      const shifted = this.math.scalarPlusArray(this.plusScalar, scaled);
      const clamped = this.math.clip(shifted, 0, 255);
      const normalized = this.math.divide(clamped, Scalar.new(255)) as Array3D;


      this.step = {
        conv1: { data: conv1.dataSync(), layer: conv1 },
        conv2: { data: conv2.dataSync(), layer: conv2 },
        conv3: { data: conv3.dataSync(), layer: conv3 },
        resid1: { data: resid1.dataSync(), layer: resid1 },
        resid2: { data: resid2.dataSync(), layer: resid2 },
        resid3: { data: resid3.dataSync(), layer: resid3 },
        resid4: { data: resid4.dataSync(), layer: resid4 },
        resid5: { data: resid5.dataSync(), layer: resid5 },
        convT1: { data: convT1.dataSync(), layer: convT1 },
        convT2: { data: convT2.dataSync(), layer: convT2 },
        convT3: { data: convT3.dataSync(), layer: convT3 },
        outTanh: { data: outTanh.dataSync(), layer: outTanh },
        scaled: { data: scaled.dataSync(), layer: scaled },
        normalized: { data: normalized.dataSync(), layer: normalized }
      };

      console.log(this.step);

      return normalized;
    });

    return img;
  }

  dispose() {
    for (const styleName in this.varsRecording) {
      for (const varName in this.varsRecording[styleName]) {
        if (this.varsRecording[styleName].hasOwnProperty(varName)) {
          this.varsRecording[styleName][varName].dispose();
        }
      }
    }
  }

  convLayer(input: Array3D, strides: number, relu: boolean, varId: number): Array3D {
    const y = this.math.conv2d(
      input,
      this.variables[TransformNetwork.varName(varId)] as Array4D,
      null,
      [strides, strides],
      'same'
    );

    const y2 = this.instanceNorm(y, varId + 1);

    return relu ? this.math.relu(y2) : y2;

  }

  convTransposeLayer(input: Array3D, numFilters: number, strides: number, varId: number): Array3D {
    const [height, width] = input.shape;
    const newRows = height * strides;
    const newCols = width * strides;
    const newShape: [number, number, number] = [newRows, newCols, numFilters];

    const y = this.math.conv2dTranspose(input,
      this.variables[TransformNetwork.varName(varId)] as Array4D,
      newShape, [strides, strides], 'same');

    const y2 = this.instanceNorm(y, varId + 1);

    const y3 = this.math.relu(y2);

    return y3;
  }

  residualBlock(input: Array3D, varId: number): Array3D {
    const conv1 = this.convLayer(input, 1, true, varId);
    const conv2 = this.convLayer(conv1, 1, false, varId + 3);
    return this.math.addStrict(conv2, input);
  }

  instanceNorm(input: Array3D, varId: number): Array3D {
    const [height, width, inDepth] = input.shape;
    const moments = this.math.moments(input, [0, 1]);
    const mu = moments.mean as Array3D;
    const sigmaSq = moments.variance as Array3D;
    const shift = this.variables[TransformNetwork.varName(varId)] as Array1D;
    const scale = this.variables[TransformNetwork.varName(varId + 1)] as Array1D;
    const epsilon = this.epsilonScalar;
    const normalized = this.math.divide(
      this.math.sub(input, mu),
      this.math.sqrt(this.math.add(sigmaSq, epsilon))
    );
    const shifted = this.math.add(
      this.math.multiply(scale, <NDArray>normalized),
      shift
    );
    return shifted.as3D(height, width, inDepth);
  }

  static varName(varId: number): string {
    if (varId === 0) {
      return 'Variable';
    }
    else {
      return 'Variable_' + varId.toString();
    }
  }

}

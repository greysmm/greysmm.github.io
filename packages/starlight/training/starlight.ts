import * as tf from "@tensorflow/tfjs-node-gpu";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import GIF from "sharp-gif";

let inputShape = [32, 32, 3];
const timeSteps = 50;
const inferences = 32;
const batchSize = 4;
const epochs = 10;
const maxImages = 160;
const invert = true;
const modelPath = "./model";
const skipTraining = false;
const finalSize = [240, 240];

const shuffle = (arr) => {
  let ind = arr.length;
  while (ind != 0) {
    let ind2 = Math.floor(Math.random() * ind);
    ind--;
    const tmp = arr[ind];
    arr[ind] = arr[ind2];
    arr[ind2] = tmp;
  }
};

// Function to load images from a directory
function loadImagesFromDirectory(directoryPath: string): tf.Tensor[] {
  let files = fs.readdirSync(directoryPath);
  shuffle(files);
  files = files.slice(0, maxImages);

  let batches: tf.Tensor[] = [];
  for (let i = 0; i < files.length; i += batchSize) {
    const batchFiles = files.slice(i, i + batchSize);
    const batchImages = [];

    for (const file of batchFiles) {
      const filePath = path.join(directoryPath, file);
      const buffer = fs.readFileSync(filePath);
      const img = tf.image
        .resizeBilinear(tf.node.decodeImage(buffer, 3), [
          inputShape[0],
          inputShape[1],
        ])
        .div(255);
      batchImages.push(img);
    }

    const batchTensor = tf.stack(batchImages);
    batches.push(invert ? batchTensor.mul(-1).add(1) : batchTensor);
  }

  return batches;
}

const simpleNoise = (image, magnitude) => {
  const noise = tf.randomUniform([batchSize, ...inputShape], -1, 1);
  return [image.add(noise.mul(tf.reshape(magnitude, [-1, 1, 1, 1]))), noise];
};

function conv2d(x, filters, kernelSize, strides, padding, activation, name) {
  return tf.layers
    .conv2d({ filters, kernelSize, strides, padding, activation, name })
    .apply(x);
}

function unet() {
  const input = tf.input({ shape: inputShape });

  // Encoder
  let x = conv2d(input, 32, 3, 1, "same", "swish", "conv1_1");
  x = tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }).apply(x);
  x = conv2d(x, 64, 3, 1, "same", "swish", "conv1_2");
  x = tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }).apply(x);
  x = conv2d(x, 64, 3, 1, "same", "swish", "conv1_3") as tf.SymbolicTensor;

  // Decoder
  x = conv2d(x, 64, 3, 1, "same", "swish", "conv2_1");
  x = tf.layers.upSampling2d({ size: [2, 2] }).apply(x);
  x = conv2d(x, 64, 3, 1, "same", "swish", "conv2_2");
  x = tf.layers.upSampling2d({ size: [2, 2] }).apply(x);
  x = conv2d(x, 32, 3, 1, "same", "swish", "conv2_3");
  x = conv2d(x, 3, 3, 1, "same", "swish", "output") as tf.SymbolicTensor;

  const model = tf.model({ inputs: input, outputs: x });

  return model;
}

async function main() {
  const imagesDirectory = "./images";
  const batches = loadImagesFromDirectory(imagesDirectory);

  let model: tf.LayersModel;
  try {
    model = await tf.loadLayersModel("file://" + modelPath + "/model.json");
    console.log("Model loaded from " + modelPath);
  } catch {
    console.log("No model found. Initializing from scratch.");
    model = unet();
  }

  model.summary();
  const optimizer = tf.train.adam(1e-4);
  function lossFn(yTrue, yPred) {
    return tf.mean(tf.pow(tf.sub(yTrue, yPred), 2));
  }

  model.compile({ optimizer, loss: lossFn, metrics: ["accuracy"] });

  if (!skipTraining) {
    for (let i = 0; i < epochs; i++) {
      let loss = 0;
      shuffle(batches);
      for (const batch of batches) {
        tf.engine().startScope();
        const t = tf.randomUniform([batchSize], -1, 0).pow(3).add(1);
        const [noisedImage, noise] = simpleNoise(batch, t);
        loss += (await model.trainOnBatch(noisedImage, batch))[0];
        tf.engine().endScope();
      }
      console.log(`Finished epoch ${i} with loss ${loss / batches.length}`);
      // Save the model
      await model.save("file://" + modelPath);
    }
  }

  let x = tf
    .randomUniform([inferences, ...inputShape], 0, 1)
    .add(tf.randomUniform([inferences, ...inputShape], -1, 1));
  for (let step = timeSteps - 1; step >= 0; step--) {
    const step_mix = 1 / (timeSteps - step);
    const t = tf.tensor([[step / (timeSteps - 1)]]);
    x = x
      .mul(1 - step_mix)
      .add((model.predict(x) as tf.Tensor).clipByValue(0, 1).mul(step_mix))
      .mul(1 - step_mix / 10)
      .add(tf.randomUniform([1, ...inputShape], 0, step_mix / 10));
  }
  console.log(`Inference finished`);

  x = x.clipByValue(0, 1);
  x = invert ? x.mul(-1).add(1) : x;
  // Rescale to final dimensionality
  x = tf.image.resizeBilinear(x as tf.Tensor3D, [finalSize[0], finalSize[1]]);
  // Output final image
  sharp(Buffer.from(x.mul(255).squeeze().dataSync()), {
    raw: { width: finalSize[0], height: finalSize[1], channels: 3 },
  }).toFile("generated_image.jpg", (err) => {
    if (err) {
      console.error("Error saving image:", err);
    } else {
      console.log("Image saved successfully!");
    }
  });

  const unstacked = x
    .mul(255)
    .unstack()
    .map((t) =>
      sharp(Buffer.from(t.dataSync()), {
        raw: { width: finalSize[0], height: finalSize[1], channels: 3 },
      }),
    );

  const image = await GIF.createGif({ transparent: "#000000" })
    .addFrame(unstacked)
    .toSharp();
  image.toFile("./generated_image.gif");
}

main();

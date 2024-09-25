import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";

const modelUrl = "https://greysmm.github.io/api/starlight/model.json";
const inputShape = [32, 32, 3];
const diameter = inputShape[0]!;
const timeSteps = 20;
const inferences = 12;
const invert = true;
const finalSize = 240;
const numStars = 200;
const multiColor = true;

const Star = (inputs: {
  name: string;
  model: tf.LayersModel;
  onFinish: any;
}) => {
  const [transform, setTransform] = useState<string | undefined>(undefined);

  const star = async () => {
    setTransform(`scale(${0.1 + 0.1 * Math.random()})`);

    const starImg = document.getElementById(inputs.name)!;
    const container = document
      .getElementById("container")!
      .getBoundingClientRect()!;

    starImg.style.left =
      Math.floor(
        container.left -
          0.4 * finalSize +
          Math.random() * (container.width - 0.2 * finalSize),
      ) + "px";
    starImg.style.top =
      Math.floor(
        container.top -
          0.4 * finalSize +
          Math.random() * (container.height - 0.2 * finalSize),
      ) + "px";

    let x = tf
      .randomUniform([inferences, ...inputShape], 0, 1)
      .add(tf.randomUniform([inferences, ...inputShape], -1, 1));
    for (let step = timeSteps - 1; step >= 0; step--) {
      const mix_factor = 1 / (timeSteps - step);
      x = x
        .mul(1 - mix_factor)
        .add(
          (inputs.model.predict(x) as tf.Tensor)
            .clipByValue(0, 1)
            .mul(mix_factor),
        )
        .mul(1 - mix_factor / 10)
        .add(tf.randomUniform([1, ...inputShape], 0, mix_factor / 10));
    }
    console.log(`Inference finished`);

    const circleMask = (radius) => {
      const [X, Y] = tf.meshgrid(tf.range(0, diameter), tf.range(0, diameter));
      return tf
        .sqrt(
          tf.square(X!.sub(diameter / 2)).add(tf.square(Y!.sub(diameter / 2))),
        )
        .lessEqual(radius)
        .reshape([1, diameter, diameter, 1]);
    };

    // Darken outside circular area centered on image center
    for (let iter = 0; iter < 20; iter++) {
      x = tf.where(
        circleMask(diameter / 3 + iter / 4),
        x,
        invert ? x.mul(1.03) : x.div(1.03),
      );
    }

    x = x.clipByValue(0, 1);
    x = invert ? x.mul(-1).add(1) : x;

    if (multiColor) {
      // Randomly swap around rgb channels
      const firstInd = Math.floor(Math.random() * 3);
      const secondInd = [0, 1, 2].filter((i) => i !== firstInd)[
        Math.floor(Math.random() * 2)
      ];
      const thirdInd = [0, 1, 2].filter(
        (i) => i !== firstInd && i !== secondInd,
      )[0];
      const gathered = [firstInd, secondInd, thirdInd].map((i) =>
        tf.gather(x, i as any, 3).expandDims(3),
      );
      // Also Add an opacity dimension based on the brightness
      x = tf.concat([...gathered, x.sum(-1, true).div(2)], -1);
    } else {
      x = tf.concat([x, x.sum(-1, true).div(2)], -1);
    }

    // Rescale to final dimensionality
    x = tf.image.resizeBilinear(x as tf.Tensor3D, [finalSize, finalSize]);

    const images = await Promise.all(
      x.unstack().map(async (t) => {
        const canvas = document.createElement("canvas");
        canvas.height = t.shape[0]!;
        canvas.width = t.shape[1]!;
        await tf.browser.toPixels(t as tf.Tensor3D, canvas);
        return canvas.toDataURL("image/png");
      }),
    );

    var currentFrame = 0; //Call it a frame because we're making a gif and every image (so every array index) will be a frame
    function changePicture() {
      starImg["src"] = images[currentFrame]; //Get the gif element and set its source to the current frame
      currentFrame++; //Increase the current frame by 1
      if (currentFrame >= images.length) {
        //If we've gone past the end of our array of frames, then:
        currentFrame = 0; //Reset back to frame 0
      }
    }

    setInterval(changePicture, 100);

    inputs.onFinish();
  };

  useEffect(() => {
    star();
  }, []);

  return (
    <img
      id={inputs.name}
      className="absolute bg-transparent"
      style={{ transform }}
    />
  );
};

const Starlight = () => {
  const [model, setModel] = useState<tf.LayersModel | undefined>(undefined);
  const [stars, setStars] = useState<number>(0);
  const getModel = async () => {
    const m = await tf.loadLayersModel(modelUrl);
    m.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
      metrics: ["accuracy"],
    });
    setModel(m);
  };
  useEffect(() => {
    getModel();
  }, []);
  return (
    <>
      <div
        id="container"
        className="p-4 mt-4 text-center border-theme bg-black"
      >
        {model &&
          [...Array(numStars)].map((_, i) => {
            console.log(stars === i);
            return (
              <>
                {stars >= i && (
                  <Star
                    key={"star_" + i}
                    name={"star_" + i}
                    model={model}
                    onFinish={() => setStars(stars + 1)}
                  />
                )}
              </>
            );
          })}
      </div>
      <div className="p-4 mt-4 text-center border-theme">
        PROJECT STARLIGHT (beta)
      </div>
    </>
  );
};

export default Starlight;

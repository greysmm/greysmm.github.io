import * as tf from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import { createSearchParams, useSearchParams } from "react-router-dom";

const modelUrl = "https://greysmm.github.io/api/starlight/model.json";
const inputShape = [32, 32, 3];
const diameter = inputShape[0]!;
const invert = true;

const data = {
  max_generated_stars: [
    1,
    500,
    "After generating this many stars (not including duplicates) we stop generating more. Be careful, high numbers may crash your browser.",
  ],
  size_random_mult: [
    0,
    100,
    "A number between this and 0 will randomly be used as a multiplier for the size of the stars.",
  ],
  size_static_mult: [0, 100, "A static multiplier for the size of the stars."],
  duplicate_stars: [
    0,
    1000,
    "The number of duplicate stars to be added with different size and coordinates every time a star is generated (duplicates do not count towards max generated stars). Duplicating stars instead of generating them is significantly less computationally intensive.",
  ],
  brightness: [
    0,
    10,
    "How bright the stars are (>1 will make them brighter, <1 will make them dimmer).",
  ],
  resolution: [
    1,
    1280,
    "The resolution of the star. Lower takes less time but makes stars look more pixelated.",
  ],
  timesteps: [
    1,
    200,
    "How many steps we take during sampling. More takes longer and produces better results.",
  ],
  frames: [
    1,
    200,
    "How many frames each star has. More takes longer, is harder on your computer, and produces better results.",
  ],
  fps: [0, 100, "Frames per second (across all stars)."],
};

// Stuff that can be modified on the actual page
const initialFormState = {
  fps: 10,
  frames: 16,
  timesteps: 16,
  brightness: 1,
  resolution: 16,
  size_static_mult: 1,
  size_random_mult: 1,
  duplicate_stars: 10,
  max_generated_stars: 10,
};

const Star = ({
  name,
  model,
  onFinish,
  timesteps,
  frames,
  resolution,
  size_static_mult,
  size_random_mult,
  duplicate_stars,
  fps,
  brightness,
}) => {
  const star = async () => {
    const container = document.getElementById("container")!;

    const cRect = container.getBoundingClientRect()!;

    const placeStar = (starImg) => {
      const scale = size_static_mult + size_random_mult * Math.random();
      starImg.className = "absolute bg-transparent";
      starImg.style.left =
        Math.floor(
          cRect.left -
            (Math.max(0, 1 - scale) / 2) * resolution +
            Math.random() * (cRect.width - scale * resolution),
        ) + "px";
      starImg.style.top =
        Math.floor(
          cRect.top -
            (Math.max(0, 1 - scale) / 2) * resolution +
            Math.random() * (cRect.height - scale * resolution),
        ) + "px";
      return `scale(${scale})`;
    };

    const starImg = document.getElementById(name)!;

    starImg.style.transform = placeStar(starImg);

    let x = tf
      .randomUniform([frames, ...inputShape], 0, 1)
      .add(tf.randomUniform([frames, ...inputShape], -1, 1));
    for (let step = timesteps - 1; step >= 0; step--) {
      const step_mix = 1 / (timesteps - step);
      x = x
        .mul(1 - step_mix)
        .add((model.predict(x) as tf.Tensor).clipByValue(0, 1).mul(step_mix))
        .mul(1 - step_mix / 10)
        .add(tf.randomUniform([1, ...inputShape], 0, step_mix / 10));
    }

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
    // Also add an opacity dimension based on the brightness
    x = tf.concat([...gathered, x.sum(-1, true).div(1.8 / brightness)], -1);

    // Rescale to final dimensionality
    x = tf.image.resizeBilinear(x.clipByValue(0, 1) as tf.Tensor3D, [
      resolution,
      resolution,
    ]);

    const images = await Promise.all(
      x.unstack().map(async (t) => {
        const canvas = document.createElement("canvas");
        canvas.height = t.shape[0]!;
        canvas.width = t.shape[1]!;
        await tf.browser.toPixels(t as tf.Tensor3D, canvas);
        return canvas.toDataURL("image/png");
      }),
    );

    const duplicates = [...Array(duplicate_stars)].map((_, i) => {
      const newImg = document.createElement("img");
      newImg.id = name + "_d" + i;
      newImg.style.transform = placeStar(newImg);
      container.appendChild(newImg);
      return newImg;
    });

    var currentFrame = 0;
    function changePicture() {
      starImg["src"] = images[currentFrame];
      duplicates.map((d) => (d.src = images[currentFrame]!));
      currentFrame++;
      if (currentFrame >= images.length) {
        currentFrame = 0;
      }
    }

    setInterval(changePicture, 1000 / fps);

    onFinish();
  };

  useEffect(() => {
    star();
  }, []);

  return <img id={name} />;
};

const Modal = ({ onClose, children, className = "" }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50"
      onClick={onClose}
    >
      <div
        className={"p-4 bg-theme border-theme " + className}
        style={
          window.innerWidth < 600 ? {} : { maxWidth: window.innerWidth / 1.5 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const ControlPanel = ({ data, formState, setFormState }) => {
  const [showTooltip, setShowTooltip] = useState("");
  const [tooltipLock, setTooltipLock] = useState(false);

  return (
    <div className="flex">
      <div>
        {Object.keys(data).map((key) => (
          <div key={key + "_label"} className="text-right m-1 my-2">
            {key
              .split("_")
              .map((word) => word[0]!.toUpperCase() + word.slice(1))
              .join(" ")}
          </div>
        ))}
      </div>
      <div className="pt-0.5">
        {Object.keys(data).map((key) => (
          <div key={key + "_label"} className="pr-4 pt-2">
            <button>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                onMouseEnter={() => !tooltipLock && setShowTooltip(key)}
                onMouseLeave={() => !tooltipLock && setShowTooltip("")}
                onClick={() => {
                  const unlock = tooltipLock && showTooltip !== key;
                  setShowTooltip(
                    showTooltip !== key || !tooltipLock ? key : "",
                  );
                  !unlock && setTooltipLock(!tooltipLock);
                }}
              >
                <circle cx="8" cy="8" r="6"></circle>
                <line x1="8" y1="11" x2="8" y2="8"></line>
                <line x1="8" y1="5" x2="8" y2="5"></line>
              </svg>
            </button>
            {showTooltip === key && (
              <div
                className="absolute bg-theme border-theme"
                style={
                  window.innerWidth < 600
                    ? {}
                    : { maxWidth: window.innerWidth / 4 }
                }
              >
                {data[key][2]}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pt-0.5">
        {Object.keys(data).map((key) => (
          <div key={key + "_input"} className="m-1 text-black">
            <input
              className="w-20 border-black border-2"
              type="number"
              max={data[key][1]}
              min={data[key][0]}
              value={formState[key]}
              onChange={(e) =>
                e.target.value <= data[key][1] &&
                e.target.value >= data[key][0] &&
                setFormState({ ...formState, [key]: Number(e.target.value) })
              }
            />
          </div>
        ))}
      </div>
      <div className="pt-0.5">
        {Object.keys(data).map((key) => (
          <div key={key + "_reset"} className="btn m-1 border-theme">
            <button
              className="btn px-1"
              onClick={() =>
                setFormState({ ...formState, [key]: initialFormState[key] })
              }
            >
              Reset
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Starlight = () => {
  const [model, setModel] = useState<tf.LayersModel | undefined>(undefined);
  const [stars, setStars] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramsObj = {};
  Array.from(searchParams.entries()).map(([key, value]) => {
    paramsObj[key] = Number(value);
  });
  const [formState, setFormState] = useState({
    ...initialFormState,
    ...paramsObj,
  });

  const max_generated_stars =
    paramsObj["max_generated_stars"] || initialFormState["max_generated_stars"];
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
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <ControlPanel
            data={data}
            formState={formState}
            setFormState={setFormState}
          />
          <button
            className="btn text-center w-full border-theme mt-2 p-2"
            onClick={() => {
              setSearchParams(
                createSearchParams(
                  Object.keys(formState).reduce((result, key) => {
                    if (formState[key] !== initialFormState[key]) {
                      result[key] = formState[key];
                    }
                    return result;
                  }, {}),
                ),
              );
              window.location.reload();
            }}
          >
            Apply Changes
          </button>
        </Modal>
      )}
      {infoModalOpen && (
        <Modal onClose={() => setInfoModalOpen(false)} className="text-xs">
          Welcome to Project Starlight! If you are curious about the code for
          this page, click the logo on the top left! I started this project
          because I was curious how viable it was to train a (pseudo)diffusion
          model that could perform inference (i.e. generate images) in the
          user's browser, without any server side assistance as basically all
          current web diffusion builds seem to be doing. As is to be expected, I
          had to make a lot of sacrifices with the quality of the model in order
          to get it to the point where it would not crash the user's browser,
          though much of the complexity comes from the fact that I wanted to
          generate not just one but several stars, and to have them twinkle as
          real stars do.
          <br />
          <br />
          So how does this actually work? Well, every time the model generates a
          star, it is actually generating a batch of different stars; I trained
          the model with downscaled resolution images of real stars for a
          relatively low number of epochs, and the model also did not have many
          trainable parameters, thus these stars just look very similar while
          retaining enough variance to apparently "twinkle" as each star is
          swapped out for the next at a high rate (you can essentially think of
          each star in the batch as a frame of a video or gif). The diffusion
          process makes it so that no generated star is the same, and I do some
          post processing to make the stars look better (e.g. swapping around
          RGB channels so that not all of the stars are the same color). The
          star is then placed at a random spot on the container div.
        </Modal>
      )}
      <div id="container" className="p-4 mt-4 text-center bg-black">
        {model &&
          [...Array(max_generated_stars)].map((_, i) => {
            return (
              <>
                {stars >= i && (
                  <Star
                    key={"star_" + i}
                    name={"star_" + i}
                    model={model}
                    onFinish={() => setStars(stars + 1)}
                    {...{ ...initialFormState, ...paramsObj }}
                  />
                )}
              </>
            );
          })}
      </div>
      <div className="flex w-full gap-4">
        <button
          onClick={() => setInfoModalOpen(true)}
          className="btn p-4 mt-4 w-full text-center border-theme"
        >
          What is this?
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="btn p-4 mt-4 w-full text-center border-theme"
        >
          Open Control Panel
        </button>
      </div>
    </>
  );
};

export default Starlight;

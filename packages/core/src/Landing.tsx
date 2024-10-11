import { Page } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import landingImage from "./assets/landing.jpg";
import aboutImage from "./assets/about.jpg";
import projectsImage from "./assets/projects.jpg";


const BgDiv = ({ children, image }) => (
  <div
    className="w-full h-full flex flex-wrap gap-4 p-4 items-center justify-center bg-center"
    style={{
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundImage: image ? `url(${image})` : "",
    }}
  >
    {children}
  </div>
);

const Text = ({ text }) => (
  <div className="p-4 border-theme bg-theme">
    <h2
      style={window.innerWidth < 600 ? {} : { maxWidth: window.innerWidth / 2 }}
    >
      {text}
    </h2>
  </div>
);

const Landing = () => {
  return (
    <Page className="p-0">
      <Router>
        <Routes>
          <Route
            path="/about"
            element={
              <BgDiv image={aboutImage}>
                <Text
                  text={
                    "As mentioned on the home page, the purpose of this site is to display a few of the cool projects that I have been working on. Now, a bit about me, but not much for privacy reasons: I am relatively young, I live in the US, and as you may have guessed based on this site, I consider myself to be a computer scientist first and foremost. With that being said, I am something of a lifelong learner and often find myself wearing multiple hats; recently, I have been dabbling in data science and economics."
                  }
                />
              </BgDiv>
            }
          />
          <Route
            path="/projects"
            element={
              <BgDiv image={projectsImage}>
                <a href="/starlight">
                  <button className="btn text-lg bg-theme border-theme p-4 mt-4">
                    Project Starlight
                    <span className="text-xs">
                      <br />
                      <br />
                      Now with mobile support (laggy
                      <br />
                      until all stars are generated)!
                    </span>
                  </button>
                </a>
              </BgDiv>
            }
          />
          <Route
            path="*"
            element={
              <BgDiv image={landingImage}>
                <Text
                  text={
                    "Hello and welcome to the latest deployment of my magnificent monorepo (click the icon on the top left to see the code)! The idea is for me to have some place to display the cool projects that I have been working on in order to broaden my horizons and gain some more programming experience. Of course, I do have a life, so this will tend to get updated sporadically. Special thanks to Github for providing me all the tools to deploy my own website for free and with minimal hassle!"
                  }
                />
              </BgDiv>
            }
          />
        </Routes>
      </Router>
    </Page>
  );
};

export default Landing;

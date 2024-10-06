import { Page } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

const Landing = () => {
  return (
    <Page>
      <div className="w-full h-full flex items-center justify-center">
        <Router>
          <Routes>
            <Route
              path="/about"
              element={
                <h2
                  style={
                    window.innerWidth < 600
                      ? {}
                      : { maxWidth: window.innerWidth / 2 }
                  }
                >
                  As mentioned on the home page, the purpose of this site is to
                  display a few of the cool projects that I have been working
                  on. Now, a bit about me, but not much for privacy reasons: I
                  am relatively young, I live in the US, and as you may have
                  guessed based on this site, I consider myself to be a computer
                  scientist first and foremost. With that being said, I am
                  something of a lifelong learner and often find myself wearing
                  multiple hats; recently, I have been dabbling in data science
                  and economics.
                </h2>
              }
            />
            <Route
              path="/projects"
              element={
                <>
                  <a href="/starlight">
                    <button className="btn text-lg border-theme p-4 mt-4">
                      Project Starlight
                      <span className="text-xs">
                        <br />
                        Now with mobile support!
                      </span>
                    </button>
                  </a>
                </>
              }
            />
            <Route
              path="*"
              element={
                <h2
                  style={
                    window.innerWidth < 600
                      ? {}
                      : { maxWidth: window.innerWidth / 2 }
                  }
                >
                  Hello and welcome to the latest deployment of my magnificent
                  monorepo (click the icon on the top left to see the code)! The
                  idea is for me to have some place to display the cool projects
                  that I have been working on in order to broaden my horizons
                  and gain some more programming experience. Of course, I do
                  have a life, so this will tend to get updated sporadically.
                  Special thanks to Github for providing me all the tools to
                  deploy my own website for free and with minimal hassle!
                </h2>
              }
            />
          </Routes>
        </Router>
      </div>
    </Page>
  );
};

export default Landing;

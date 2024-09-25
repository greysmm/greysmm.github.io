import { Page } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

const Landing = () => {
  return (
    <Page>
      <Router>
        <Routes>
          <Route path="/about" element={<h2>In progress...</h2>} />
          <Route
            path="/projects"
            element={
              <>
                <h2>This will look nicer later, but for now...</h2>
                <a href="/starlight/">
                  <button className="border-theme p-4 mt-4">
                    Project Starlight (beta)
                  </button>
                </a>
              </>
            }
          />
          <Route
            path="*"
            element={
              <h2>
                Welcome to my website! Not much here yet, though there is one
                project in the projects tab...
              </h2>
            }
          />
        </Routes>
      </Router>
    </Page>
  );
};

export default Landing;

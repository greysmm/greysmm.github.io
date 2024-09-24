import { Page } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

const Landing = () => {
  return (
    <Page>
      <Router>
        <Routes>
          <Route path="/about" element={<h2>In progress...</h2>} />
          <Route path="/projects" element={<h2>No projects yet :(</h2>} />
          <Route
            path="*"
            element={<h2>Welcome to my website! More to come later...</h2>}
          />
        </Routes>
      </Router>
    </Page>
  );
};

export default Landing;

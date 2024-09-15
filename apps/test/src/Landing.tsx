import { Page } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

const Landing = () => {
  return (
    <Page>
      <Router>
        <Routes>
          <Route
            path="*"
            element={<h2>test</h2>}
          />
        </Routes>
      </Router>
    </Page>
  );
};

export default Landing;

import { PageUnbounded } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Starlight from "./starlight";

const Landing = () => {
  return (
    <PageUnbounded linkAppend="/tree/main/packages/starlight">
      <Router>
        <Routes>
          <Route path="*" element={<Starlight />} />
        </Routes>
      </Router>
    </PageUnbounded>
  );
};

export default Landing;

import { PageUnbounded } from "@greysmm/shared";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LLM from "./evilai";

const Landing = () => {
  return (
    <PageUnbounded linkAppend="/tree/main/packages/evilai">
      <Router>
        <Routes>
          <Route path="*" element={<LLM />} />
        </Routes>
      </Router>
    </PageUnbounded>
  );
};

export default Landing;

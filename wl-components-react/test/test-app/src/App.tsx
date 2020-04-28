import { WlAppbar } from "@wilfredlopez/react";
import React from "react";
import ShowCase from "./components/ShowCase";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <WlAppbar
        translate
        color="primary"
        className="wl-justify-content-center wl-align-items-center"
      >
        <div className="wl-justify-content-center wl-align-items-center">
          <h1 className="wl-no-margin">@wilfredlopez/react</h1>
        </div>
      </WlAppbar>
      <ShowCase />
      <br />
      <br />
    </React.Fragment>
  );
};

export default App;

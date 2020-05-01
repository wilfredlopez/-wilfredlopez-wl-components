import React from "react";
import Router from "./Router";
import AppBar from "./AppBar";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <AppBar></AppBar>
      <Router />
    </React.Fragment>
  );
};

export default App;

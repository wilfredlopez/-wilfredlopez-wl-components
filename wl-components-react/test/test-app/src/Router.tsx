import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './pages/Home';
interface Props {}

const Router = (props: Props) => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Route to="/" component={Home} exact></Route>
      </BrowserRouter>
    </React.Fragment>
  );
};

export default Router;

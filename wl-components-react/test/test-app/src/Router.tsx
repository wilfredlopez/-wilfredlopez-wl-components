import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Spinners from './pages/Spinners';
import Buttons from './pages/Buttons';
interface Props {}

const Router = (props: Props) => {
  return (
    <React.Fragment>
      <BrowserRouter basename="/">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/spinners" component={Spinners} />
          <Route exact path="/buttons" component={Buttons} />
        </Switch>
      </BrowserRouter>
    </React.Fragment>
  );
};

export default Router;

import React from 'react';

import ShowCase from '../components/ShowCase';
interface Props {}

const Home = (props: Props) => {
  return (
    <React.Fragment>
      <ShowCase />
      <br />
      <br />
    </React.Fragment>
  );
};

export default Home;

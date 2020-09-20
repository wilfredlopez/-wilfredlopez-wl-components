import React, { ReactElement } from 'react';
import ButtonsShowcase from '../components/ButtonsShowcase';

interface Props {}

function Buttons(_: Props): ReactElement {
  return (
    <div>
      <ButtonsShowcase />
      <br />
      <br />
      <br />
    </div>
  );
}

export default Buttons;

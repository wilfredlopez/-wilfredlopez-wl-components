import React from 'react';
import { WlContainer, WlTooltip, WlLabel } from '@wilfredlopez/react';
import SpinnersShowCase from './SpinnersShowCase';
import ButtonsShowcase from './ButtonsShowcase';

interface Props {}

const ShowCase = (props: Props) => {
  return (
    <React.Fragment>
      <WlContainer translate>
        <SpinnersShowCase />
        <ButtonsShowcase />
        <div>
          <WlLabel translate>Tooltip</WlLabel>
          <p>
            Custom Tooltip Content shows on hover{' '}
            <WlTooltip translate message="Content Goes Here" /> and displays the
            message.
          </p>
        </div>
      </WlContainer>
    </React.Fragment>
  );
};

export default ShowCase;

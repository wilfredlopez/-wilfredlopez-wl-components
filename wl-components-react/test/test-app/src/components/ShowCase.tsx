import React from 'react';
import {
  WlContainer,
  WlTooltip,
  WlTitle,
  WlGrid,
  WlCol,
  WlRow,
  WlText,
  WlCard,
} from '@wilfredlopez/react';
import SpinnersShowCase from './SpinnersShowCase';
import ButtonsShowcase from './ButtonsShowcase';

interface Props {}

const ShowCase = (props: Props) => {
  return (
    <React.Fragment>
      <WlContainer translate>
        <SpinnersShowCase />
        <ButtonsShowcase />
        <WlGrid translate>
          <WlCol translate>
            <WlRow translate className="wl-justify-content-center">
              <div>
                <WlTitle translate className="wl-text-center">
                  Tooltip
                </WlTitle>
                <p>
                  <WlText translate size="1.8rem">
                    Custom Tooltip Content shows on hover{' '}
                    <WlTooltip
                      translate
                      message="Content Goes Here"
                      color="success"
                    />{' '}
                    and displays the message.
                  </WlText>
                </p>
              </div>
            </WlRow>
          </WlCol>
          <WlCol translate>
            <WlRow translate className="wl-justify-content-center">
              <WlTitle translate size="sm" component="h4">
                Card
              </WlTitle>
            </WlRow>
            <WlContainer size="md" translate>
              <WlRow translate className="wl-justify-content-center">
                <WlCard translate>
                  <div slot="header">
                    <h1
                      className="wl-no-padding wl-no-margin text-center"
                      style={{ width: '100%' }}
                    >
                      Card Header
                    </h1>
                  </div>
                  <div slot="content">Card Content</div>
                  <div>Slotted Content you.</div>
                </WlCard>
              </WlRow>
            </WlContainer>
          </WlCol>
        </WlGrid>
      </WlContainer>
    </React.Fragment>
  );
};

export default ShowCase;

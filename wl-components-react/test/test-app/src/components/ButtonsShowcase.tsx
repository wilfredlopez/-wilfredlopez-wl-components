import React from 'react';
import {
  WlContainer,
  WlGrid,
  WlRow,
  WlCol,
  WlTitle,
} from '@wilfredlopez/react';
import ButtonShowCase from './ButtonShowCase';

interface Props {}

const ButtonsShowcase = (props: Props) => {
  return (
    <WlContainer translate>
      <WlTitle
        size="sm"
        translate
        className="wl-text-center"
        style={{ width: '100%' }}
      >
        Buttons
      </WlTitle>
      <WlGrid translate>
        <WlRow translate>
          <WlCol translate>
            <WlContainer translate maxWidth="sm" size="sm">
              <h2 className="wl-text-center">Large</h2>
              <ButtonShowCase size="lg" />
            </WlContainer>
          </WlCol>
          <WlCol translate>
            <p className="wl-text-center">Variant Outline</p>
            <ButtonShowCase size="lg" variant="outline" />
          </WlCol>
        </WlRow>
        <WlRow translate>
          <WlCol translate>
            <WlTitle size="sm" translate className="wl-text-center">
              Variant Clear
            </WlTitle>
            <ButtonShowCase size="lg" variant="clear" />
          </WlCol>
        </WlRow>
        <WlRow translate>
          <WlCol translate>
            <WlContainer translate maxWidth="sm" size="sm">
              <h2 className="wl-text-center">Small</h2>
              <ButtonShowCase size="sm" />
            </WlContainer>
          </WlCol>
          <WlCol translate>
            <p className="wl-text-center">Variant Outline</p>

            <ButtonShowCase size="sm" variant="outline" />
          </WlCol>
        </WlRow>
      </WlGrid>
    </WlContainer>
  );
};

export default ButtonsShowcase;

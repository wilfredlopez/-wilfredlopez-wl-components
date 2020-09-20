import React from 'react';
import { WlGrid, WlRow, WlCol, WlButton } from '@wilfredlopez/react';

interface Props {
  size: 'lg' | 'sm' | 'xl';
  variant?: 'block' | 'outline' | 'solid' | 'clear' | 'full';
}

const ButtonShowCase = ({ size, variant = 'block' }: Props) => {
  return (
    <WlGrid translate>
      <WlRow translate>
        <WlCol translate sizeSm="6" offsetSm="3">
          <WlButton translate color="primary" variant={variant} size={size}>
            Primary
          </WlButton>
          <WlButton translate color="secondary" variant={variant} size={size}>
            Secondary
          </WlButton>
          <WlButton translate color="tertiary" variant={variant} size={size}>
            Tertiary
          </WlButton>
        </WlCol>
        <WlCol translate sizeSm="6" offsetSm="3">
          <WlButton translate color="dark" variant={variant} size={size}>
            Dark
          </WlButton>
          <WlButton translate color="light" variant={variant} size={size}>
            Light
          </WlButton>
          <WlButton translate color="medium" variant={variant} size={size}>
            Medium
          </WlButton>
        </WlCol>
        <WlCol translate sizeSm="6" offsetSm="3">
          <WlButton translate color="danger" variant={variant} size={size}>
            Danger
          </WlButton>
          <WlButton translate color="success" variant={variant} size={size}>
            Success
          </WlButton>
          <WlButton translate color="warning" variant={variant} size={size}>
            Warning
          </WlButton>
        </WlCol>
      </WlRow>
    </WlGrid>
  );
};

export default ButtonShowCase;

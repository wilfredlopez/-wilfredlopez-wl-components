## @wilfredlopez/react

These are React specific building blocks on top of [@wilfredlopez/wl-componets]

## Install

```bash
npm install @wilfredlopez/react
```

## Example Use

```jsx
import React from 'react';
import {
  WlGrid,
  WlRow,
  WlCol,
  WlButton,
  WlContainer,
} from '@wilfredlopez/react';
import '@wilfredlopez/wl-components/dist/collection/css/wl.bundle.css';

interface Props {
  size: 'lg' | 'sm' | 'xl';
  variant?: 'block' | 'outline' | 'solid' | 'clear' | 'full';
}

const ButtonShowCase = ({ size, variant = 'block' }: Props) => {
  return (
    <WlGrid>
      <WlRow>
        <WlCol sizeSm="6" offsetSm="3">
          <WlButton color="primary" variant={variant} size={size}>
            Primary
          </WlButton>
          <WlButton color="secondary" variant={variant} size={size}>
            Secondary
          </WlButton>
          <WlButton color="tertiary" variant={variant} size={size}>
            Tertiary
          </WlButton>
        </WlCol>
        <WlCol sizeSm="6" offsetSm="3">
          <WlButton color="dark" variant={variant} size={size}>
            Dark
          </WlButton>
          <WlButton color="light" variant={variant} size={size}>
            Light
          </WlButton>
          <WlButton color="medium" variant={variant} size={size}>
            Medium
          </WlButton>
        </WlCol>
        <WlCol sizeSm="6" offsetSm="3">
          <WlButton color="danger" variant={variant} size={size}>
            Danger
          </WlButton>
          <WlButton color="success" variant={variant} size={size}>
            Success
          </WlButton>
          <WlButton color="warning" variant={variant} size={size}>
            Warning
          </WlButton>
        </WlCol>
      </WlRow>
    </WlGrid>
  );
};
const App: React.FC = () => {
  return (
    <WlContainer>
      <h1 className="wl-text-center">Buttons</h1>

      <WlContainer maxWidth="sm" size="sm">
        <h2 className="wl-text-center">Large</h2>

        <ButtonShowCase size="lg" />
        <p className="wl-text-center">Variant Outline</p>
        <ButtonShowCase size="lg" variant="outline" />
        <p className="wl-text-center">Variant Clear</p>
        <ButtonShowCase size="lg" variant="clear" />
      </WlContainer>
      <WlContainer maxWidth="sm" size="sm">
        <h2 className="wl-text-center">Small</h2>
        <ButtonShowCase size="sm" />
        <p className="wl-text-center">Variant Outline</p>

        <ButtonShowCase size="sm" variant="outline" />
      </WlContainer>
    </WlContainer>
  );
};
```

## License

- [MIT]

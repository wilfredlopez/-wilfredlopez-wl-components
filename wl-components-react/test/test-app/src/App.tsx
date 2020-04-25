import {
  WlButton,
  WlContainer,
  WlGrid,
  WlCol,
  WlRow,
} from "@wilfredlopez/react";

import React from "react";

const App: React.FC = () => {
  return (
    <WlContainer translate>
      <WlGrid translate>
        <WlRow translate className="wl-text-center">
          <WlCol translate size="2">
            <div>
              <p>Col 1</p>
            </div>
          </WlCol>
          <WlCol translate size="2">
            <p>Col 2</p>
          </WlCol>
        </WlRow>
      </WlGrid>
      <h1 className="wl-text-center">HELLO</h1>

      <WlGrid translate>
        <WlRow translate>
          <WlCol translate sizeSm="6" offsetSm="3">
            <WlButton translate color="secondary" variant="block">
              KLK
            </WlButton>
          </WlCol>
        </WlRow>
      </WlGrid>
    </WlContainer>
  );
};

export default App;

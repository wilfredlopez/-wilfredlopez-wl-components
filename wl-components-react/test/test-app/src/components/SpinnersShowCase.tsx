import React from "react";
import { WlGrid, WlRow, WlCol, WlSpinner } from "@wilfredlopez/react";

interface Props {}

const SpinnersShowCase = (props: Props) => {
  return (
    <React.Fragment>
      <WlGrid translate>
        <WlRow translate>
          <WlCol translate>
            <h1 className="wl-text-center">Spinners</h1>
            <p>Available in all colors with custom sizes</p>
          </WlCol>
        </WlRow>
      </WlGrid>
      <WlGrid translate>
        <WlRow translate className="wl-text-center wl-justify-content-between">
          <WlCol translate size="2">
            <div>
              <p>Default Spinner</p>
              <WlSpinner
                size="50px"
                translate
                color="warning"
                style={{
                  width: 50,
                  height: 50,
                }}
              ></WlSpinner>
            </div>
          </WlCol>
          <WlCol translate size="2">
            <p>Facebook Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="facebook"
              color="tertiary"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ellipsis Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="ellipsis"
              color="secondary"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ios Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="ios"
              color="danger"
            ></WlSpinner>
          </WlCol>
        </WlRow>
        <WlRow translate className="wl-text-center wl-justify-content-between">
          <WlCol translate size="2">
            <div>
              <p>Default Spinner</p>
              <WlSpinner size="50px" translate color="success"></WlSpinner>
            </div>
          </WlCol>
          <WlCol translate size="2">
            <p>Loader Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="loader"
              color="primary"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ring Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="ring"
              color="success"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ripple Spinner</p>
            <WlSpinner
              size="50px"
              translate
              variant="ripple"
              color="danger"
            ></WlSpinner>
          </WlCol>
        </WlRow>
      </WlGrid>
    </React.Fragment>
  );
};

export default SpinnersShowCase;

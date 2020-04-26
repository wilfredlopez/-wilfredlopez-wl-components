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
            <p>Available in all colors</p>
          </WlCol>
        </WlRow>
      </WlGrid>
      <WlGrid translate>
        <WlRow translate className="wl-text-center wl-justify-content-between">
          <WlCol translate size="2">
            <div>
              <p>Default Spinner</p>
              <WlSpinner translate color="warning"></WlSpinner>
            </div>
          </WlCol>
          <WlCol translate size="2">
            <p>Facebook Spinner</p>
            <WlSpinner
              translate
              variant="facebook"
              color="tertiary"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ellipsis Spinner</p>
            <WlSpinner
              translate
              variant="ellipsis"
              color="secondary"
            ></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ios Spinner</p>
            <WlSpinner translate variant="ios" color="danger"></WlSpinner>
          </WlCol>
        </WlRow>
        <WlRow translate className="wl-text-center wl-justify-content-between">
          <WlCol translate size="2">
            <div>
              <p>Default Spinner</p>
              <WlSpinner translate color="success"></WlSpinner>
            </div>
          </WlCol>
          <WlCol translate size="2">
            <p>Loader Spinner</p>
            <WlSpinner translate variant="loader" color="primary"></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ring Spinner</p>
            <WlSpinner translate variant="ring" color="success"></WlSpinner>
          </WlCol>
          <WlCol translate size="2">
            <p>Ripple Spinner</p>
            <WlSpinner translate variant="ripple" color="danger"></WlSpinner>
          </WlCol>
        </WlRow>
      </WlGrid>
    </React.Fragment>
  );
};

export default SpinnersShowCase;

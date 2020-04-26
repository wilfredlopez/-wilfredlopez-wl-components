import React from "react";
import { WlContainer } from "@wilfredlopez/react";
import ButtonShowCase from "./ButtonShowCase";

interface Props {}

const ButtonsShowcase = (props: Props) => {
  return (
    <WlContainer translate>
      <h1 className="wl-text-center">Buttons</h1>

      <WlContainer translate maxWidth="sm" size="sm">
        <h2 className="wl-text-center">Large</h2>

        <ButtonShowCase size="lg" />
        <p className="wl-text-center">Variant Outline</p>
        <ButtonShowCase size="lg" variant="outline" />
        <p className="wl-text-center">Variant Clear</p>
        <ButtonShowCase size="lg" variant="clear" />
      </WlContainer>
      <WlContainer translate maxWidth="sm" size="sm">
        <h2 className="wl-text-center">Small</h2>
        <ButtonShowCase size="sm" />
        <p className="wl-text-center">Variant Outline</p>

        <ButtonShowCase size="sm" variant="outline" />
      </WlContainer>
    </WlContainer>
  );
};

export default ButtonsShowcase;

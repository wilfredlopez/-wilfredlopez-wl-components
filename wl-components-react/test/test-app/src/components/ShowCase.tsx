import React from "react";
import {WlContainer } from "@wilfredlopez/react";
import SpinnersShowCase from "./SpinnersShowCase";
import ButtonsShowcase from "./ButtonsShowcase";

interface Props {}

const ShowCase = (props: Props) => {
  return (
    <React.Fragment>
      <WlContainer translate>
        <SpinnersShowCase />
        <ButtonsShowcase />
      </WlContainer>
    </React.Fragment>
  );
};

export default ShowCase;

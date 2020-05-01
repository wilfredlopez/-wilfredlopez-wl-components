import React from "react";
import {
  WlAppbar,
  WlDrawer,
  WlDrawerMenuButton,
  WlDrawerCloseButton,
  WlDrawerHeader,
  WlDrawerBody,
  WlDrawerFooter,
  WlFlex,
  WlDrawerContent,
  WlText,
  WlItem,
} from "@wilfredlopez/react";
interface Props {}

const AppBar = (props: Props) => {
  return (
    <WlAppbar
      translate
      color="primary"
      className="wl-justify-content-center wl-align-items-center"
    >
      <WlDrawer placement="left" color="primary" translate>
        <WlDrawerMenuButton color="dark" slot="button-open" translate />
        <WlDrawerContent translate>
          <WlDrawerCloseButton translate variant="clear" color="primary" />
          <WlDrawerHeader translate>
            <WlText translate>Menu</WlText>
          </WlDrawerHeader>
          <WlDrawerBody translate>
            <WlItem
              color="dark"
              className="wl-margin-bottom wl-margin-top"
              translate
              href="/"
            >
              Home
            </WlItem>
            <WlItem
              color="dark"
              className="wl-margin-bottom"
              translate
              href="/"
            >
              Showcase
            </WlItem>
            <WlItem
              color="dark"
              className="wl-margin-bottom"
              translate
              href="/"
            >
              About{" "}
            </WlItem>
          </WlDrawerBody>
          <WlDrawerFooter translate fixed>
            <WlFlex translate>
              <div>
                <WlText translate>Follow Me @wilfreddonaldlo</WlText>
              </div>
            </WlFlex>
          </WlDrawerFooter>
        </WlDrawerContent>
      </WlDrawer>
      <div className="wl-justify-content-center wl-align-items-center">
        <h1 className="wl-no-margin">@wilfredlopez/react</h1>
      </div>
    </WlAppbar>
  );
};

export default AppBar;

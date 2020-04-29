import {
  WlAppbar,
  WlDrawer,
  WlDrawerMenuButton,
  WlDrawerContent,
  WlDrawerCloseButton,
  WlDrawerHeader,
  WlDrawerBody,
  WlDrawerFooter,
  WlFlex,
  WlButton,
} from "@wilfredlopez/react";
import React from "react";
import ShowCase from "./components/ShowCase";

const App: React.FC = () => {
  return (
    <React.Fragment>
      <WlAppbar
        translate
        color="primary"
        className="wl-justify-content-center wl-align-items-center"
      >
        <WlDrawer placement="left" color="primary" translate>
          <WlDrawerMenuButton color="dark" slot="button-open" translate />
          <WlDrawerContent translate>
            <WlDrawerCloseButton translate variant="clear" color="primary" />
            <WlDrawerHeader translate>Menu</WlDrawerHeader>
            <WlDrawerBody translate>
              <WlFlex
                translate
                size="12"
                style={{
                  display: "contents",
                }}
              >
                <WlButton className="wl-margin-bottom">Button 1</WlButton>
              </WlFlex>
              <WlFlex
                translate
                size="12"
                style={{
                  display: "contents",
                }}
              >
                <WlButton color="danger" className="wl-margin-bottom">
                  Button 1 Danger
                </WlButton>
              </WlFlex>
              <WlFlex translate>
                <WlButton>Button 2</WlButton>
                <WlButton color="success">Button 2 Success</WlButton>
              </WlFlex>
              <WlFlex translate>
                <WlButton>Button 3</WlButton>
                <WlButton color="secondary">Button 3 Secondary</WlButton>
              </WlFlex>
            </WlDrawerBody>
            <WlDrawerFooter translate fixed>
              <WlFlex translate>
                <div>Follow Me @wilfreddonaldlo</div>
              </WlFlex>
            </WlDrawerFooter>
          </WlDrawerContent>
        </WlDrawer>
        <div className="wl-justify-content-center wl-align-items-center">
          <h1 className="wl-no-margin">@wilfredlopez/react</h1>
        </div>
      </WlAppbar>
      <ShowCase />
      <br />
      <br />
    </React.Fragment>
  );
};

export default App;

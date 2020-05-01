import React, { useRef, useEffect } from "react";
import { WlApp, WlRouterElement, WlPage } from "@wilfredlopez/react";
import { WlReactRouter } from "../WlReactRouter";
import { render } from "@testing-library/react";
import { Route } from "react-router";
// import {Router} from '../Router';

describe("Router", () => {
  describe("on first page render", () => {
    let WlTestApp: React.ComponentType<any>;

    beforeEach(() => {
      WlTestApp = ({ Page }) => {
        return (
          <WlApp>
            <WlReactRouter>
              <WlRouterElement>
                <Route path="/" component={Page}></Route>
              </WlRouterElement>
            </WlReactRouter>
          </WlApp>
        );
      };
    });

    it("should be visible", () => {
      const MyPage = () => {
        return (
          <WlPage className="wl-page-invisible">
            <div>hello</div>
          </WlPage>
        );
      };

      const { container } = render(<WlTestApp Page={MyPage} />);
      const page = container.getElementsByClassName("wl-page")[0];
      expect(page).not.toHaveClass("wl-page-invisible");
      expect(page).toHaveStyle("z-index: 101");
    });

    it("should fire initial lifecycle events", () => {
      const wlViewWillEnterListener = jest.fn();
      const wlViewDidEnterListener = jest.fn();

      const MyPage = () => {
        const ref = useRef<HTMLDivElement>();

        useEffect(() => {
          ref.current.addEventListener(
            "wlViewWillEnter",
            wlViewWillEnterListener
          );
          ref.current.addEventListener(
            "wlViewDidEnter",
            wlViewDidEnterListener
          );
        }, []);

        return (
          <WlPage ref={ref}>
            <div>hello</div>
          </WlPage>
        );
      };

      render(<WlTestApp Page={MyPage} />);
      expect(wlViewWillEnterListener).toHaveBeenCalledTimes(1);
      expect(wlViewDidEnterListener).toHaveBeenCalledTimes(1);
    });
  });
});

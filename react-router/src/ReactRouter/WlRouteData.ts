import { RouteProps, match } from 'react-router-dom';

export interface WlRouteData {
  match: match | null;
  childProps: RouteProps;
}

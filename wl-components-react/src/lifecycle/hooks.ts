import { useContext, useEffect, useRef } from 'react';

import {
  WlLifeCycleContext,
  LifeCycleCallback,
} from '../contexts/WlLifeCycleContext';

export const useWlViewWillEnter = (
  callback: LifeCycleCallback,
  deps: any[] = []
) => {
  const context = useContext(WlLifeCycleContext);
  const id = useRef<number | undefined>();
  id.current = id.current || Math.floor(Math.random() * 1000000);
  useEffect(() => {
    callback.id = id.current!;
    context.onWlViewWillEnter(callback);
  }, deps);
};

export const useWlViewDidEnter = (
  callback: LifeCycleCallback,
  deps: any[] = []
) => {
  const context = useContext(WlLifeCycleContext);
  const id = useRef<number | undefined>();
  id.current = id.current || Math.floor(Math.random() * 1000000);
  useEffect(() => {
    callback.id = id.current!;
    context.onWlViewDidEnter(callback);
  }, deps);
};

export const useWlViewWillLeave = (
  callback: LifeCycleCallback,
  deps: any[] = []
) => {
  const context = useContext(WlLifeCycleContext);
  const id = useRef<number | undefined>();
  id.current = id.current || Math.floor(Math.random() * 1000000);
  useEffect(() => {
    callback.id = id.current!;
    context.onWlViewWillLeave(callback);
  }, deps);
};

export const useWlViewDidLeave = (
  callback: LifeCycleCallback,
  deps: any[] = []
) => {
  const context = useContext(WlLifeCycleContext);
  const id = useRef<number | undefined>();
  id.current = id.current || Math.floor(Math.random() * 1000000);
  useEffect(() => {
    callback.id = id.current!;
    context.onWlViewDidLeave(callback);
  }, deps);
};

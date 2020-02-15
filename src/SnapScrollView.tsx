import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  TouchEvent
} from "react";
import styled from "styled-components";

const transitionDuration = 300;

type Props = {
  items: React.ReactElement[];
  itemMarginPx: number;
  snapToAlignment?: "center";
  direction?: "horizontal" | "vertical";
  onSnap?({ focusedIndex }: { focusedIndex: number }): void;
};
type State = {
  isGrabbing: boolean;
  grabStartPoint: number;
  offset: number;
  lastInnerTranslate: number;
  baseTranslate: number;
  itemGroupElementSize: number;
  snapScrollViewElementSize: number;
  currentFocusedItemIndex: number;
  itemElementSizes: number[];
  scrollVelocity: number; // px/msec
  lastMovedAt: number;
};

export const SnapScrollView: React.FC<Props> = props => {
  const [state, setState] = useState<State>({
    isGrabbing: false,
    grabStartPoint: 0,
    offset: 0,
    lastInnerTranslate: 0,
    baseTranslate: 0,
    itemGroupElementSize: 0,
    snapScrollViewElementSize: 0,
    currentFocusedItemIndex: 0,
    itemElementSizes: [],
    scrollVelocity: 0,
    lastMovedAt: 0
  });

  const snapScrollViewRef = useRef<HTMLDivElement>(null);
  const itemGroupRef = useRef<HTMLDivElement>(null);

  const isVertical = useMemo(() => props.direction === "vertical", [
    props.direction
  ]);

  useEffect(() => {
    const clientSize = isVertical ? "clientHeight" : "clientWidth";

    const snapScrollViewElement = snapScrollViewRef.current;
    const snapScrollViewElementSize = snapScrollViewElement?.[clientSize] || 0;
    const itemGroupElement = itemGroupRef.current;
    const itemGroupElementSize = itemGroupElement?.[clientSize] || 0;
    const itemElements = Array.from(
      itemGroupElement?.getElementsByClassName("item") || []
    );
    const itemElementSizes = itemElements.map(
      itemElement => itemElement[clientSize] || 0
    );

    const baseTranslate = -itemGroupElementSize;
    const innerTranslate = getInnerTranslateWhenItemIsInCenter(
      props.items.length,
      {
        itemElementSizes,
        snapScrollViewElementSize,
        baseTranslate
      }
    );

    setState(_state => ({
      ..._state,
      itemGroupElementSize,
      snapScrollViewElementSize,
      itemElementSizes,
      lastInnerTranslate: innerTranslate,
      baseTranslate
    }));
  }, []);

  useEffect(() => {
    const { currentFocusedItemIndex } = getFocusedItemIndex(
      state.lastInnerTranslate
    );
    setState(_state => ({ ..._state, currentFocusedItemIndex }));
  }, [state.lastInnerTranslate]);

  // Returns translate when item with commonIndex is centered
  const getInnerTranslateWhenItemIsInCenter = useCallback(
    (
      itemCommonIndex: number,
      config: {
        itemElementSizes: State["itemElementSizes"];
        snapScrollViewElementSize: State["snapScrollViewElementSize"];
        baseTranslate: State["baseTranslate"];
      } = {
        itemElementSizes: state.itemElementSizes,
        snapScrollViewElementSize: state.snapScrollViewElementSize,
        baseTranslate: state.baseTranslate
      }
    ) => {
      let prevItemsWidth = 0;
      prevItemsWidth += props.itemMarginPx;
      for (let i = 0; i < itemCommonIndex; i++) {
        const targetItemIndex = i % props.items.length;
        prevItemsWidth += config.itemElementSizes[targetItemIndex];
        prevItemsWidth += props.itemMarginPx * 2;
      }
      prevItemsWidth +=
        config.itemElementSizes[itemCommonIndex % props.items.length] / 2;

      // This defines snapToAlignment
      const translate = -(
        prevItemsWidth -
        config.snapScrollViewElementSize / 2 +
        config.baseTranslate
      );
      return translate;
    },
    [
      props.items,
      props.itemMarginPx,
      state.itemElementSizes,
      state.snapScrollViewElementSize,
      state.baseTranslate
    ]
  );

  const snapTo = useCallback(
    async (commonIndex: number) => {
      const innerTranslate = getInnerTranslateWhenItemIsInCenter(commonIndex);
      if (innerTranslate === state.lastInnerTranslate && state.offset === 0) {
        return;
      }
      const { commonIndex: focusedItemCommonIndex } = getFocusedItemIndex(
        innerTranslate
      );
      const focusedItemItemGroupIndex = Math.floor(
        focusedItemCommonIndex / props.items.length
      );

      setState(_state => {
        const diff = 1 - focusedItemItemGroupIndex;
        const baseTranslate =
          focusedItemItemGroupIndex === 1
            ? _state.baseTranslate
            : _state.baseTranslate - diff * _state.itemGroupElementSize;
        return {
          ..._state,
          lastInnerTranslate: innerTranslate,
          offset: 0,
          isGrabbing: false,
          baseTranslate
        };
      });
    },
    [props.items, state.lastInnerTranslate, state.offset, state.baseTranslate]
  );

  const getFocusedItemIndex = useCallback(
    (translate: number) => {
      let hand = -state.snapScrollViewElementSize / 2 + state.baseTranslate;
      let currentFocusedItemIndex = 0;
      let commonIndex = 0;
      // `3000` は計算すれば必要十分な数字出るのでは？
      for (let i = 0; i < 3000; i++) {
        const targetItemIndex = i % props.items.length;
        const min = hand;
        const rangeWidth =
          state.itemElementSizes[targetItemIndex] + props.itemMarginPx * 2;
        const max = hand + rangeWidth;

        if (min <= -translate && -translate <= max) {
          currentFocusedItemIndex = targetItemIndex;
          commonIndex = i;
          break;
        }
        hand += rangeWidth;
      }
      return { currentFocusedItemIndex, commonIndex };
    },
    [
      props.items,
      props.itemMarginPx,
      state.snapScrollViewElementSize,
      state.itemElementSizes,
      state.baseTranslate
    ]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      if (state.isGrabbing) {
        const offset =
          state.grabStartPoint -
          event.changedTouches[0][isVertical ? "clientY" : "clientX"];

        let momentumDistance = 0;
        for (let i = 0; i < 300; i++) {
          momentumDistance += state.scrollVelocity * 0.98 ** i;
        }
        let translate = state.lastInnerTranslate - offset + momentumDistance;
        const { commonIndex, currentFocusedItemIndex } = getFocusedItemIndex(
          translate
        );
        snapTo(commonIndex);

        if (props.onSnap) {
          props.onSnap({ focusedIndex: currentFocusedItemIndex });
        }
      }
    },
    [state]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      let grabStartPoint = state.grabStartPoint;

      // grab start
      if (!state.isGrabbing) {
        grabStartPoint =
          event.changedTouches[0][isVertical ? "clientY" : "clientX"];
        setState(_state => ({
          ..._state,
          isGrabbing: true,
          grabStartPoint
        }));
      }

      const offset =
        grabStartPoint -
        event.changedTouches[0][isVertical ? "clientY" : "clientX"];
      const now = new Date().getTime();
      setState(_state => {
        const time = now - _state.lastMovedAt;
        const scrollVelocity = (_state.offset - offset) / time;
        return { ..._state, offset, scrollVelocity, lastMovedAt: now };
      });
    },
    [state.grabStartPoint, state.isGrabbing]
  );

  return (
    <StyledSnapScrollView
      ref={snapScrollViewRef}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      //   onMouseDown={handleMouseDown}
      //   onMouseUp={handleMouseUp}
      //   onMouseMove={handleMouseMove}
      isVertical={isVertical}
    >
      <div
        className="base"
        style={{
          transform: isVertical
            ? `translate3d(0px, ${state.baseTranslate}px, 0px)`
            : `translate3d(${state.baseTranslate}px, 0px, 0px)`
        }}
      >
        <div
          className="inner"
          style={{
            transform: isVertical
              ? `translate3d(0px, ${state.lastInnerTranslate -
                  state.offset}px, 0px)`
              : `translate3d(${state.lastInnerTranslate -
                  state.offset}px, 0px, 0px)`,
            transitionDuration: state.isGrabbing
              ? "0s"
              : `${transitionDuration}ms`
          }}
        >
          <div className="item-group" ref={itemGroupRef}>
            <Items
              items={props.items}
              itemMargin={
                isVertical
                  ? `${props.itemMarginPx}px 0`
                  : `0 ${props.itemMarginPx}px`
              }
              snapTo={snapTo}
              groupIndex={0}
            />
          </div>
          <div className="item-group">
            <Items
              items={props.items}
              itemMargin={
                isVertical
                  ? `${props.itemMarginPx}px 0`
                  : `0 ${props.itemMarginPx}px`
              }
              snapTo={snapTo}
              groupIndex={1}
            />
          </div>
          <div className="item-group">
            <Items
              items={props.items}
              itemMargin={
                isVertical
                  ? `${props.itemMarginPx}px 0`
                  : `0 ${props.itemMarginPx}px`
              }
              snapTo={snapTo}
              groupIndex={2}
            />
          </div>
        </div>
      </div>
    </StyledSnapScrollView>
  );
};
const StyledSnapScrollView = styled.div<{ isVertical: boolean }>`
  height: 100%;
  overflow: hidden;

  > .base {
    > .inner {
      height: 100%;
      display: flex;
      align-items: center;
      flex-direction: ${props => (props.isVertical ? "column" : "row")};

      > .item-group {
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: ${props => (props.isVertical ? "column" : "row")};
      }
    }
  }
`;

const Items: React.FC<{
  items: React.ReactElement[];
  itemMargin: string;
  snapTo(commonIndex: number): Promise<void>;
  groupIndex: number;
}> = props => {
  return (
    <>
      {props.items.map((item, index) => {
        const commonIndex = index + props.groupIndex * props.items.length;
        return (
          <div
            key={commonIndex}
            className="item"
            style={{ margin: props.itemMargin }}
            onClick={() => props.snapTo(commonIndex)}
          >
            {item}
          </div>
        );
      })}
    </>
  );
};

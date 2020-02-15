import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  TouchEvent
} from "react";
import styled from "styled-components";

const transitionDuration = 300;

type Props = {
  items: React.ReactElement[];
  itemMarginHorizontalPx: number;
  snapToAlignment: "center";
  onSnap({ focusedIndex }: { focusedIndex: number }): void;
};
type State = {
  isGrabbing: boolean;
  grabStartPointX: number;
  offset: number;
  lastInnerTranslateX: number;
  baseTranslateX: number;
  itemGroupElementWidth: number;
  snapScrollViewElementWidth: number;
  currentFocusedItemIndex: number;
  itemElementWidths: number[];
  scrollVelocity: number; // px/msec
  lastMovedAt: number;
};

export const SnapScrollView: React.FC<Props> = props => {
  const [state, setState] = useState<State>({
    isGrabbing: false,
    grabStartPointX: 0,
    offset: 0,
    lastInnerTranslateX: 0,
    baseTranslateX: 0,
    itemGroupElementWidth: 0,
    snapScrollViewElementWidth: 0,
    currentFocusedItemIndex: 0,
    itemElementWidths: [],
    scrollVelocity: 0,
    lastMovedAt: 0
  });

  const snapScrollViewRef = useRef<HTMLDivElement>(null);
  const itemGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const snapScrollViewElement = snapScrollViewRef.current;
    const snapScrollViewElementWidth = snapScrollViewElement?.clientWidth || 0;
    const itemGroupElement = itemGroupRef.current;
    const itemGroupElementWidth = itemGroupElement?.clientWidth || 0;
    const itemElements = Array.from(
      itemGroupElement?.getElementsByClassName("item") || []
    );
    const itemElementWidths = itemElements.map(
      itemElement => itemElement.clientWidth || 0
    );

    const baseTranslateX = -itemGroupElementWidth;
    const innerTranslateX = getInnerTranslateXWhenItemIsInCenter(
      props.items.length,
      {
        itemElementWidths,
        snapScrollViewElementWidth,
        baseTranslateX
      }
    );

    setState(_state => ({
      ..._state,
      itemGroupElementWidth,
      snapScrollViewElementWidth,
      itemElementWidths,
      lastInnerTranslateX: innerTranslateX,
      baseTranslateX
    }));
  }, []);

  useEffect(() => {
    const { currentFocusedItemIndex } = getFocusedItemIndex(
      state.lastInnerTranslateX
    );
    setState(_state => ({ ..._state, currentFocusedItemIndex }));
  }, [state.lastInnerTranslateX]);

  // Returns translateX when item with commonIndex is centered
  const getInnerTranslateXWhenItemIsInCenter = useCallback(
    (
      itemCommonIndex: number,
      config: {
        itemElementWidths: State["itemElementWidths"];
        snapScrollViewElementWidth: State["snapScrollViewElementWidth"];
        baseTranslateX: State["baseTranslateX"];
      } = {
        itemElementWidths: state.itemElementWidths,
        snapScrollViewElementWidth: state.snapScrollViewElementWidth,
        baseTranslateX: state.baseTranslateX
      }
    ) => {
      let prevItemsWidth = 0;
      prevItemsWidth += props.itemMarginHorizontalPx;
      for (let i = 0; i < itemCommonIndex; i++) {
        const targetItemIndex = i % props.items.length;
        prevItemsWidth += config.itemElementWidths[targetItemIndex];
        prevItemsWidth += props.itemMarginHorizontalPx * 2;
      }
      prevItemsWidth +=
        config.itemElementWidths[itemCommonIndex % props.items.length] / 2;

      // This defines snapToAlignment
      const translateX = -(
        prevItemsWidth -
        config.snapScrollViewElementWidth / 2 +
        config.baseTranslateX
      );
      return translateX;
    },
    [
      props.items,
      props.itemMarginHorizontalPx,
      state.itemElementWidths,
      state.snapScrollViewElementWidth,
      state.baseTranslateX
    ]
  );

  const snapTo = useCallback(
    async (commonIndex: number) => {
      const innerTranslateX = getInnerTranslateXWhenItemIsInCenter(commonIndex);
      if (innerTranslateX === state.lastInnerTranslateX && state.offset === 0) {
        return;
      }
      const { commonIndex: focusedItemCommonIndex } = getFocusedItemIndex(
        innerTranslateX
      );
      const focusedItemItemGroupIndex = Math.floor(
        focusedItemCommonIndex / props.items.length
      );

      setState(_state => {
        const diff = 1 - focusedItemItemGroupIndex;
        const baseTranslateX =
          focusedItemItemGroupIndex === 1
            ? _state.baseTranslateX
            : _state.baseTranslateX - diff * _state.itemGroupElementWidth;
        return {
          ..._state,
          lastInnerTranslateX: innerTranslateX,
          offset: 0,
          isGrabbing: false,
          baseTranslateX
        };
      });
    },
    [props.items, state.lastInnerTranslateX, state.offset, state.baseTranslateX]
  );

  const getFocusedItemIndex = useCallback(
    (translateX: number) => {
      let hand = -state.snapScrollViewElementWidth / 2 + state.baseTranslateX;
      let currentFocusedItemIndex = 0;
      let commonIndex = 0;
      // `3000` は計算すれば必要十分な数字出るのでは？
      for (let i = 0; i < 3000; i++) {
        const targetItemIndex = i % props.items.length;
        const min = hand;
        const rangeWidth =
          state.itemElementWidths[targetItemIndex] +
          props.itemMarginHorizontalPx * 2;
        const max = hand + rangeWidth;

        if (min <= -translateX && -translateX <= max) {
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
      props.itemMarginHorizontalPx,
      state.snapScrollViewElementWidth,
      state.itemElementWidths,
      state.baseTranslateX
    ]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      if (state.isGrabbing) {
        const offset = state.grabStartPointX - event.changedTouches[0].clientX;

        let momentumDistance = 0;
        for (let i = 0; i < 300; i++) {
          momentumDistance += state.scrollVelocity * 0.98 ** i;
        }
        let translateX = state.lastInnerTranslateX - offset + momentumDistance;
        const { commonIndex, currentFocusedItemIndex } = getFocusedItemIndex(
          translateX
        );
        snapTo(commonIndex);
        props.onSnap({ focusedIndex: currentFocusedItemIndex });
      }
    },
    [state]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      let grabStartPointX = state.grabStartPointX;

      // grab start
      if (!state.isGrabbing) {
        grabStartPointX = event.changedTouches[0].clientX;
        setState(_state => ({
          ..._state,
          isGrabbing: true,
          grabStartPointX
        }));
      }

      const offset = grabStartPointX - event.changedTouches[0].clientX;
      const now = new Date().getTime();
      setState(_state => {
        const time = now - _state.lastMovedAt;
        const scrollVelocity = (_state.offset - offset) / time;
        return { ..._state, offset, scrollVelocity, lastMovedAt: now };
      });
    },
    [state.grabStartPointX, state.isGrabbing]
  );

  return (
    <StyledSnapScrollView
      ref={snapScrollViewRef}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      //   onMouseDown={handleMouseDown}
      //   onMouseUp={handleMouseUp}
      //   onMouseMove={handleMouseMove}
    >
      <div
        className="base"
        style={{
          transform: `translate3d(${state.baseTranslateX}px, 0px, 0px)`
        }}
      >
        <div
          className="inner"
          style={{
            transform: `translate3d(${state.lastInnerTranslateX -
              state.offset}px, 0px, 0px)`,
            transitionDuration: state.isGrabbing
              ? "0s"
              : `${transitionDuration}ms`
          }}
        >
          <div className="item-group" ref={itemGroupRef}>
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              snapTo={snapTo}
              groupIndex={0}
            />
          </div>
          <div className="item-group">
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              snapTo={snapTo}
              groupIndex={1}
            />
          </div>
          <div className="item-group">
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              snapTo={snapTo}
              groupIndex={2}
            />
          </div>
        </div>
      </div>
    </StyledSnapScrollView>
  );
};
const StyledSnapScrollView = styled.div`
  overflow: hidden;

  > .base {
    > .inner {
      display: flex;
      align-items: center;
      height: 100%;

      > .item-group {
        display: flex;
        align-items: center;
        height: 100%;
      }
    }
  }
`;

const Items: React.FC<{
  items: React.ReactElement[];
  itemMarginHorizontalPx: number;
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
            style={{ margin: `0 ${props.itemMarginHorizontalPx}px` }}
            onClick={() => props.snapTo(commonIndex)}
          >
            {item}
          </div>
        );
      })}
    </>
  );
};

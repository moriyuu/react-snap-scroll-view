import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  TouchEvent
} from "react";
import styled from "styled-components";

const sleep = async (ms: number) => new Promise(res => setTimeout(res, ms));

const transitionDuration = 300;

type Props = {
  items: React.ReactElement[];
  itemMarginHorizontalPx: number;
  snapToAlignment: "center";
};
type State = {
  isGrabbing: boolean;
  scrollStartPointX: number;
  offset: number;
  lastTranslateX: number;
  initialTranslateX: number;
  itemsGroupElementWidth: number;
  scrollingContainerElementWidth: number;
  currentFocusedItemIndex: number;
  itemElementWidths: number[];
};

export const SnapScrollingContainer: React.FC<Props> = props => {
  const [state, setState] = useState<State>({
    isGrabbing: false,
    scrollStartPointX: 0,
    offset: 0,
    lastTranslateX: 0,
    initialTranslateX: 0,
    itemsGroupElementWidth: 0,
    scrollingContainerElementWidth: 0,
    currentFocusedItemIndex: 0,
    itemElementWidths: []
  });

  const scrollingContainerRef = useRef<HTMLDivElement>(null);
  const itemsGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollingContainerElement = scrollingContainerRef.current;
    const scrollingContainerElementWidth =
      scrollingContainerElement?.clientWidth || 0;
    const itemsGroupElement = itemsGroupRef.current;
    const itemsGroupElementWidth = itemsGroupElement?.clientWidth || 0;
    const itemElements = Array.from(
      itemsGroupElement?.getElementsByClassName("item") || []
    );
    const itemElementWidths = itemElements.map(
      itemElement => itemElement.clientWidth || 0
    );

    const translateX = getTranslateXWhenItemIsInCenter(props.items.length, {
      itemElementWidths,
      scrollingContainerElementWidth
    });

    setState(_state => ({
      ..._state,
      itemsGroupElementWidth,
      scrollingContainerElementWidth,
      itemElementWidths,
      lastTranslateX: translateX,
      initialTranslateX: translateX
    }));
  }, []);

  useEffect(() => {
    const { currentFocusedItemIndex } = getFocusedItemIndex(
      state.lastTranslateX
    );
    setState(_state => ({ ..._state, currentFocusedItemIndex }));
  }, [state.lastTranslateX]);

  // Returns translateX when item with commonIndex is centered
  const getTranslateXWhenItemIsInCenter = useCallback(
    (
      itemCommonIndex: number,
      config: {
        itemElementWidths: State["itemElementWidths"];
        scrollingContainerElementWidth: State["scrollingContainerElementWidth"];
      } = {
        itemElementWidths: state.itemElementWidths,
        scrollingContainerElementWidth: state.scrollingContainerElementWidth
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
        config.scrollingContainerElementWidth / 2
      );
      return translateX;
    },
    [
      props.items,
      props.itemMarginHorizontalPx,
      state.itemElementWidths,
      state.scrollingContainerElementWidth
    ]
  );

  const snapTo = useCallback(
    async (commonIndex: number) => {
      const translateX = getTranslateXWhenItemIsInCenter(commonIndex);
      if (translateX === state.lastTranslateX && state.offset === 0) return;
      setState(_state => ({
        ..._state,
        lastTranslateX: translateX,
        offset: 0,
        isGrabbing: false
      }));
      await sleep(transitionDuration);
      setState(_state => ({ ..._state, isGrabbing: true }));
      const lastTranslateX = jumpToCenterGroup(translateX);
      setState(_state => ({ ..._state, lastTranslateX }));
      await sleep(100);
      setState(_state => ({ ..._state, isGrabbing: false }));
    },
    [state.lastTranslateX, state.offset]
  );

  // Reset to center item group
  const jumpToCenterGroup = useCallback(
    (tmpLastTranslateX: number): number => {
      let lastTranslateX = tmpLastTranslateX;
      if (
        lastTranslateX <
        state.initialTranslateX - state.itemsGroupElementWidth
      ) {
        lastTranslateX = lastTranslateX + state.itemsGroupElementWidth;
      } else if (lastTranslateX >= -state.itemsGroupElementWidth) {
        lastTranslateX = lastTranslateX - state.itemsGroupElementWidth;
      }
      return lastTranslateX;
    },
    [state.initialTranslateX, state.itemsGroupElementWidth]
  );

  const getFocusedItemIndex = useCallback(
    (translateX: number) => {
      let hand = -state.scrollingContainerElementWidth / 2;
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
      state.scrollingContainerElementWidth,
      state.itemElementWidths
    ]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      if (state.isGrabbing) {
        const offset =
          state.scrollStartPointX - event.changedTouches[0].clientX;
        let translateX = state.lastTranslateX - offset;
        const { commonIndex } = getFocusedItemIndex(translateX);
        snapTo(commonIndex);
      }
    },
    [state]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.persist();

      let scrollStartPointX = state.scrollStartPointX;
      if (!state.isGrabbing) {
        scrollStartPointX = event.changedTouches[0].clientX;
        setState(_state => ({
          ..._state,
          isGrabbing: true,
          scrollStartPointX
        }));
      }

      const offset = scrollStartPointX - event.changedTouches[0].clientX;
      setState(_state => ({ ..._state, offset }));
    },
    [state.scrollStartPointX, state.isGrabbing]
  );

  return (
    <StyledSnapScrollingContainer
      ref={scrollingContainerRef}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      //   onMouseDown={handleMouseDown}
      //   onMouseUp={handleMouseUp}
      //   onMouseMove={handleMouseMove}
    >
      <div
        className="inner"
        style={{
          transform: `translate3d(${state.lastTranslateX -
            state.offset}px, 0px, 0px)`,
          transitionDuration: state.isGrabbing
            ? "0s"
            : `${transitionDuration}ms`
        }}
      >
        <div className="items-group" ref={itemsGroupRef}>
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
            snapTo={snapTo}
            groupIndex={0}
          />
        </div>
        <div className="items-group">
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
            snapTo={snapTo}
            groupIndex={1}
            // onClick={() => snapTo(8)}
          />
        </div>
        <div className="items-group">
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
            snapTo={snapTo}
            groupIndex={2}
          />
        </div>
      </div>
    </StyledSnapScrollingContainer>
  );
};
const StyledSnapScrollingContainer = styled.div`
  overflow: hidden;

  > .inner {
    display: flex;
    align-items: center;
    height: 100%;

    > .items-group {
      display: flex;
      align-items: center;
      height: 100%;
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

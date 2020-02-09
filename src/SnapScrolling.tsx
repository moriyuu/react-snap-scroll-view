import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  TouchEvent,
  MouseEvent
} from "react";
import styled from "styled-components";

type Option = {
  infinity: boolean;
  onSnap(): void;
};
type Methods = {
  snapTo(): void;
};

type Props = {
  items: React.ReactElement[];
  itemMarginHorizontalPx: number;
  snapToAlignment: "center";
};
type State = {
  idGrabbing: boolean;
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
    idGrabbing: false,
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

    const translateX = getTranslateXOnCentered(props.items.length, {
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
    const currentFocusedItemIndex = getCurrentFocusedItemIndex(
      state.lastTranslateX
    );
    setState(_state => ({
      ..._state,
      currentFocusedItemIndex
    }));
  }, [state.lastTranslateX]);

  // useEffect(() => {
  //   if (state.offset === 0) {
  //     setState(_state => ({
  //       ..._state,
  //       idGrabbing: false
  //     }));
  //   }
  // }, [state.offset]);

  // commonIndex の item が中央にくる場合の translateX を返す
  const getTranslateXOnCentered = (
    commonIndex: number,
    config: {
      itemElementWidths: State["itemElementWidths"];
      scrollingContainerElementWidth: State["scrollingContainerElementWidth"];
    } = {
      itemElementWidths: state.itemElementWidths,
      scrollingContainerElementWidth: state.scrollingContainerElementWidth
    }
  ) => {
    // TODO: 次 snapTo() method を作りたい

    let prevItemsWidth = 0;
    prevItemsWidth += props.itemMarginHorizontalPx;
    for (let i = 0; i < commonIndex; i++) {
      const targetItemIndex = i % props.items.length;
      prevItemsWidth += config.itemElementWidths[targetItemIndex];
      prevItemsWidth += props.itemMarginHorizontalPx * 2;
    }
    prevItemsWidth +=
      config.itemElementWidths[commonIndex % props.items.length] / 2;

    // This defines snapToAlignment
    const translateX = -(
      prevItemsWidth -
      config.scrollingContainerElementWidth / 2
    );
    return translateX;
  };

  const snapTo = (commonIndex: number) => {
    const translateX = getTranslateXOnCentered(commonIndex);
    setState(_state => ({ ..._state, lastTranslateX: translateX }));
    setTimeout(() => {
      const lastTranslateX = jumpToCenterGroup(translateX);
      setState(_state => ({ ..._state, lastTranslateX }));
    }, 300);
  };

  // Reset to center item group
  const jumpToCenterGroup = (tmpLastTranslateX: number): number => {
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
  };

  // ok
  const getCurrentFocusedItemIndex = (translateX: number) => {
    let hand = -state.scrollingContainerElementWidth / 2;
    let currentFocusedItemIndex = 0;
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
        break;
      }
      hand += rangeWidth;
    }
    return currentFocusedItemIndex;
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    setState(_state => ({
      ..._state,
      idGrabbing: true,
      scrollStartPointX: event.changedTouches[0].clientX
    }));
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    const offset = state.scrollStartPointX - event.changedTouches[0].clientX;
    let tmpLastTranslateX = state.lastTranslateX - offset;
    const lastTranslateX = jumpToCenterGroup(tmpLastTranslateX);

    setState(_state => ({
      ..._state,
      lastTranslateX,
      offset: 0
    }));

    setTimeout(() => {
      setState(_state => ({ ..._state, idGrabbing: false }));
    }, 100);
  };
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    const offset = state.scrollStartPointX - event.changedTouches[0].clientX;
    setState(_state => ({ ..._state, offset }));
  };

  return (
    <>
      <StyledSnapScrollingContainer
        ref={scrollingContainerRef}
        onTouchStart={handleTouchStart}
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
            transitionDuration: state.idGrabbing ? "0s" : "0.3s"
          }}
        >
          <div className="items-group" ref={itemsGroupRef}>
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              groupIndex={0}
            />
          </div>
          <div className="items-group">
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              groupIndex={1}
            />
          </div>
          <div className="items-group">
            <Items
              items={props.items}
              itemMarginHorizontalPx={props.itemMarginHorizontalPx}
              groupIndex={2}
            />
          </div>
        </div>
      </StyledSnapScrollingContainer>

      <button onClick={() => snapTo(0)}>0</button>
      <button onClick={() => snapTo(1)}>1</button>
      <button onClick={() => snapTo(2)}>2</button>
      <button onClick={() => snapTo(3)}>3</button>
      <button onClick={() => snapTo(8)}>8</button>
      <button onClick={() => snapTo(9)}>9</button>
      <button onClick={() => snapTo(10)}>10</button>
      <button onClick={() => snapTo(11)}>11</button>
    </>
  );
};
const StyledSnapScrollingContainer = styled.div`
  background-color: #eee;
  overflow: hidden;

  height: 160px;

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
  groupIndex: number;
}> = props => {
  return (
    <>
      {props.items.map((item, index) => (
        <div
          key={item.key}
          className="item"
          style={{ margin: `0 ${props.itemMarginHorizontalPx}px` }}
          onClick={() => {
            console.log("index", index + props.groupIndex * props.items.length);
          }}
        >
          <div>i: {index + props.groupIndex * props.items.length}</div>
          {item}
        </div>
      ))}
    </>
  );
};

//   const handleMouseDown = e => {
//   event.persist();
//     console.log("handleMouseDown");
//   };
//   const handleMouseUp = e => {
//   event.persist();
//     console.log("handleMouseUp");
//   };
//   const handleMouseMove = e => {
//   event.persist();
//     console.log("handleMouseMove");
//   };

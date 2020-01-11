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
};
type State = {
  scrollStartPointX: number;
  offset: number;
  lastTranslateX: number;
  initialTranslateX: number;
  itemsElementWidth: number;
};

export const SnapScrollingContainer: React.FC<Props> = props => {
  const [state, setState] = useState<State>({
    scrollStartPointX: 0,
    offset: 0,
    lastTranslateX: 0,
    initialTranslateX: 0,
    itemsElementWidth: 0
  });

  const scrollingContainerRef = useRef<HTMLDivElement>(null);
  const itemsWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollingContainerElement = scrollingContainerRef.current;
    const scrollingContainerElementWidth =
      scrollingContainerElement?.clientWidth || 0;
    const itemsElement = itemsWrapperRef.current;
    const itemsElementWidth = itemsElement?.clientWidth || 0;
    const itemElements = itemsElement?.getElementsByClassName("item");
    const firstItemElement = itemElements?.[0];
    const firstItemElementWidth = firstItemElement?.clientWidth || 0;

    const translateX = -(
      itemsElementWidth +
      props.itemMarginHorizontalPx +
      firstItemElementWidth / 2 -
      scrollingContainerElementWidth / 2
    );
    setState(_state => ({
      ..._state,
      itemsElementWidth,
      lastTranslateX: translateX,
      initialTranslateX: translateX
    }));
  }, []);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    // console.log("handleTouchStart", event.changedTouches[0].clientX);
    setState(_state => ({
      ..._state,
      scrollStartPointX: event.changedTouches[0].clientX
    }));
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    // console.log("handleTouchEnd");
    const offset = state.scrollStartPointX - event.changedTouches[0].clientX;
    let lastTranslateX = state.lastTranslateX - offset;

    // reset to center Items
    if (lastTranslateX < state.initialTranslateX - state.itemsElementWidth) {
      lastTranslateX = lastTranslateX + state.itemsElementWidth;
    } else if (lastTranslateX >= -state.itemsElementWidth) {
      lastTranslateX = lastTranslateX - state.itemsElementWidth;
    }

    setState(_state => ({ ..._state, lastTranslateX, offset: 0 }));
  };
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    event.persist();
    const offset = state.scrollStartPointX - event.changedTouches[0].clientX;
    setState(_state => ({ ..._state, offset }));
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

  return (
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
            state.offset}px, 0px, 0px)`
        }}
      >
        <div className="items-wrapper" ref={itemsWrapperRef}>
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
          />
        </div>
        <div className="items-wrapper">
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
          />
        </div>
        <div className="items-wrapper">
          <Items
            items={props.items}
            itemMarginHorizontalPx={props.itemMarginHorizontalPx}
          />
        </div>
      </div>
    </StyledSnapScrollingContainer>
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

    > .items-wrapper {
      display: flex;
      align-items: center;
      height: 100%;
    }
  }
`;

const Items: React.FC<{
  items: React.ReactElement[];
  itemMarginHorizontalPx: number;
}> = props => {
  return (
    <>
      {props.items.map(item => (
        <div
          key={item.key}
          className="item"
          style={{ margin: `0 ${props.itemMarginHorizontalPx}px` }}
        >
          {item}
        </div>
      ))}
    </>
  );
};

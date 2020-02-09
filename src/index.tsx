import React from "react";
import ReactDOM from "react-dom";

import { SnapScrollingContainer } from "./SnapScrolling";

const ScrollingItem: React.FC<{ style?: any }> = props => {
  return (
    <div
      style={{
        height: "140px",
        lineHeight: "140px",
        width: "140px",
        minWidth: "140px",
        backgroundColor: "#cacaca",
        textAlign: "center",
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
};

const App = () => {
  return (
    <>
      <h1>react-snap-scrolling</h1>
      <SnapScrollingContainer
        items={[
          <ScrollingItem key={0}>0</ScrollingItem>,
          <ScrollingItem key={1}>1</ScrollingItem>,
          <ScrollingItem key={2} style={{ width: "200px" }}>
            2
          </ScrollingItem>,
          <ScrollingItem key={3}>3</ScrollingItem>
        ]}
        itemMarginHorizontalPx={16}
        snapToAlignment="center"
      />
    </>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));

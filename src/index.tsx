import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import iNoBounce from "inobounce";

import { SnapScrollView } from "./SnapScrollView";

const Item: React.FC<{ style?: any }> = props => {
  return (
    <div
      style={{
        height: "80px",
        lineHeight: "80px",
        width: "80px",
        backgroundColor: "#cfcfcf",
        textAlign: "center",
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
};

const App = () => {
  useEffect(() => {
    iNoBounce.enable();
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Noto Serif', serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "100vh"
      }}
    >
      <h1 style={{ marginTop: "-120px" }}>react-snap-scroll-view</h1>
      <a href="https://github.com/moriyuu/react-snap-scroll-view">
        moriyuu/react-snap-scroll-view
      </a>
      <div
        style={{
          backgroundColor: "#efefef",
          padding: "16px 0",
          position: "absolute",
          bottom: "16px",
          width: "100vw"
        }}
      >
        <SnapScrollView
          items={[
            <Item>0</Item>,
            <Item>1</Item>,
            <Item style={{ width: "120px" }}>2</Item>,
            <Item>3</Item>,
            <Item style={{ width: "100px" }}>4</Item>,
            <Item style={{ width: "40px" }}>5</Item>,
            <Item>6</Item>
          ]}
          itemMarginHorizontalPx={16}
          snapToAlignment="center"
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));

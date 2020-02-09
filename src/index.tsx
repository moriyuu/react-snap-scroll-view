import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import iNoBounce from "inobounce";

import { SnapScrollView } from "./SnapScrollView";

const Item: React.FC<{ color: string; style?: any }> = props => {
  return (
    <div
      style={{
        height: "80px",
        lineHeight: "80px",
        width: "80px",
        backgroundColor: props.color || "#cfcfcf",
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
        height: "100vh",
        backgroundColor: "#eee"
      }}
    >
      <h1 style={{ marginTop: "-120px" }}>react-snap-scroll-view</h1>
      <a href="https://github.com/moriyuu/react-snap-scroll-view">
        moriyuu/react-snap-scroll-view
      </a>
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "16px 0",
          position: "absolute",
          // bottom: "16px",
          bottom: 0,
          width: "100vw"
        }}
      >
        <SnapScrollView
          items={[
            <Item color="#B04349" />,
            <Item color="#E9662F" />,
            <Item color="#FD951F" style={{ width: "120px" }} />,
            <Item color="#8193B6" />,
            <Item color="#003366" style={{ width: "100px" }} />,
            <Item color="#FFF6ED" style={{ width: "40px" }} />,
            <Item color="#00D7B6" />,
            <Item color="#F15869" />
          ]}
          itemMarginHorizontalPx={16}
          snapToAlignment="center"
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));

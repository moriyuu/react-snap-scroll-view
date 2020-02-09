import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import iNoBounce from "inobounce";

import { SnapScrollView } from "./SnapScrollView";

const items: {
  color: string;
  width: string;
}[] = [
  { color: "#B04349", width: "80px" },
  { color: "#E9662F", width: "80px" },
  { color: "#FD951F", width: "80px" },
  { color: "#8193B6", width: "80px" },
  { color: "#003366", width: "80px" },
  { color: "#FFF6ED", width: "80px" },
  { color: "#00D7B6", width: "80px" },
  { color: "#F15869", width: "80px" }
];

const Item: React.FC<{ style?: Object }> = props => {
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
        height: "100vh",
        backgroundColor: "#eee"
      }}
    >
      <h1 style={{ marginTop: "-120px", letterSpacing: "0.001em" }}>
        react-snap-scroll-view
      </h1>
      <a href="https://github.com/moriyuu/react-snap-scroll-view">
        moriyuu/react-snap-scroll-view
      </a>
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "16px 0",
          position: "absolute",
          bottom: 0,
          width: "100vw"
        }}
      >
        <SnapScrollView
          items={items.map(item => (
            <Item style={{ backgroundColor: item.color, width: item.width }} />
          ))}
          itemMarginHorizontalPx={16}
          snapToAlignment="center"
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));

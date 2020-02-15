import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import iNoBounce from "inobounce";

import { SnapScrollView } from "./SnapScrollView";

const items: {
  color: string;
  width: string;
}[] = [
  { color: "#B04349", width: "80px" },
  { color: "#E9662F", width: "120px" },
  { color: "#FD951F", width: "80px" },
  { color: "#8193B6", width: "120px" },
  { color: "#003366", width: "80px" },
  { color: "#FFF6ED", width: "100px" },
  { color: "#00D7B6", width: "180px" },
  { color: "#F15869", width: "100px" }
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
        color: "#222",
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
};

const App1 = () => {
  useEffect(() => {
    iNoBounce.enable();
  }, []);

  const [focusedIndex, setFocusedIndex] = useState(1);

  const onSnap = ({ focusedIndex }: { focusedIndex: number }) => {
    setFocusedIndex(focusedIndex);
  };

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
          position: "absolute",
          bottom: 0,
          width: "100vw"
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "16px"
          }}
        >
          Focused: {focusedIndex}
        </div>
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "16px 0"
          }}
        >
          <SnapScrollView
            items={items.map((item, index) => (
              <Item style={{ backgroundColor: item.color, width: item.width }}>
                {index}
              </Item>
            ))}
            itemMarginPx={16}
            snapToAlignment="center"
            onSnap={onSnap}
          />
        </div>
      </div>
    </div>
  );
};

const hours = Array(24)
  .fill(0)
  .map((_, i) => i);
const minutes = Array(60)
  .fill(0)
  .map((_, i) => i);

const App2 = () => {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  return (
    <div
      style={{
        fontFamily: "SF Pro Display, sans-serif",
        boxSizing: "border-box",
        height: "100vh",
        backgroundColor: "#1C1C1E",
        paddingTop: "56px"
      }}
    >
      <div
        style={{
          backgroundColor: "#1C1C1E",
          color: "#D1D1D3",
          fontSize: "18px",
          height: "224px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          padding: "16px 0",
          borderTop: "4px solid #2C2C2E",
          borderBottom: "4px solid #2C2C2E",
          position: "relative"
        }}
      >
        <div style={{ width: "60px" }}>
          <SnapScrollView
            items={hours.map(hour => (
              <div>{hour}</div>
            ))}
            itemMarginPx={8}
            direction="vertical"
            onSnap={({ focusedIndex }) => setHour(hours[focusedIndex])}
          />
        </div>
        <div style={{ width: "60px" }}>
          <SnapScrollView
            items={minutes.map(minute => (
              <div>
                {minute.toString().length === 2 ? minute : `0${minute}`}
              </div>
            ))}
            itemMarginPx={8}
            direction="vertical"
            onSnap={({ focusedIndex }) => setMinute(minutes[focusedIndex])}
          />
        </div>
        <div
          style={{
            height: "1px",
            width: "100%",
            backgroundColor: "#49494B",
            position: "absolute",
            top: 0,
            bottom: 0,
            margin: "auto",
            transform: "translateY(-18px)"
          }}
        />
        <div
          style={{
            height: "1px",
            width: "100%",
            backgroundColor: "#49494B",
            position: "absolute",
            top: 0,
            bottom: 0,
            margin: "auto",
            transform: "translateY(18px)"
          }}
        />
      </div>

      <div
        style={{
          color: "#fff",
          textAlign: "center",
          marginTop: "16px",
          fontSize: "14px"
        }}
      >
        Selected:{" "}
        {`${hour}:${minute.toString().length === 2 ? minute : `0${minute}`}`}
      </div>

      <div style={{ color: "#fff", textAlign: "center", marginTop: "12vh" }}>
        <h1 style={{ letterSpacing: "0.001em" }}>react-snap-scroll-view</h1>
        <a
          href="https://github.com/moriyuu/react-snap-scroll-view"
          style={{ color: "#FE9E13" }}
        >
          moriyuu/react-snap-scroll-view
        </a>
      </div>
    </div>
  );
};

ReactDOM.render(<App2 />, document.querySelector("#root"));

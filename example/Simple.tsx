import React, { useState } from "react";
import { Link } from "react-router-dom";

import { SnapScrollView } from "../src/SnapScrollView";

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

export const Simple = () => {
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
          color: "#888",
          fontSize: "14px",
          marginTop: "8px"
        }}
      >
        Another Example:{" "}
        <Link to="/examples/time-picker" style={{ color: "#888" }}>
          Time Picker
        </Link>
      </div>

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

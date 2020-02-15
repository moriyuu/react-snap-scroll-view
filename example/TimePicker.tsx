import React, { useState } from "react";
import { Link } from "react-router-dom";

import { SnapScrollView } from "../src/SnapScrollView";

const hours = Array(24)
  .fill(0)
  .map((_, i) => i);
const minutes = Array(60)
  .fill(0)
  .map((_, i) => i);

export const TimePicker = () => {
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
        <div
          style={{
            color: "#888",
            fontSize: "14px",
            marginTop: "8px"
          }}
        >
          Another Example:{" "}
          <Link to="/examples/simple" style={{ color: "#888" }}>
            Simple
          </Link>
        </div>
      </div>
    </div>
  );
};

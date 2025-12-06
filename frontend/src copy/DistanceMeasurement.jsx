import React, { useState, useEffect } from "react";
import { Line, Text, Html } from "@react-three/drei";
import { Vector3 } from "three";
import { useRecoilValue } from "recoil";
import { MEASUREMENT_POINTS_ATOM } from "./atom";

function DistanceMeasurement() {

  const points = useRecoilValue(MEASUREMENT_POINTS_ATOM);



  if (points.length < 2) return null; // If fewer than 2 points, do nothing



  return (
    <>
      {points.map((pointData, index) => {
        if (index < points.length - 1) {
          const pointA = new Vector3(pointData.point.x, pointData.point.y, pointData.point.z);
          const pointB = new Vector3(points[index + 1].point.x, points[index + 1].point.y, points[index + 1].point.z);

          const distance = pointA.distanceTo(pointB) * 1000; // Convert to mm

          return (
            <React.Fragment key={index}>
              {/* Render Line Between Points */}
              <Line
                points={[pointA, pointB]} // Start and end points
                color="blue" // Line color
                lineWidth={5} // Thicker line to ensure visibility
                dashed={false} // Enable dashed line if needed
              />

              {/* Render Distance Label for each pair using Html component */}
              <Html position={new Vector3((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2, (pointA.z + pointB.z) / 2)}>
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "white",
                    padding: "5px",
                    borderRadius: "5px",
                    fontSize: `12px`, // Responsive font size
                    fontFamily: "Arial, sans-serif",
                    width: "100px"
                  }}
                >
                  {distance.toFixed(2)} mm
                </div>
              </Html>
            </React.Fragment>
          );
        }
        return null;
      })}
    </>
  );
}

export default DistanceMeasurement;

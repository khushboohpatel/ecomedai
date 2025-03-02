"use client";

import React from 'react';
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { LineChart } from "@mui/x-charts/LineChart";
import Link from "next/link";
import "./dashboard.css";

export default function Home() {
  return (
    <div className="dashboard customContainer">
      <div className="dashCardsTop">
        <div className="dashCards">
          <h3>Carbon Footprint</h3>
          <h2>15%</h2>
          <p>Decreased compared to last week</p>
          <Link href="#">
            Carbon footprint report{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="15"
              viewBox="0 0 14 15"
              fill="none"
            >
              <path d="M2.91699 7.11153H11.0837H2.91699Z" fill="#017B36" />
              <path
                d="M8.75033 9.44487L11.0837 7.11153L8.75033 9.44487Z"
                fill="#017B36"
              />
              <path
                d="M8.75033 4.7782L11.0837 7.11153L8.75033 4.7782Z"
                fill="#017B36"
              />
              <path
                d="M2.91699 7.11153H11.0837M11.0837 7.11153L8.75033 9.44487M11.0837 7.11153L8.75033 4.7782"
                stroke="#017B36"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="dashCards gaugeCard">
          <h3>Eco Products Used</h3>
          <Gauge
            value={75}
            startAngle={-110}
            endAngle={110}
            className="dashGauge"
            sx={{
              [`& .${gaugeClasses.valueText}`]: {
                fontSize: 40,
                transform: "translate(0px, 0px)",
              },
            }}
            text={({ value, valueMax }) => `${value}`}
          />
          <Link href="#">
            See Products{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="15"
              viewBox="0 0 14 15"
              fill="none"
            >
              <path d="M2.91699 7.11153H11.0837H2.91699Z" fill="#017B36" />
              <path
                d="M8.75033 9.44487L11.0837 7.11153L8.75033 9.44487Z"
                fill="#017B36"
              />
              <path
                d="M8.75033 4.7782L11.0837 7.11153L8.75033 4.7782Z"
                fill="#017B36"
              />
              <path
                d="M2.91699 7.11153H11.0837M11.0837 7.11153L8.75033 9.44487M11.0837 7.11153L8.75033 4.7782"
                stroke="#017B36"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="dashCards">
          <h3>Impact Badges</h3>
          <p>Something needs to be written here</p>
          <div className="impactBadges">
            <img src="/assets/images/badge1.png" alt="badge1" />
            <img src="/assets/images/badge2.png" alt="badge2" />
            <img src="/assets/images/badge3.png" alt="badge3" />
          </div>
        </div>
      </div>
      <div className="dashCardsBottom">
        <div className="dashCards">
          <h3>Other departments reducing waste</h3>
          <ul>
            <li>
              <img src="" alt="Department 1 logo" /> Department 1
            </li>
            <li>
              <img src="" alt="Department 2 logo" /> Department 2
            </li>
            <li>
              <img src="" alt="Department 3 logo" /> Department 3
            </li>
            <li>
              <img src="" alt="Department 4 logo" /> Department 4
            </li>
            <li>
              <img src="" alt="Department 5 logo" /> Department
            </li>
          </ul>
        </div>
        <div className="dashCards lineCard">
          <h3>Cost Saved</h3>
          <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
                area: true,
                color: {
                  type: "linear",
                  x1: 0,
                  y1: 0,
                  x2: 1,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "#02d5d1" },
                    { offset: 1, color: "#017B36" },
                  ],
                },
              },
            ]}
            width={500}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

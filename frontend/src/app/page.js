"use client";

import React, { useRef, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import Link from "next/link";
import "./dashboard.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell, Text } from "recharts";

const RechartsGradientChart = (props) => {
  return (
    <div className="dashCards lineCard">
      <h3>{props.title}</h3>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <AreaChart
            data={props.data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#25CD25" stopOpacity={0.4} />
                <stop offset="99.59%" stopColor="#25CD25" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#25CD25"
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RechartsGauge = ({
  value = 75,
  min = 0,
  max = 100,
  startAngle = 360,
  endAngle = 0,
}) => {
  const percentage = Math.min(Math.max(value, min), max);

  const data = [
    { name: "value", value: percentage },
    { name: "empty", value: max - percentage },
  ];

  const renderCustomizedLabel = ({ cx, cy }) => {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="40"
        fill="#000"
      >
        {value}
      </text>
    );
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius="60%"
            outerRadius="80%"
            cornerRadius={5}
            paddingAngle={0}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            <Cell key="filled" fill="#25CD25" />
            <Cell key="empty" fill="#e0e0e0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

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
          <RechartsGauge value={75} />
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
              <img src="/assets/images/building.png" alt="Emergency Department (ED) logo" />{" "}
              Emergency Department (ED)
            </li>
            <li>
              <img src="/assets/images/building.png" alt="Intensive Care Unit (ICU) logo" />{" "}
              Intensive Care Unit (ICU)
            </li>
            <li>
              <img src="/assets/images/building.png" alt="Radiology logo" />{" "}
              Radiology
            </li>
            <li>
              <img src="/assets/images/building.png" alt="Surgery Department logo" />{" "}
              Surgery Department
            </li>
            <li>
              <img src="/assets/images/building.png" alt="Pediatrics logo" />{" "}
              Pediatrics Department
            </li>
          </ul>
        </div>
        <div>
          <RechartsGradientChart
            title="Cost Saved"
            data={[
              { name: "2020", value: 2 },
              { name: "2021", value: 5.5 },
              { name: "2022", value: 2 },
              { name: "2023", value: 8.5 },
              { name: "2024", value: 1.5 },
              { name: "2025", value: 5 },
            ]}
          />
          <RechartsGradientChart
            title="Carbon Reduced"
            data={[
              { name: "2020", value: 10 },
              { name: "2021", value: 85 },
              { name: "2022", value: 100 },
              { name: "2023", value: 150 },
              { name: "2024", value: 175 },
              { name: "2025", value: 205 },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

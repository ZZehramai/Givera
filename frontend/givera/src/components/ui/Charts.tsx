

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { MetricPoint } from "../data/mockData";

export function BarChart({ data, unit = "", max }: {data: MetricPoint[];unit?: string;max?: number;}) {
  const shouldReduceMotion = useReducedMotion();
  const ceiling = max ?? Math.max(...data.map((d) => d.value)) * 1.15;
  return (
    <div className="flex h-44 items-end gap-3" role="img" aria-label="Bar chart">
      {data.map((point) => {
        const height = Math.max(4, point.value / ceiling * 100);
        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <motion.div
                className="w-full rounded-t bg-[#16734e]"
                initial={shouldReduceMotion ? false : { height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }} />
              
            </div>
            <span className="text-[11px] font-medium text-[#83877f]">{point.label}</span>
            <span className="text-[11px] font-semibold text-[#1d2522]">{point.value}{unit}</span>
          </div>);

      })}
    </div>);

}

export function LineChart({ data, unit = "%" }: {data: MetricPoint[];unit?: string;}) {
  const shouldReduceMotion = useReducedMotion();
  const values = data.map((d) => d.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const width = 100;
  const height = 100;
  const points = data.map((d, i) => {
    const x = i / (data.length - 1) * width;
    const y = height - (d.value - min) / (max - min) * height;
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label="Trend line chart">
        <motion.path
          d={path}
          fill="none"
          stroke="#16734e"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
        
        {points.map((p) =>
        <circle key={p.label} cx={p.x} cy={p.y} r={1.6} fill="#16734e" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-[#83877f]">
        {data.map((d) =>
        <span key={d.label}>{d.label}</span>
        )}
      </div>
      <p className="mt-1 text-[11px] text-[#888b84]">Range {min + 1}{unit}–{max - 1}{unit}</p>
    </div>);

}

const donutColors = ["#16734e", "#4f9e7d", "#a9d5c2"];

export function DonutChart({ data }: {data: MetricPoint[];}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90" role="img" aria-label="Allocation breakdown">
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const offset = cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={d.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={donutColors[i % donutColors.length]}
              strokeWidth={12}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset} />);


        })}
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) =>
        <li key={d.label} className="flex items-center gap-2 text-[13px]">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: donutColors[i % donutColors.length] }} aria-hidden="true" />
            <span className="text-[#5f655e]">{d.label}</span>
            <span className="font-semibold text-[#1d2522]">{d.value}%</span>
          </li>
        )}
      </ul>
    </div>);

}
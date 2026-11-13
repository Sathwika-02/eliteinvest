"use client";

import { useEffect, useState } from "react";
import { getScoreLabel, getScoreHex } from "@/lib/mock-data";

interface AciGaugeProps {
  value: number;
  size?: number;
  label?: string;
}

export function AciGauge({ value, size = 220, label = "ACI" }: AciGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const center = size / 2;
  const radius = (size - 30) / 2;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  // Convert value (0-100) to angle
  const valueAngle = startAngle + (animatedValue / 100) * totalAngle;

  // Helper to get point on arc
  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  }

  // Create arc path
  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArcFlag = end - start <= 180 ? 0 : 1;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${e.x} ${e.y}`;
  }

  // Needle position
  const needleEnd = polarToCartesian(valueAngle);
  const needleLength = radius - 15;

  const needleRad = ((valueAngle - 90) * Math.PI) / 180;
  const nx = center + needleLength * Math.cos(needleRad);
  const ny = center + needleLength * Math.sin(needleRad);

  const scoreColor = getScoreHex(value);
  const scoreLabel = getScoreLabel(value);

  // Generate tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size * 0.72}
        viewBox={`0 0 ${size} ${size * 0.72}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          strokeLinecap="round"
          className="text-muted"
        />

        {/* Score zone segments */}
        <path
          d={describeArc(startAngle, startAngle + totalAngle * 0.3)}
          fill="none"
          stroke="#ef4444"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.3}
        />
        <path
          d={describeArc(
            startAngle + totalAngle * 0.3,
            startAngle + totalAngle * 0.5,
          )}
          fill="none"
          stroke="#f97316"
          strokeWidth={12}
          opacity={0.3}
        />
        <path
          d={describeArc(
            startAngle + totalAngle * 0.5,
            startAngle + totalAngle * 0.7,
          )}
          fill="none"
          stroke="#eab308"
          strokeWidth={12}
          opacity={0.3}
        />
        <path
          d={describeArc(
            startAngle + totalAngle * 0.7,
            startAngle + totalAngle * 0.85,
          )}
          fill="none"
          stroke="#22c55e"
          strokeWidth={12}
          opacity={0.3}
        />
        <path
          d={describeArc(startAngle + totalAngle * 0.85, endAngle)}
          fill="none"
          stroke="#16a34a"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.3}
        />

        {/* Active value arc */}
        <path
          d={describeArc(startAngle, valueAngle)}
          fill="none"
          stroke={scoreColor}
          strokeWidth={14}
          strokeLinecap="round"
          style={{
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Tick marks & labels */}
        {ticks.map((tick) => {
          const angle = startAngle + (tick / 100) * totalAngle;
          const outerPoint = polarToCartesian(angle);
          const innerRad = ((angle - 90) * Math.PI) / 180;
          const innerX = center + (radius - 20) * Math.cos(innerRad);
          const innerY = center + (radius - 20) * Math.sin(innerRad);
          const labelX = center + (radius + 16) * Math.cos(innerRad);
          const labelY = center + (radius + 16) * Math.sin(innerRad);
          return (
            <g key={tick}>
              <line
                x1={innerX}
                y1={innerY}
                x2={outerPoint.x}
                y2={outerPoint.y}
                stroke="currentColor"
                strokeWidth={2}
                className="text-muted-foreground/40"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1={center}
          y1={center}
          x2={nx}
          y2={ny}
          stroke={scoreColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <circle cx={center} cy={center} r={5} fill={scoreColor} />
        <circle cx={center} cy={center} r={2.5} className="fill-card" />

        {/* Center text */}
        <text
          x={center}
          y={center + 24}
          textAnchor="middle"
          className="fill-foreground text-3xl font-bold"
          style={{ fontSize: size * 0.14 }}
        >
          {value.toFixed(2)}
        </text>
        <text
          x={center}
          y={center + 42}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: size * 0.05 }}
        >
          {label}
        </text>
      </svg>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: scoreColor }}
        />
        <span className="text-sm font-medium" style={{ color: scoreColor }}>
          {scoreLabel}
        </span>
      </div>
    </div>
  );
}

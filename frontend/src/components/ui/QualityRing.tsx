'use client';

import React from 'react';

interface QualityRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function QualityRing({ score, size = 160, strokeWidth = 12 }: QualityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10B981';
    if (s >= 60) return '#F59E0B';
    return '#F43F5E';
  };

  const color = getColor(score);

  return (
    <div className="quality-ring-container">
      <div className="quality-ring-wrapper">
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease' }}
          />
        </svg>
        <div className="quality-ring-score">
          <span className="quality-ring-number" style={{ color }}>{score}</span>
          <span className="quality-ring-label">/ 100</span>
        </div>
      </div>
    </div>
  );
}

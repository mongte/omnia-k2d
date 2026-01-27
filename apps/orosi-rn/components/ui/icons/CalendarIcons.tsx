import * as React from 'react';
import Svg, { Path, Line, Rect, Circle, SvgProps } from 'react-native-svg';

interface IconProps extends SvgProps {
  color?: string;
  size?: number;
}

export const ConnectorArrow = ({
  direction,
  color,
}: {
  direction: 'up' | 'down';
  color: string;
}) => {
  const strokeWidth = 2.5;
  if (direction === 'up') {
    return (
      <Svg
        width={14}
        height={20}
        viewBox="0 0 14 20"
        style={{ marginBottom: -2 }}
      >
        <Line
          x1="7"
          y1="20"
          x2="7"
          y2="2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M 3 6 L 7 2 L 11 6"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  } else {
    return (
      <Svg width={14} height={20} viewBox="0 0 14 20" style={{ marginTop: -2 }}>
        <Line
          x1="7"
          y1="0"
          x2="7"
          y2="18"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M 3 14 L 7 18 L 11 14"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }
};

export const TodayIcon = ({
  color = '#1A1A1A',
  size = 24,
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 2V6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 2V6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 10H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* A central dot to represent 'Today' / 'Focus' */}
    <Circle cx="12" cy="16" r="3" fill={color} />
  </Svg>
);

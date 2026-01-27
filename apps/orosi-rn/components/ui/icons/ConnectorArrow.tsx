import * as React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

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

import React from 'react';

interface SkeletonProps {
  height?: string;
  width?: string;
  count?: number;
  style?: React.CSSProperties;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  height = '20px',
  width = '100%',
  count = 1,
  style = {},
}) => {
  const items = Array.from({ length: count });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {items.map((_, index) => (
        <div
          key={index}
          style={{
            height,
            width,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--border-subtle) 50%, var(--bg-secondary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonPulse 1.5s infinite ease-in-out',
            ...style,
          }}
        />
      ))}
    </div>
  );
};

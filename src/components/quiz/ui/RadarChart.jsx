import React from 'react';
import '../../../styles/Quiz.css';

/**
 * 通用雷达图组件
 * @param {object} dimensions - 维度定义 { key: { name: "维度名", desc: "描述" } }
 * @param {object} scores - 分数对象 { key: value }
 * @param {string} activeDim - 当前选中的维度 Key (可选)
 * @param {function} onDimClick - 点击维度的回调 (可选)
 * @param {number} maxVal - 满分值 (默认 5)
 */
const RadarChart = ({ 
  dimensions, 
  scores, 
  activeDim, 
  onDimClick, 
  maxVal = 5 
}) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(dimensions);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // 计算坐标 helper
  const getCoordinates = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2; // -90度让第一个点朝上
    const r = (Math.min(value, maxVal) / maxVal) * radius; // 归一化半径
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const getLabelCoordinates = (index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius + 35; // 标签距离圆心的距离
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  // 生成多边形路径点
  const points = axes.map((key, i) => {
    const score = scores[key] || 0;
    const coords = getCoordinates(score, i);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      background: 'var(--qz-bg-card)', padding: '2rem 0', 
      borderRadius: 'var(--qz-radius-card)', border: '1px solid var(--qz-border)',
      marginBottom: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1', position: 'relative' }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* 1. 背景网格 (5层) */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((level, idx) => (
            <polygon 
              key={idx} 
              points={axes.map((_, i) => {
                const angle = i * angleSlice - Math.PI / 2;
                const r = radius * level;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(" ")} 
              fill="none" 
              stroke="var(--qz-border)" 
              strokeWidth="1" 
            />
          ))}

          {/* 2. 轴线 */}
          {axes.map((_, i) => {
            const s = getCoordinates(0, i);
            const e = getCoordinates(maxVal, i);
            return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="var(--qz-border)" strokeWidth="1" />;
          })}

          {/* 3. 数据填充区域 */}
          <polygon 
            points={points} 
            fill="var(--qz-primary)" 
            fillOpacity="0.2" 
            stroke="var(--qz-primary)" 
            strokeWidth="2" 
          />

          {/* 4. 数据点 */}
          {axes.map((key, i) => {
            const c = getCoordinates(scores[key] || 0, i);
            return <circle key={i} cx={c.x} cy={c.y} r="3" fill="var(--qz-primary)" />;
          })}

          {/* 5. 交互标签 */}
          {axes.map((key, i) => {
            const c = getLabelCoordinates(i);
            const isActive = activeDim === key;
            return (
              <text 
                key={key} 
                x={c.x} 
                y={c.y} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                onClick={() => onDimClick && onDimClick(key)}
                style={{
                  fontSize: isActive ? '0.85rem' : '0.75rem', 
                  fill: isActive ? 'var(--qz-primary)' : 'var(--qz-text-sub)', 
                  fontWeight: isActive ? 'bold' : 'normal', 
                  cursor: onDimClick ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                {dimensions[key].name}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* 6. 选中维度的详细浮层 (Stat Box) */}
      {activeDim && dimensions[activeDim] && (
        <div className="qz-fade-in" style={{
          marginTop: '0rem', // 紧贴雷达图下方
          background: 'var(--qz-bg-soft)', 
          border: '1px solid var(--qz-primary)',
          padding: '0.8rem 1.5rem', 
          borderRadius: '8px', 
          textAlign: 'center',
          minWidth: '220px'
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--qz-text-soft)', marginBottom: '0.2rem' }}>
            {dimensions[activeDim].name}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--qz-primary)' }}>
            {scores[activeDim].toFixed(1)} <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>/ {maxVal}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--qz-text-soft)', opacity: 0.9 }}>
            {dimensions[activeDim].desc}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarChart;
import React, { useState } from 'react';
import '../../../styles/Quiz.css';

/**
 * 1. 万能分数卡 (ScoreCard)
 * @param {string} title - 卡片标题 (如 "主导原型")
 * @param {string} variant - 'hero'(主导/大卡片) | 'secondary'(次要/描边卡片)
 * @param {string} theme - 'light'(白底) | 'dark'(黑金/深色) | 'brand'(品牌色背景)
 * @param {ReactNode} children - 卡片内容
 */
export const ScoreCard = ({ title, variant = 'hero', theme = 'light', children }) => {
  // 样式映射
  const styles = {
    // 主题配色
    theme: {
      light: { background: 'var(--qz-bg-card)', color: 'var(--qz-text-main)', border: '1px solid var(--qz-border)' },
      dark: { background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', color: '#f4f4f5', border: '1px solid #3f3f46' },
      brand: { background: 'linear-gradient(135deg, var(--qz-primary) 0%, #d97706 100%)', color: 'var(--qz-primary-fg)', border: 'none' },
    },
    // 变体形状
    variant: {
      hero: { padding: '2.5rem 1.5rem', marginBottom: '2rem' },
      secondary: { padding: '1.5rem', marginBottom: '1rem', border: '2px solid var(--qz-primary)' }, // 强制覆盖边框为品牌色
    }
  };

  // 组合样式
  const currentStyle = {
    ...styles.theme[theme],
    ...styles.variant[variant]
  };

  // 如果是 secondary 变体，强制覆盖背景为卡片色，边框为品牌色
  if (variant === 'secondary') {
    currentStyle.background = 'var(--qz-bg-card)';
    currentStyle.color = 'var(--qz-text-main)';
    currentStyle.border = '2px solid var(--qz-primary)';
  }

  return (
    <div className="qz-card" style={{ 
      ...currentStyle, 
      textAlign: 'center', 
      position: 'relative',
      overflow: 'hidden',
      marginBottom: currentStyle.marginBottom
    }}>
      {/* 水印 */}
      <div style={{ 
        position: 'absolute', bottom: '1rem', right: '1rem', 
        opacity: 0.05, fontWeight: '900', fontSize: '1.5rem', pointerEvents: 'none' 
      }}>
        PolyCN
      </div>
      
      {/* 小标题 */}
      {title && (
        <div style={{ 
          fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', 
          marginBottom: '1rem', opacity: 0.8 
        }}>
          {title}
        </div>
      )}

      {/* 内容插槽 */}
      <div>{children}</div>
    </div>
  );
};

/**
 * 2. 详情列表 (MoreDetails)
 * @param {Array} items - [{ label, score, content }]
 * @param {string} label - 按钮文字 (默认"详细报告")
 */
export const MoreDetails = ({ items = [], label = "详细报告" }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="qz-btn-outline"
        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        {isOpen ? `收起${label}` : `展开${label}`} 
        <span>{isOpen ? '⬆️' : '⬇️'}</span>
      </button>

      {isOpen && (
        <div className="qz-fade-in" style={{ 
          marginTop: '1.5rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1rem' 
        }}>
          {items.map((item, idx) => (
            <div key={idx} className="qz-card" style={{ 
              marginBottom: 0, 
              background: 'var(--qz-bg-page)', 
              border: '1px solid var(--qz-border)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--qz-text-main)' }}>{item.label}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--qz-primary)' }}>{item.score}</span>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--qz-text-sub)' }}>
                {item.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
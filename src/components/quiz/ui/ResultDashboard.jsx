import React, { useState } from 'react';
import '../../../styles/Quiz.css';

// 局部 Popover 组件 (保持不变)
const LocalSharePopover = ({ onClose }) => (
  <div style={{
    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
    background: '#1f2937', color: 'white', padding: '0.8rem 1.2rem', borderRadius: '8px',
    marginBottom: '10px', fontSize: '0.9rem', textAlign: 'center', width: '260px', zIndex: 10
  }}>
    <div style={{ marginBottom: '0.5rem' }}>请<b>截图</b>保存此页面或分享给好友 :)</div>
    <button onClick={onClose} style={{ 
      background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', 
      padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
      marginTop: 0 // 强制去除 margin
    }}>我知道了</button>
    <div style={{
      position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
      borderWidth: '6px', borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent'
    }}></div>
  </div>
);

/**
 * 1. 万能分数卡 (ScoreCard)
 */
export const ScoreCard = ({ title, variant = 'hero', theme = 'light', children }) => {
  const styles = {
    theme: {
      light: { background: 'var(--qz-bg-card)', color: 'var(--qz-text-main)', border: '1px solid var(--qz-border)' },
      dark: { background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', color: '#f4f4f5', border: '1px solid #3f3f46' },
      brand: { background: 'linear-gradient(135deg, var(--qz-primary) 0%, #d97706 100%)', color: 'var(--qz-primary-fg)', border: 'none' },
    },
    variant: {
      hero: { padding: '2rem 1.5rem', marginBottom: '2rem' },
      secondary: { padding: '1.25rem', marginBottom: '1rem', border: '2px solid var(--qz-primary)' },
    }
  };

  const currentStyle = {
    ...styles.theme[theme],
    ...styles.variant[variant]
  };

  if (variant === 'secondary') {
    currentStyle.background = 'var(--qz-bg-card)';
    currentStyle.color = 'var(--qz-text-main)';
    currentStyle.border = '2px solid var(--qz-primary)';
  }

  return (
    <div className="qz-card" style={{ 
      ...currentStyle, 
      textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: currentStyle.marginBottom
    }}>
      <div style={{ 
        position: 'absolute', bottom: '0.5rem', right: '1rem', 
        opacity: 0.05, fontWeight: '900', fontSize: '1.5rem', pointerEvents: 'none', fontFamily: 'sans-serif'
      }}>PolyCN</div>
      
      {title && (
        <div style={{ 
          fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '0.8rem', opacity: 0.8, fontWeight: 'bold'
        }}>{title}</div>
      )}
      <div>{children}</div>
    </div>
  );
};

/**
 * 2. 详情列表 (MoreDetails)
 */
export const MoreDetails = ({ items = [], label = "详细报告" }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="qz-btn-outline"
        style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}
      >
        {isOpen ? `收起${label}` : `展开${label}`} 
        <span>{isOpen ? '⬆️' : '⬇️'}</span>
      </button>

      {isOpen && (
        <div className="qz-fade-in" style={{ 
          marginTop: '1.2rem', 
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

/**
 * 3. 结果操作区 (ResultActions) - 已修改比例
 */
export const ResultActions = ({ onRetry }) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      {/* 分享按钮 (占比 7) */}
      <div style={{ position: 'relative', flex: 7 }}>
        {showShare && <LocalSharePopover onClose={() => setShowShare(false)} />}
        <div 
          onClick={() => setShowShare(true)} 
          className="qz-card"
          style={{ 
            width: '100%', marginBottom: 0, textAlign: 'center', cursor: 'pointer', 
            border: '1px solid var(--qz-primary)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px',
            color: 'var(--qz-primary)', fontWeight: 'bold', fontSize: '1.1rem'
          }}
        >
          分享结果
        </div>
      </div>

      {/* 重测按钮 (占比 3) */}
      <div 
        onClick={onRetry} 
        className="qz-card"
        style={{ 
          flex: 3, marginBottom: 0, textAlign: 'center', cursor: 'pointer', 
          background: 'var(--qz-bg-page)', color: 'var(--qz-text-sub)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px',
          fontWeight: 'bold', fontSize: '1rem'
        }}
      >
        重新测试
      </div>
    </div>
  );
};
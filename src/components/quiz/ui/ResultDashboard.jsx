import React, { useState } from 'react';
import '../../../styles/Quiz.css';

// 局部 Popover 组件
const LocalSharePopover = ({ onClose }) => (
  <div className="share-popover">
    <div className="popover-text">请<b>截图</b>保存此页面或分享给好友 :)</div>
    <button onClick={onClose} className="popover-close">我知道了</button>
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

  const currentStyle = { ...styles.theme[theme], ...styles.variant[variant] };

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
        <div style={{ fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '0.8rem', opacity: 0.8, fontWeight: 'bold' }}>{title}</div>
      )}
      <div>{children}</div>
    </div>
  );
};

/**
 * 2. 详情列表 (MoreDetails) - 基础组件
 * (样式已降级为辅助操作：白底灰边)
 */
export const MoreDetails = ({ items = [], label = "剩余详情" }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="qz-btn-outline"
        style={{ 
          width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0,
          background: 'var(--qz-bg-card)',
          borderColor: 'var(--qz-border)',
          borderWidth: '2px',
          color: 'var(--qz-text-sub)',
          padding: '1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {isOpen ? `收起${label}` : `查看${label}`} 
        <span style={{ display: 'inline-block', transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>⬇️</span>
      </button>

      {isOpen && (
        <div className="qz-fade-in" style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {items.map((item, idx) => (
            <div key={idx} className="qz-card" style={{ marginBottom: 0, background: 'var(--qz-bg-page)', border: '1px solid var(--qz-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--qz-text-main)' }}>{item.label}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--qz-primary)' }}>{item.score}</span>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--qz-text-sub)' }}>{item.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 3. 智能分析模块 (ResultAnalysis) - ✅ 新增组件
 * 自动进行高分/低分分流展示
 */
export const ResultAnalysis = ({ 
  items = [], 
  title = "全维度结果解析", 
  threshold = 4.0 // 默认高分阈值
}) => {
  // 逻辑分流
  const highScores = [];
  const normalScores = [];

  items.forEach(item => {
    // 尝试解析分数 (支持 "4.5" 或 "4.5分")
    const numScore = parseFloat(item.score);
    if (!isNaN(numScore) && numScore >= threshold) {
      highScores.push(item);
    } else {
      normalScores.push(item);
    }
  });

  return (
    <div style={{ marginTop: '3rem' }}>
      <h3 className="qz-heading-lg" style={{ color: 'var(--qz-primary)' }}>✦ {title}</h3>
      <p className="qz-text-body" style={{ marginBottom: '1.5rem' }}>
        以下是您在 {items.length} 个核心维度上的具体得分与建议（按优势强弱排序）。
      </p>

      {/* A. 高分展示区 (荣誉榜样式) */}
      {highScores.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
          {highScores.map((d, i) => (
            <div key={i} className="qz-card" style={{ 
              border: '2px solid var(--qz-primary)',
              background: 'var(--qz-bg-soft)',
              marginBottom: 0,
              position: 'relative',
              padding: '1.5rem'
            }}>
              <div style={{ 
                position: 'absolute', top: 0, right: 0, 
                background: 'var(--qz-primary)', color: 'white', 
                padding: '4px 12px', fontSize: '0.8rem', fontWeight: 'bold',
                borderBottomLeftRadius: '12px'
              }}>
                高分
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', color: 'var(--qz-text-soft)' }}>{d.label}</span>
                <span style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--qz-primary)' }}>{d.score}</span>
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--qz-text-main)' }}>
                {d.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* B. 普通/低分展示区 (折叠收纳) */}
      {normalScores.length > 0 && (
        <MoreDetails 
          label="其他维度详情"
          items={normalScores}
        />
      )}

      {/* C. 全满分彩蛋 */}
      {normalScores.length === 0 && highScores.length > 0 && (
        <div style={{ textAlign: 'center', color: 'var(--qz-text-sub)', margin: '2rem 0', fontStyle: 'italic' }}>
          全部结果均展示完毕，没有其余结果。
        </div>
      )}
    </div>
  );
};

/**
 * 4. 结果操作区 (ResultActions)
 * (样式已升级为视觉焦点：浅橙色背景+橙色边框)
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
            // 样式升级：诱导点击
            background: 'var(--qz-bg-soft)', 
            border: '2px solid var(--qz-primary)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60px',
            color: 'var(--qz-text-soft)', fontWeight: 'bold', fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.15)'
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
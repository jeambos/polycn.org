import React from 'react';
import '../../../styles/Quiz.css';

/**
 * 纯展示型题目卡片
 * @param {object} question - 题目对象
 * @param {any} value - 当前答案
 * @param {function} onChange - 回调
 * @param {string} id - DOM ID
 * @param {boolean} showScaleLabels - 是否显示辅助文字（新增）
 */
const QuestionCard = ({ question, value, onChange, id, showScaleLabels }) => {
  
  // ✅ 1. 定义圆点颜色：紫色(#8b5cf6) -> 橙色(#f97316)
  const DOT_COLORS = {
    1: '#8b5cf6', // 紫色 (完全不符合)
    2: '#a78bfa', // 浅紫
    3: '#f472b6', // 粉色 (中立)
    4: '#fb923c', // 浅橙
    5: '#f97316'  // 橙色 (完全符合)
  };

  // 渲染五点量表 (Scale)
  const renderScale = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '400px', margin: '0 auto', height: '60px' }}>
        {[1, 2, 3, 4, 5].map((val) => {
          const isActive = value === val;
          const myColor = DOT_COLORS[val];

          return (
            <button
              key={val}
              onClick={() => onChange(val)}
              className="qz-scale-btn"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '48px', height: '48px'
              }}
            >
              <div style={{
                // 尺寸逻辑：两端大(32px)，中间小
                width: val === 3 ? '20px' : (val === 1 || val === 5 ? '32px' : '24px'),
                height: val === 3 ? '20px' : (val === 1 || val === 5 ? '32px' : '24px'),
                borderRadius: '50%',
                // 边框逻辑：始终显示彩圈
                borderWidth: val === 3 ? '2px' : '3px',
                borderStyle: 'solid',
                borderColor: myColor, 
                // 背景逻辑：选中时填充颜色，未选中透明
                backgroundColor: isActive ? myColor : 'transparent',
                // 动画与变换
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'scale(1.15)' : 'scale(1)'
              }} />
            </button>
          );
        })}
      </div>
      
      {/* ✅ 2. 辅助文字：根据 showScaleLabels 控制显隐 */}
      {showScaleLabels && (
        <div className="qz-fade-in" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          maxWidth: '420px', 
          margin: '0.5rem auto 0', 
          fontSize: '0.85rem', 
          color: 'var(--qz-text-sub)',
          textAlign: 'center',
          lineHeight: 1.4,
          fontWeight: 500,
          // 强制使用无衬线字体以保持清晰
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ width: '18%', marginTop: '0 !important' }}>完全<br/>不符合</div>
          <div style={{ width: '18%', marginTop: '0 !important' }}>基本<br/>不符合</div>
          <div style={{ width: '18%', marginTop: '0 !important' }}>中立<br/>说不清</div>
          <div style={{ width: '18%', marginTop: '0 !important' }}>基本<br/>符合</div>
          <div style={{ width: '18%', marginTop: '0 !important' }}>完全<br/>符合</div>
        </div>
      )}
    </div>
  );

  // 渲染文字选项 (Selection)
  const renderOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {question.options.map((opt, idx) => {
        const isSelected = Array.isArray(value) 
          ? value.includes(opt.value || opt.dim) 
          : (value === opt.value || opt.dim ? value === (opt.value || opt.dim) : false);

        return (
          <div
            key={idx}
            onClick={() => onChange(opt.value || opt.dim)}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: isSelected ? '1px solid var(--qz-primary)' : '1px solid var(--qz-border)',
              backgroundColor: isSelected ? 'var(--qz-bg-soft)' : 'var(--qz-bg-card)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: isSelected ? '5px solid var(--qz-primary)' : '2px solid var(--qz-border)',
              flexShrink: 0
            }} />
            <span style={{ 
              color: isSelected ? 'var(--qz-text-soft)' : 'var(--qz-text-main)', 
              fontSize: '0.95rem', fontWeight: isSelected ? '600' : '400'
            }}>
              {opt.text}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div id={id} className="qz-card qz-fade-in" style={{ scrollMarginTop: '20px' }}>
      <h3 className="qz-heading-lg" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        {question.text}
      </h3>
      
      {(question.type === 'scale' || !question.type) && renderScale()}
      {(question.type === 'option' || question.type === 'selection') && renderOptions()}
    </div>
  );
};

export default QuestionCard;
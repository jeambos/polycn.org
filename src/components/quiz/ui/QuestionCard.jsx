import React from 'react';
import '../../../styles/Quiz.css';

/**
 * 纯展示型题目卡片
 * @param {object} question - 题目对象 {id, text, type, options...}
 * @param {any} value - 当前答案
 * @param {function} onChange - 回调 (val) => {}
 * @param {string} id - DOM ID，用于锚点滚动
 */
const QuestionCard = ({ question, value, onChange, id }) => {
  
  // 渲染五点量表 (Scale)
  const renderScale = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '400px', margin: '0 auto', height: '60px' }}>
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className="qz-scale-btn" // 方便 CSS 选中（如果需要）
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '48px', height: '48px'
            }}
          >
            <div style={{
              width: val === 3 ? '24px' : val === 1 || val === 5 ? '36px' : '28px',
              height: val === 3 ? '24px' : val === 1 || val === 5 ? '36px' : '28px',
              borderRadius: '50%',
              border: '2px solid',
              // 选中态逻辑：只改变样式，不处理跳转
              borderColor: value === val ? 'var(--qz-primary)' : 'var(--qz-border)',
              backgroundColor: value === val ? 'var(--qz-primary)' : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: value === val ? 'scale(1.1)' : 'scale(1)'
            }} />
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px', margin: '0.5rem auto 0', fontSize: '0.75rem', color: 'var(--qz-text-sub)' }}>
        <span>完全<br/>不符合</span>
        <span>完全<br/>符合</span>
      </div>
    </div>
  );

  // 渲染文字选项 (Selection)
  const renderOptions = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {question.options.map((opt, idx) => {
        // 兼容单选和多选(数组)
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
            {/* 选中指示器：圆点或勾选 */}
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
      
      {/* 根据 type 渲染不同内容 */}
      {(question.type === 'scale' || !question.type) && renderScale()}
      {(question.type === 'option' || question.type === 'selection') && renderOptions()}
    </div>
  );
};

export default QuestionCard;
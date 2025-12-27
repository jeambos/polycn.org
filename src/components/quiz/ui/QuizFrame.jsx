import React from 'react';
import '../../../styles/Quiz.css';
import MoreTests from './MoreTests';

// 子组件：页脚（只包含更多测试和链接，不再包含操作按钮）
export const QuizFooter = ({ currentId, status = 'welcome' }) => {
  return (
    <div className="qz-fade-in">
      {/* 更多测试列表 */}
      <MoreTests currentId={currentId} status={status} />
      
      {/* 底部小导航 */}
      <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
        <a href="/" style={{ color: 'var(--qz-text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>全站首页</a>
        <a href="/library" style={{ color: 'var(--qz-text-sub)', textDecoration: 'none', fontSize: '0.9rem' }}>全部馆藏</a>
      </div>
    </div>
  );
};

// 子组件：欢迎卡片 (保持不变)
export const WelcomeCard = ({ title, introList = [], onStart }) => (
  <div className="qz-card qz-fade-in" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
    <h1 className="qz-heading-xl">{title}</h1>
    <div style={{ 
      textAlign: 'left', background: 'var(--qz-bg-page)', padding: '1.5rem', 
      borderRadius: '8px', margin: '0 auto 2rem', maxWidth: '600px' 
    }}>
      <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {introList.map((item, i) => (
          <li key={i} className="qz-text-body">{item}</li>
        ))}
      </ul>
    </div>
    <button onClick={onStart} className="qz-btn-primary" style={{ transform: 'scale(1.1)' }}>
      开始评估
    </button>
  </div>
);

// 主容器组件 (保持不变)
export const QuizContainer = ({ children }) => {
  return (
    <div className="qz-container">
      {children}
    </div>
  );
};
import React, { useState } from 'react';
import '../../../styles/Quiz.css';
import MoreTests from './MoreTests';

// 子组件：分享气泡
const SharePopover = ({ onClose }) => (
  <div style={{
    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
    background: '#1f2937', color: 'white', padding: '0.8rem 1.2rem', borderRadius: '8px',
    marginBottom: '10px', fontSize: '0.9rem', textAlign: 'center', width: '260px', zIndex: 10
  }}>
    <div style={{ marginBottom: '0.5rem' }}>请<b>截图</b>保存此页面或分享给好友 :)</div>
    <button onClick={onClose} style={{ 
      background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', 
      padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' 
    }}>我知道了</button>
    {/* 小三角 */}
    <div style={{
      position: 'absolute', top: '100%', left: '50%', marginLeft: '-6px',
      borderWidth: '6px', borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent'
    }}></div>
  </div>
);

// 子组件：页脚（分享、更多测试）
export const QuizFooter = ({ currentId, status = 'welcome', onRetry }) => {
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="qz-fade-in">
      {/* 仅在结果页显示的操作按钮 */}
      {status === 'result' && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            {showShare && <SharePopover onClose={() => setShowShare(false)} />}
            <button 
              onClick={() => setShowShare(true)} 
              className="qz-card"
              style={{ width: '100%', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--qz-primary)', color: 'var(--qz-primary)', fontWeight: 'bold' }}
            >
              分享结果
            </button>
          </div>
          <button 
            onClick={onRetry} 
            className="qz-card"
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer', color: 'var(--qz-text-sub)', fontWeight: 'bold' }}
          >
            重新测试
          </button>
        </div>
      )}

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

// 子组件：欢迎卡片
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

// 主容器组件
export const QuizContainer = ({ progress, children }) => {
  return (
    <div className="qz-container">
      {/* 只有当 progress 存在且大于0时显示进度条 */}
      {typeof progress === 'number' && (
        <div className="qz-progress-track">
          <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {children}
    </div>
  );
};
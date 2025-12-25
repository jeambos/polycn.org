import React from 'react';
import '../../../styles/Quiz.css';

const ALL_TESTS = [
  { id: 'orientation', title: '关系形态倾向自测', desc: '你更适合哪种关系模式？', link: '/assessment/orientation' },
  { id: 'adaption', title: '复杂关系适应能力评估', desc: '多元的关系，你不一定真能搞定……', link: '/assessment/adaption' },
  { id: 'norms', title: '恋爱观规范程度自评', desc: '你的观念，是自己的，还是社会赋予的？', link: '/assessment/norms' },
  { id: 'openornot', title: '开放关系准备度测试', desc: '你们的关系，能应对开放后的挑战吗？', link: '/assessment/openornot' },
  { id: 'jealousy', title: '嫉妒类型图谱', desc: '深入探索你的嫉妒从何而来', link: '/assessment/jealousy' }
];

const MoreTests = ({ currentId, status = 'welcome' }) => {
  // 如果没有 currentId，说明是索引页模式，显示所有
  const displayList = currentId 
    ? [
        ...ALL_TESTS.filter(t => t.id === currentId), 
        ...ALL_TESTS.filter(t => t.id !== currentId)
      ].slice(0, 4) // 推荐模式只显示4个
    : ALL_TESTS;

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--qz-border)' }}>
      {currentId && (
        <h4 className="qz-heading-lg" style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--qz-primary)' }}>
          更多测试
        </h4>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {displayList.map(test => {
          const isCurrent = test.id === currentId;
          
          // 当前测试的高亮状态
          if (isCurrent) {
            const isFinished = status === 'result';
            return (
              <div key={test.id} className="qz-card" style={{ 
                border: '1px solid var(--qz-primary)', 
                backgroundColor: isFinished ? 'var(--qz-bg-soft)' : 'var(--qz-bg-page)',
                marginBottom: 0 
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--qz-primary)' }}>
                  {test.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--qz-text-sub)' }}>
                  {isFinished ? '✅ 已完成' : '📍 正在进行'}
                </div>
              </div>
            );
          }

          // 其他测试的链接状态
          return (
            <a key={test.id} href={test.link} className="qz-card" style={{ 
              textDecoration: 'none', cursor: 'pointer', marginBottom: 0,
              display: 'block', transition: 'transform 0.2s'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--qz-text-main)' }}>
                {test.title}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--qz-text-sub)' }}>
                {test.desc}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MoreTests;
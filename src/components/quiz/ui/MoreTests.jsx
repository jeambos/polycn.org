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
  // 模式判断
  const isIndexMode = !currentId;
  
  let displayList = [];
  if (isIndexMode) {
    // 索引模式：显示全部
    displayList = ALL_TESTS;
  } else {
    // 推荐模式：固定显示 4 个
    // 逻辑：把 currentId 对应的测试放到第一个，剩下的按顺序补足
    const currentTest = ALL_TESTS.find(t => t.id === currentId);
    const others = ALL_TESTS.filter(t => t.id !== currentId);
    displayList = currentTest ? [currentTest, ...others] : ALL_TESTS;
    displayList = displayList.slice(0, 4); // 只取前4个
  }

  return (
    <div className="more-tests-section">
      {!isIndexMode && (
        <h4 className="more-title">更多测试</h4>
      )}
      
      <div className={`test-grid ${isIndexMode ? 'cols-2' : ''}`}>
        {displayList.map((test, index) => {
          const isCurrent = test.id === currentId;

          // --- 特殊处理：如果是当前页面的测试 (且不是索引模式) ---
          if (isCurrent && !isIndexMode) {
            
            // 场景 A: 结果页 (绿色已完成)
            if (status === 'result') {
              return (
                <div key={test.id} className="test-card completed">
                  <span className="t-name">{test.title}</span>
                  <span className="t-status">✅ 已完成</span>
                </div>
              );
            } 
            
            // 场景 B: 欢迎页/进行中 (灰色不可点)
            else {
              return (
                <div key={test.id} className="test-card current">
                  <span className="t-name">{test.title}</span>
                  <span className="t-status current-badge">📍 您已在此</span>
                </div>
              );
            }
          }

          // --- 普通测试卡片 (可点击) ---
          return (
            <a key={test.id} href={test.link} className="test-card active">
              <span className="t-name">{test.title}</span>
              <span className="t-desc">{test.desc}</span>
            </a>
          );
        })}
      </div>

      {/* 底部链接：仅在推荐模式下显示 */}
      {!isIndexMode && (
        <div className="more-link-wrapper">
          <a href="/assessment" className="more-link">
            查看测试首页 &rarr;
          </a>
        </div>
      )}
    </div>
  );
};

export default MoreTests;
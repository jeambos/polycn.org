import React from 'react';
import '../styles/Assessment.css'; // 确保样式被引入

// === 配置中心 ===
const ALL_TESTS = [
  { 
    id: 'orientation', 
    title: '关系形态倾向自测', 
    desc: '你更适合哪种关系模式？', 
    link: '/assessment/orientation' 
  },
  { 
    id: 'adaption', 
    title: '复杂关系适应能力评估', 
    desc: '多元的关系，你不一定真能搞定……', 
    link: '/assessment/adaption' 
  },
  { 
    id: 'norms', 
    title: '恋爱观规范程度自评', 
    desc: '你的观念，是自己的，还是社会赋予的？', 
    link: '/assessment/norms' 
  },
    { 
    id: 'openornot', 
    title: '开放关系准备度测试', 
    desc: '你们的关系，能应对开放后的挑战吗？', 
    link: '/assessment/openornot' 
  },
  { 
    id: 'jealousy', 
    title: '嫉妒类型图谱', 
    desc: '防御型嫉妒 vs 竞争型嫉妒', 
    link: '#', 
    isFuture: true 
  }
];

/**
 * 更多测试组件 (通用版)
 * @param {string} [currentId] - 当前页面的ID。如果不传，则显示所有测试(索引模式)。
 * @param {string} [status='welcome'] - 'welcome'(灰色定位) | 'result'(绿色已完成)
 */
const MoreTests = ({ currentId, status = 'welcome' }) => {
  let displayList = [];
  const isIndexMode = !currentId; // 是否为索引模式

  if (isIndexMode) {
    // 模式 1: 不传 ID -> 显示所有测试 (不做切片)
    displayList = ALL_TESTS;
  } else {
    // 模式 2: 传入 ID -> 推荐模式 (固定 4 个)
    const currentTest = ALL_TESTS.find(t => t.id === currentId);
    const otherTests = ALL_TESTS.filter(t => t.id !== currentId);
    
    // 逻辑：当前测试置顶 + 其他测试的前3个
    // 如果找不到当前ID (比如写错了)，就兜底显示前4个
    displayList = currentTest 
      ? [currentTest, ...otherTests].slice(0, 4) 
      : ALL_TESTS.slice(0, 4);
  }

  return (
    <div className="more-tests-section">
      {/* 仅在非索引模式下显示小标题，索引页通常有自己的大标题 */}
      {!isIndexMode && <h4 className="more-title">更多测试</h4>}
      
      <div className={`test-grid ${isIndexMode ? 'cols-2' : ''}`}>
        {displayList.map(test => {
          const isCurrent = test.id === currentId;

          // --- 情况 A: 本页测试 (高亮显示) ---
          if (isCurrent) {
            if (status === 'result') {
              // 结算页：绿色已完成
              return (
                <div key={test.id} className="test-card completed">
                  <span className="t-name">{test.title}</span>
                  <span className="t-status">✅ 已完成</span>
                </div>
              );
            } else {
              // 欢迎页：浅色提示
              return (
                <div key={test.id} className="test-card current">
                  <span className="t-name">{test.title}</span>
                  <span className="t-status current-badge">
                    📍 您已在此
                  </span>
                </div>
              );
            }
          }

          // --- 情况 B: 敬请期待 ---
          if (test.isFuture) {
            return (
              <div key={test.id} className="test-card future">
                <span className="t-name">{test.title}</span>
                <span className="t-desc" style={{fontStyle:'italic'}}>Coming Soon...</span>
              </div>
            );
          }

          // --- 情况 C: 其他测试 (跳转) ---
          return (
            <a key={test.id} href={test.link} className="test-card active">
              <span className="t-name">{test.title}</span>
              <span className="t-desc">{test.desc}</span>
            </a>
          );
        })}
      </div>

      {/* 底部链接：仅在推荐模式(有currentId)下显示，防止在索引页自己跳自己 */}
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
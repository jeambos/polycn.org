import React from 'react';

const WikiCategoryList = ({ category }) => {
  // TODO: 这里后续会接入真实的 Wiki 数据抓取逻辑
  // 目前先返回一个静态的框架，让你看看布局效果
  return (
    <div className="wiki-category-list" style={{ margin: '2rem 0' }}>
      <div style={{ 
        padding: '1.5rem', 
        border: '1px dashed var(--sl-color-gray-3)', 
        borderRadius: '8px',
        background: 'var(--sl-color-gray-6)'
      }}>
        <h3 style={{ marginTop: 0 }}>📚 {category} 词条列表 (开发中)</h3>
        <p>此处将自动聚合所有标记为 <code>{category}</code> 的 Wiki 词条。</p>
        <ul style={{ marginTop: '1rem' }}>
          <li>示例词条 1</li>
          <li>示例词条 2</li>
          <li>...</li>
        </ul>
      </div>
    </div>
  );
};

export default WikiCategoryList;
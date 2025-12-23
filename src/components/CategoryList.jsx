import React, { useState, useMemo } from 'react';
import '../styles/CategoryList.css'; 

// 智能日期格式化
const formatDate = (dateInput) => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // 365天内显示 MM-DD，否则显示 YY-MM-DD
  if (diffDays <= 365) {
    return `${month}-${day}`;
  } else {
    const year = date.getFullYear().toString().slice(-2);
    return `${year}-${month}-${day}`;
  }
};

const CategoryList = ({ items }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [pageSize, setPageSize] = useState(20); // 默认 20
  const [currentPage, setCurrentPage] = useState(1);

  // 1. 生成分类列表
  const categories = useMemo(() => {
    const unique = new Set(items.map(i => i.category));
    return ['All', ...Array.from(unique)];
  }, [items]);

  // 2. 筛选数据
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter(i => i.category === activeCategory);
  }, [items, activeCategory]);

  // 3. 分页计算
  const totalItems = filteredItems.length;
  // 如果 pageSize 是 Infinity，则只有1页
  const totalPages = pageSize === Infinity ? 1 : Math.ceil(totalItems / pageSize);
  
  const currentData = pageSize === Infinity 
    ? filteredItems 
    : filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 切换分类时重置
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  // 处理页码/查看全部的变化
  const handlePageSizeChange = (e) => {
    const val = e.target.value;
    
    if (val === 'ALL') {
      // 弹出确认框
      const confirmLoad = window.confirm("确定一次性加载全部吗？数据量大时可能卡顿。");
      if (confirmLoad) {
        setPageSize(Infinity);
        setCurrentPage(1);
      } else {
        // 用户取消，重置 select 的显示（虽然 state 没变，但为了 UI 一致性）
        e.target.value = pageSize === Infinity ? 'ALL' : pageSize;
      }
    } else {
      setPageSize(Number(val));
      setCurrentPage(1);
    }
  };

  return (
    <div className="cat-list-container">
      
      {/* === A. 药丸导航 === */}
      <div className="cat-chips-wrapper">
        <div className="cat-chips-scroll">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat === 'All' ? '全部内容' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* === B. 内容列表 === */}
      <div className="cat-list-body">
        {currentData.map(item => (
          <a key={item.id} href={item.link} className="cat-item-row">
            <span className="cat-date">{formatDate(item.date)}</span>
            <span className="cat-badge">{item.category}</span>
            <span className="cat-title">{item.title}</span>
          </a>
        ))}
        
        {currentData.length === 0 && (
          <div className="cat-empty">暂无相关内容</div>
        )}
      </div>

      {/* === C. 底部工具栏 === */}
      <div className="cat-footer">
        
        {/* 分页器 (仅当页数 > 1 时显示) */}
        {totalPages > 1 ? (
          <div className="pagination-controls">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="page-btn"
            >
              &laquo;
            </button>
            <span className="page-info">
              {currentPage} / {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="page-btn"
            >
              &raquo;
            </button>
          </div>
        ) : (
          /* 如果只有1页（或选择了全部），显示个占位符保持布局平衡 */
          <div className="page-info">共 {totalItems} 条内容</div>
        )}

        {/* 页码选择器 */}
        <div className="page-size-selector">
          <select 
            value={pageSize === Infinity ? 'ALL' : pageSize} 
            onChange={handlePageSizeChange}
          >
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
            <option value="ALL">查看全部 ({totalItems})</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getTagColor } from '../utils/colorGenerator';

/**
 * 定义列表项的数据结构，解决 TS 的 never[] 报错
 * @typedef {Object} DirectoryItem
 * @property {string} id
 * @property {string} title
 * @property {string} link
 * @property {string} folderKey
 * @property {string} bookDisplayName
 * @property {Date|null} dateObj
 * @property {number} timestamp
 */

/**
 * @param {Object} props
 * @param {DirectoryItem[]} props.items - 传入的数据列表
 */
const DirectoryListing = ({ items = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // --- 拖拽滚动逻辑 (保持不变) ---
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  // ---------------------------

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // 1. 提取标签
  const filters = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      if (item.folderKey && item.bookDisplayName) {
        map.set(item.folderKey, item.bookDisplayName);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  // 2. 筛选
  const visibleItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter(item => item.folderKey === activeFilter);
  }, [items, activeFilter]);

  // 3. 分页
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(visibleItems.length / ITEMS_PER_PAGE);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return visibleItems.slice(start, start + ITEMS_PER_PAGE);
  }, [visibleItems, currentPage]);

  // 4. 页码生成
  const paginationRange = useMemo(() => {
    if (totalPages <= 1) return [];
    const range = [];
    range.push(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) range.push('...');
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  }, [currentPage, totalPages]);

  // 日期格式化
  const formatSmartDate = (dateObj) => {
    if (!dateObj) return ''; 
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    if (diffDays <= 365) {
      return `${month}-${day}`; 
    } else {
      const year = dateObj.getFullYear().toString().slice(-2);
      return `${year}-${month}-${day}`;
    }
  };

  return (
    <div className="dir-listing">
      {/* 顶部标签栏 */}
      <div 
        className={`filter-bar ${isDragging ? 'dragging' : ''}`}
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="filter-track">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => !isDragging && setActiveFilter('all')}
            style={{
              background: activeFilter === 'all' ? '#1f2937' : '#f3f4f6',
              color: activeFilter === 'all' ? '#fff' : '#374151',
              borderColor: 'transparent'
            }}
          >
            全部
          </button>
          {filters.map(([key, name]) => {
            const colors = getTagColor(key);
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => !isDragging && setActiveFilter(key)}
                className="filter-btn"
                style={{
                  background: isActive ? colors.text : colors.bg,
                  color: isActive ? '#fff' : colors.text,
                  borderColor: isActive ? 'transparent' : colors.border
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 列表内容 */}
      <div className="list-container">
        {pageItems.map((item, index) => {
          const colors = getTagColor(item.folderKey);
          const dateStr = formatSmartDate(item.dateObj);
          // 这里的 Key 很重要，使用 item.link (现在已经在Loader里修复了)，如果 link 重复，加 index 保底
          const uniqueKey = item.link || `fallback-${index}`;

          return (
            <a key={uniqueKey} href={item.link || '#'} className="list-row">
              {dateStr && <span className="row-date">{dateStr}</span>}
              {item.bookDisplayName && (
                <span 
                  className="row-tag"
                  style={{
                    background: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {item.bookDisplayName}
                </span>
              )}
              <span className="row-title">{item.title}</span>
            </a>
          );
        })}

        {visibleItems.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
            暂无内容
          </div>
        )}
      </div>

      {/* 分页栏 */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button 
            className="page-nav-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
          >
            上一页
          </button>

          <div className="page-numbers">
            {paginationRange.map((p, idx) => {
              if (p === '...') return <span key={`dots-${idx}`} className="page-dots">...</span>;
              return (
                <button
                  key={p}
                  className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button 
            className="page-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
          >
            下一页
          </button>
        </div>
      )}

      {/* 样式保持之前的版本，此处省略 style 标签内容，请保留原来的样式 */}
      <style>{`
        /* --- 过滤器样式 --- */
        .filter-bar { overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.5rem; scrollbar-width: none; cursor: grab; user-select: none; }
        .filter-bar.dragging { cursor: grabbing; }
        .filter-bar::-webkit-scrollbar { display: none; }
        .filter-track { display: flex; gap: 0.5rem; align-items: center; padding-left: 1px; }
        .filter-btn { height: 28px; margin-top: 0 !important; padding-top: 0 !important; padding-bottom: 0 !important; line-height: 1; padding: 0 0.75rem; border-radius: 4px; border: 1px solid transparent; font-size: 0.85rem; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; }
        .filter-btn:hover { filter: brightness(0.95); }
        /* --- 列表样式 --- */
        .list-container { display: flex; flex-direction: column; border-top: 1px solid #e5e7eb; min-height: 200px; }
        .list-row { display: flex; align-items: baseline; gap: 0.75rem; padding: 0.6rem 0.25rem; border-bottom: 1px solid #f3f4f6; text-decoration: none; color: inherit; transition: background 0.1s; line-height: 1.4; }
        .list-row:hover { background-color: #f9fafb; }
        .row-date { font-family: monospace, sans-serif; font-size: 0.85rem; color: #9ca3af; flex-shrink: 0; width: 4.5em; text-align: right; }
        .row-tag { font-size: 0.75rem; padding: 1px 6px; border-radius: 3px; white-space: nowrap; flex-shrink: 0; align-self: center; }
        .row-title { font-size: 0.95rem; color: #374151; font-weight: 500; word-break: break-word; }
        /* --- 分页栏样式 --- */
        .pagination-bar { display: flex; justify-content: space-between; align-items: center; padding-top: 1.5rem; margin-top: 0.5rem; }
        .page-nav-btn { background: transparent; border: 1px solid #e5e7eb; color: #374151; padding: 0.4rem 0.8rem !important; margin-top: 0 !important; border-radius: 4px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
        .page-nav-btn:hover:not(:disabled) { border-color: #d1d5db; background: #f9fafb; }
        .page-nav-btn:disabled { color: #d1d5db; border-color: #f3f4f6; cursor: not-allowed; }
        .page-numbers { display: flex; gap: 0.25rem; align-items: center; }
        .page-num-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; background: transparent; color: #6b7280; font-size: 0.9rem; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-top: 0 !important; padding: 0 !important; }
        .page-num-btn:hover { color: #111827; background: #f3f4f6; }
        .page-num-btn.active { background: #f97316; color: white; font-weight: bold; }
        .page-dots { color: #9ca3af; font-size: 0.8rem; padding: 0 0.25rem; }
        /* 移动端适配 */
        @media (max-width: 640px) { .list-row { flex-wrap: wrap; gap: 0.4rem; } .row-date { font-size: 0.75rem; width: auto; order: 1; } .row-tag { order: 2; } .row-title { width: 100%; order: 3; margin-top: 0.1rem; } .pagination-bar { flex-wrap: wrap; justify-content: center; gap: 1rem; } .page-numbers { order: -1; width: 100%; justify-content: center; margin-bottom: 0.5rem; } }
        /* 夜间模式 */
        :global([data-theme='dark']) .list-container { border-color: #374151; }
        :global([data-theme='dark']) .list-row { border-color: #1f2937; }
        :global([data-theme='dark']) .list-row:hover { background-color: #1f2937; }
        :global([data-theme='dark']) .row-title { color: #e5e7eb; }
        :global([data-theme='dark']) .page-nav-btn { border-color: #374151; color: #d1d5db; }
        :global([data-theme='dark']) .page-nav-btn:hover:not(:disabled) { background: #1f2937; }
        :global([data-theme='dark']) .page-nav-btn:disabled { color: #4b5563; border-color: #1f2937; }
        :global([data-theme='dark']) .page-num-btn { color: #9ca3af; }
        :global([data-theme='dark']) .page-num-btn:hover { background: #1f2937; color: white; }
        :global([data-theme='dark']) .page-num-btn.active { background: #f97316; color: white; }
      `}</style>
    </div>
  );
};

export default DirectoryListing;
import React from 'react';
import wikiData from '../../content/wiki-map.json'; // 直接导入生成的 JSON

const RandomWiki = () => {
  const handleRandom = () => {
    const slugs = wikiData.slugs;
    if (!slugs || slugs.length === 0) {
      alert('Wiki 还在建设中...');
      return;
    }
    
    // 随机抽一个
    const randomSlug = slugs[Math.floor(Math.random() * slugs.length)];
    // 跳转
    window.location.href = `/wiki/${randomSlug}`;
  };

  return (
    <button 
      onClick={handleRandom}
      style={{
        padding: '0.5rem 1rem',
        background: 'var(--sl-color-accent)',
        color: 'var(--sl-color-black)',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}
    >
      <span>🎲</span> 随机漫步
    </button>
  );
};

export default RandomWiki;
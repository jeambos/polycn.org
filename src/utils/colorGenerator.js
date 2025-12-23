// src/utils/colorGenerator.js

// 1. 核心色盘 (6个高频色 - 稍微鲜艳，用于活跃书籍)
const CORE_PALETTE = [
  { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' }, // 红
  { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' }, // 橙
  { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }, // 黄
  { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' }, // 绿
  { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' }, // 蓝
  { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }, // 紫
];

// 2. 扩展色盘生成器 (50色)
// 我们用 HSL 算法动态生成，避免写死50行代码
const getExtendedColor = (index) => {
  const hue = (index * 137.508) % 360; // 黄金角度分布，确保颜色分散
  return {
    bg: `hsl(${hue}, 80%, 96%)`,      // 极浅背景
    text: `hsl(${hue}, 70%, 25%)`,    // 深色文字
    border: `hsl(${hue}, 60%, 88%)`   // 浅边框
  };
};

/**
 * 根据书籍ID生成固定颜色
 * @param {string} id - 书籍文件夹名 (如 'ethical-slut')
 */
export function getTagColor(id) {
  if (!id) return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };

  // 简单的字符串哈希
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  // 如果哈希值小，优先用核心色盘；否则用扩展算法
  // 这里为了演示，我们让它随机分布在核心和扩展中
  if (hash % 10 < 3) { // 30% 概率命中核心色 (模拟活跃书籍)
    return CORE_PALETTE[hash % CORE_PALETTE.length];
  } else {
    return getExtendedColor(hash);
  }
}
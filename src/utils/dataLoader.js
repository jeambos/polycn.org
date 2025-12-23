import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

// 辅助函数：查找目录下的 _meta.json
function getCategoryName(folderPath) {
  try {
    // 兼容：在构建时 process.cwd() 是根目录
    const metaPath = path.join(process.cwd(), 'src/content/docs', folderPath, '_meta.json');
    if (fs.existsSync(metaPath)) {
      const data = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return data.name || null;
    }
  } catch (e) {
    // 忽略错误，静默失败
  }
  return null;
}

/**
 * 获取指定 library 子目录下的所有文章
 * @param {string} subdir - 例如 'library/books'
 */
export async function getLibraryItems(subdir) {
  const allDocs = await getCollection('docs');
  
  // 1. 筛选出属于该目录的文档 (且排除 index.mdx 自身)
  const items = allDocs.filter(doc => 
    doc.id.startsWith(`${subdir}/`) && !doc.id.endsWith('index.mdx')
  );

  // 2. 处理每一篇文章
  const processedItems = items.map(doc => {
    // doc.id: library/books/ethical-slut/part-1/chapter-1
    // relativeId: ethical-slut/part-1/chapter-1
    const relativeId = doc.id.replace(`${subdir}/`, '');
    
    // 提取第一段作为 key: ethical-slut
    const folderKey = relativeId.split('/')[0];
    
    // 查找 _meta.json 获取中文名
    const fullFolderPath = `${subdir}/${folderKey}`;
    const categoryName = getCategoryName(fullFolderPath) || folderKey; 

    return {
      id: doc.id,
      title: doc.data.title,
      // 如果没有 lastUpdated，使用当前时间作为兜底 (建议开启 git 集成)
      date: doc.data.lastUpdated || new Date(), 
      link: `/${doc.slug}`,
      category: categoryName,
      folderKey: folderKey
    };
  });

  // 3. 按日期倒序排列 (最新的在前面)
  return processedItems.sort((a, b) => new Date(b.date) - new Date(a.date));
}
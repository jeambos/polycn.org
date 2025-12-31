// scripts/gen-map.js
import fs from 'node:fs';
import path from 'node:path';

// 1. 扫描真正的 Wiki 页面目录
const WIKI_DIR = path.join(import.meta.dirname, '../src/content/docs/wiki');
const MAP_OUTPUT = path.join(import.meta.dirname, '../src/content/wiki-map.json');

function generateMap() {
  console.log('🗺️  开始扫描 Wiki 页面建立索引...');

  if (!fs.existsSync(WIKI_DIR)) {
    console.error('❌ Wiki 目录不存在');
    return;
  }

  // 递归获取所有 .mdx 文件 (包括子目录)
  const files = getAllFiles(WIKI_DIR).filter(f => f.endsWith('.mdx') && !f.endsWith('index.mdx'));
  
  const aliasMap = {};
  const slugList = [];

  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 从 Frontmatter 提取 title 和 keywords
    const titleMatch = content.match(/^title:\s*(.+)$/m);
    const keywordsMatch = content.match(/^keywords:\s*\[(.*?)\]/m);
    
    // 计算 slug (相对于 wiki 目录的路径，去掉 .mdx)
    // 例如: concepts/nre.mdx -> concepts/nre (如果是扁平结构则只是 nre)
    const relativePath = path.relative(WIKI_DIR, filePath);
    const slug = relativePath.replace(/\\/g, '/').replace(/\.mdx$/, '');

    if (titleMatch) {
      slugList.push(slug);
      
      // 1. 处理主标题: "多边恋 (Polyamory)"
      let titleRaw = titleMatch[1].trim();
      
      // 提取中文名作为别名
      // 如果标题是 "中文 (English)" 格式
      const parensMatch = titleRaw.match(/^(.+?)\s*[（(](.+?)[)）]$/);
      if (parensMatch) {
        const titleCN = parensMatch[1].trim();
        const titleEN = parensMatch[2].trim();
        addToMap(aliasMap, titleCN, slug);
        addToMap(aliasMap, titleEN, slug);
      } else {
        // 只有一种语言
        addToMap(aliasMap, titleRaw, slug);
      }

      // 2. 处理 Keywords (别名)
      if (keywordsMatch) {
        const keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k);
        keywords.forEach(key => addToMap(aliasMap, key, slug));
      }
    }
  });

  // 保存
  fs.writeFileSync(MAP_OUTPUT, JSON.stringify({ aliases: aliasMap, slugs: slugList }, null, 2));
  console.log(`✅ 索引生成完毕！扫描了 ${files.length} 个文件，包含 ${Object.keys(aliasMap).length} 个别名入口。`);
}

// 辅助：递归读取文件
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// 辅助：添加映射 (自动处理小写)
function addToMap(map, key, value) {
  if (!key) return;
  map[key] = value;
  map[key.toLowerCase()] = value;
}

generateMap();
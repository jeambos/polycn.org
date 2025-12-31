// scripts/build-wiki-full.js
import fs from 'node:fs';
import path from 'node:path';

// === 1. 配置路径 ===
const DIR_ROOT = import.meta.dirname;
const FILE_ENTRIES = path.join(DIR_ROOT, '../wiki_source/entries.md');
const DIR_GLOSSARY = path.join(DIR_ROOT, '../wiki_source'); // 扫描该目录下的 glossary*.md
const DIR_LIBRARY = path.join(DIR_ROOT, '../src/content/docs/library'); // 扫描文章
const DIR_OUTPUT = path.join(DIR_ROOT, '../src/content/docs/wiki');

// === 2. 配置映射 ===
const CATEGORY_MAP = {
  concepts: { name: '基础概念', link: '/wiki/concepts' },
  forms: { name: '关系形式', link: '/wiki/forms' },
  practices: { name: '关系实践', link: '/wiki/practices' },
  psychology: { name: '情绪与心理', link: '/wiki/psychology' },
  communication: { name: '沟通与冲突', link: '/wiki/communication' },
  sexuality: { name: '性与身体', link: '/wiki/sexuality' },
  society: { name: '社会与处境', link: '/wiki/society' },
  risks: { name: '风险与退出', link: '/wiki/risks' },
};

const INFO_MAP = {
  stub: { type: 'caution', title: '🚧 建设中', text: '本词条仍在扩充中，欢迎提交贡献。' },
  warning: { type: 'danger', title: '💔 创伤触发预警', text: '本页面包含可能引发不适的内容（如PUA、暴力），请在身心稳定时阅读。' },
  ai: { type: 'note', title: '🤖 AI 辅助', text: '本词条摘要由 AI 辅助生成，经过人工校对。' }
};

// === 主程序 ===
async function main() {
  console.log('🚀 开始全量构建 Wiki...');

  // 1. 建立内存数据库
  // Key = slug (polyamory)
  // Value = { titleEN, titleCN, keywords: [], category, info, lead, definitions: [], related: [] }
  const wikiDB = {};

  // === 步骤一：读取 entries.md (骨架与摘要) ===
  if (fs.existsSync(FILE_ENTRIES)) {
    console.log('📖 读取 entries.md...');
    const content = fs.readFileSync(FILE_ENTRIES, 'utf-8');
    parseAndMerge(content, wikiDB, 'entry');
  } else {
    console.warn('⚠️ 未找到 entries.md，将仅使用术语表生成。');
  }

  // === 步骤二：读取 glossary (定义注入) ===
  const glossaryFiles = fs.readdirSync(DIR_GLOSSARY).filter(f => f.startsWith('glossary') && f.endsWith('.md'));
  console.log(`📚 读取 ${glossaryFiles.length} 个术语表文件...`);
  
  for (const file of glossaryFiles) {
    const filePath = path.join(DIR_GLOSSARY, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    // 解析 Frontmatter 获取书名信息
    const { meta, body } = splitFrontmatter(content);
    
    parseAndMerge(body, wikiDB, 'glossary', meta);
  }

  // === 步骤三：扫描 Library (关联挖掘) ===
  console.log('🔍 扫描 Library 文章关联...');
  const libraryPosts = scanLibrary(DIR_LIBRARY);
  
  for (const slug in wikiDB) {
    const entry = wikiDB[slug];
    // 匹配逻辑：如果文章 tags 包含当前词条的 titleCN, titleEN 或 keywords 之一
    const searchTerms = new Set([entry.titleCN, entry.titleEN, ...entry.keywords]);
    
    entry.related = libraryPosts.filter(post => {
      return post.tags.some(tag => {
         // 简单的模糊匹配或精确匹配
         return searchTerms.has(tag) || searchTerms.has(tag.toLowerCase());
      });
    });
  }

  // === 步骤四：渲染与写入 ===
  if (!fs.existsSync(DIR_OUTPUT)) fs.mkdirSync(DIR_OUTPUT, { recursive: true });

  let count = 0;
  for (const slug in wikiDB) {
    const entry = wikiDB[slug];
    const mdxContent = renderMDX(entry);
    fs.writeFileSync(path.join(DIR_OUTPUT, `${slug}.mdx`), mdxContent);
    count++;
  }

  console.log(`✅ 构建完成！共生成 ${count} 个词条。`);
}

// === 核心逻辑：通用解析器 ===
// 能够解析 entries.md 和 glossary.md 的共有格式： ### Title (Alias) \n Key:Value \n Body
function parseAndMerge(fileContent, db, type, bookMeta = {}) {
  const sections = fileContent.split(/^###\s+/m).slice(1);

  for (const section of sections) {
    const firstLineEnd = section.indexOf('\n');
    const headerRaw = firstLineEnd === -1 ? section : section.slice(0, firstLineEnd).trim();
    let bodyRaw = firstLineEnd === -1 ? '' : section.slice(firstLineEnd).trim();

    // 解析标题: Polyamory (多边恋 Poly)
    const match = headerRaw.match(/^(.+?)\s*(?:[（(](.+?)[)）])?$/);
    if (!match) continue;

    const titleEN = match[1].trim();
    const aliasesRaw = match[2] ? match[2].trim() : '';
    const slug = titleEN.toLowerCase().replace(/\s+/g, '-');
    const keywords = aliasesRaw.split(/\s+/).filter(k => k);
    const titleCN = keywords.length > 0 ? keywords[0] : titleEN;

    // 初始化对象
    if (!db[slug]) {
      db[slug] = {
        slug, titleEN, titleCN,
        keywords: [titleEN, ...keywords],
        category: null,
        info: null,
        lead: '',
        definitions: [],
        related: []
      };
    } else {
      // 合并关键词
      keywords.forEach(k => {
        if (!db[slug].keywords.includes(k)) db[slug].keywords.push(k);
      });
    }

    const entry = db[slug];

    if (type === 'entry') {
      // 解析 entries.md 特有的属性块 (category: xxx)
      // 简单逻辑：读取开头几行看有没有 key: value
      const lines = bodyRaw.split('\n');
      let bodyStartIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // 检查属性行
        if (line.startsWith('category:')) {
          entry.category = line.replace('category:', '').trim();
        } else if (line.startsWith('info:')) {
          entry.info = line.replace('info:', '').trim();
        } else if (line.startsWith('tags:')) { // 你的 tags 字段，合并入 keywords
           const tagsStr = line.replace('tags:', '').replace(/[\[\]]/g, '');
           tagsStr.split(/[,，]/).map(t=>t.trim()).forEach(t => {
             if(t && !entry.keywords.includes(t)) entry.keywords.push(t);
           });
        } else {
          // 遇到第一行非属性行，停止解析属性，后面都是正文
          bodyStartIndex = i;
          break;
        }
      }
      entry.lead = lines.slice(bodyStartIndex).join('\n').trim();

    } else if (type === 'glossary') {
      // 注入定义
      if (bodyRaw) {
        entry.definitions.push({
          book: bookMeta.book || '未知书籍',
          author: bookMeta.author,
          year: bookMeta.year,
          content: bodyRaw
        });
      }
    }
  }
}

// === 渲染器 ===
function renderMDX(entry) {
  const { titleCN, titleEN, keywords, category, info, lead, definitions, related } = entry;
  
  // 1. Frontmatter
  const frontmatter = [
    '---',
    `title: ${titleCN} (${titleEN})`,
    `description: ${titleCN}的定义与解析。`,
    `keywords: [${keywords.join(', ')}]`,
    `sidebar:`,
    `  hidden: true`,
    '---'
  ].join('\n');

  // 2. Info Callout
  let infoBlock = '';
  if (info && INFO_MAP[info]) {
    const { type, title, text } = INFO_MAP[info];
    infoBlock = `:::${type}[${title}]\n${text}\n:::\n\n`;
  }

  // 3. Lead (Abstract)
  const leadBlock = lead ? `${lead}\n\n` : '';

  // 4. Definitions
  let defsBlock = '';
  if (definitions.length > 0) {
    defsBlock = `## 定义汇编\n\n` + definitions.map(def => {
      let source = `**《${def.book}》**`;
      if (def.author) source += ` / *${def.author} (${def.year})*`;
      // 处理引用格式
      const quote = def.content.split('\n').map(l => l.trim() ? `> ${l}` : '>').join('\n');
      return `${source}\n\n${quote}`;
    }).join('\n\n') + '\n\n';
  }

  // 5. Related Links
  let relatedBlock = '';
  if (related.length > 0) {
    relatedBlock = `## 本站相关内容\n\n` + related.map(post => {
      return `* [${post.title}](${post.link})`;
    }).join('\n') + '\n\n';
  }

  // 6. Footer Category
  let footerBlock = '';
  if (category && CATEGORY_MAP[category]) {
    const cat = CATEGORY_MAP[category];
    footerBlock = `---\n\n[📚 返回分类：${cat.name}](${cat.link})`;
  }

  return `${frontmatter}\n\n${infoBlock}${leadBlock}${defsBlock}${relatedBlock}${footerBlock}\n`;
}

// === 辅助：扫描 Library 标签 ===
function scanLibrary(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const files = getAllFiles(dir);
  for (const filePath of files) {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) continue;
    if (filePath.endsWith('index.mdx')) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const { meta } = splitFrontmatter(content);
    
    if (meta.title) {
      // 提取 tags: [a, b] 或 tags:\n - a
      // 简化处理：假设 tags 是数组格式或 YAML 列表。
      // 这里用正则简单提取一下，不做完整 YAML 解析
      let tags = [];
      if (meta.tags) {
         // 粗暴解析 [a, b]
         tags = meta.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim()).filter(t=>t);
      }
      
      // 生成相对链接
      // 假设 dir = src/content/docs/library
      // filePath = src/content/docs/library/books/xxx.md
      // link = /library/books/xxx
      const relPath = path.relative(path.join(DIR_ROOT, '../src/content/docs'), filePath);
      const link = '/' + relPath.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');

      results.push({ title: meta.title, link, tags });
    }
  }
  return results;
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(file => {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, file));
    }
  });
  return arrayOfFiles;
}

function splitFrontmatter(text) {
  const match = text.match(/^---\s*[\r\n]+([\s\S]+?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  
  const meta = {};
  match[1].split(/\r?\n/).forEach(line => {
    const idx = line.indexOf(':');
    if (idx !== -1) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return { meta, body: match[2] };
}

// 执行
main();
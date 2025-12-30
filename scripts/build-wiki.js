// scripts/build-wiki.js
const fs = require('fs');
const path = require('path');

// === 配置区域 ===
const SOURCE_DIR = path.join(__dirname, '../wiki_source'); // 输入目录
const OUTPUT_DIR = path.join(__dirname, '../src/content/docs/wiki'); // 输出目录 (建议放在 wiki 下的子目录，如 entries)

// === 主逻辑 ===

async function buildWiki() {
  console.log('🚀 开始构建 Wiki...');

  // 1. 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. 初始化数据库 (内存中)
  // 结构: { "polyamory": { titleCN, titleEN, keywords: [], definitions: [] } }
  const wikiDB = {};

  // 3. 读取源文件
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ 错误：找不到源目录 ${SOURCE_DIR}`);
    return;
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(file => file.endsWith('.md'));
  console.log(`📂 发现 ${files.length} 个源文件，开始解析...`);

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析文件：分离 Frontmatter 和 正文
    const { meta, body } = parseFrontmatter(content);
    
    if (!body) continue;

    // 解析正文中的词条 (按 ### 分割)
    // 技巧：用 split 切分，第一部分通常是空的或者文件介绍，跳过
    const sections = body.split(/^###\s+/m).slice(1);

    for (const section of sections) {
      // 分离 标题行 和 内容
      const firstLineEnd = section.indexOf('\n');
      const headerRaw = firstLineEnd === -1 ? section : section.slice(0, firstLineEnd).trim();
      const definitionContent = firstLineEnd === -1 ? '' : section.slice(firstLineEnd).trim();

      // === 关键：解析标题行 (兼容中英文括号) ===
      // 正则逻辑：
      // 1. (.+?)  -> 捕获前面的英文名
      // 2. [（(]  -> 匹配中文或英文左括号
      // 3. (.+?)  -> 捕获括号内的别名内容
      // 4. [)）]  -> 匹配中文或英文右括号
      const match = headerRaw.match(/^(.+?)\s*(?:[（(](.+?)[)）])?$/);

      if (match) {
        const titleEN = match[1].trim(); // 例如: compersion
        const aliasesRaw = match[2] ? match[2].trim() : ''; // 例如: 同乐 同喜 共喜
        
        // 生成 Slug (文件名): 转小写，空格变短横线
        const slug = titleEN.toLowerCase().replace(/\s+/g, '-');

        // 处理别名：按空格分割
        const keywords = aliasesRaw.split(/\s+/).filter(k => k);
        const titleCN = keywords.length > 0 ? keywords[0] : titleEN; // 第一个别名作为中文标准名

        // 初始化词条对象 (如果不存在)
        if (!wikiDB[slug]) {
          wikiDB[slug] = {
            titleEN,
            titleCN,
            keywords: [titleEN, ...keywords], // 把英文名也加入搜索关键词
            definitions: []
          };
        }

        // 添加定义
        if (definitionContent) {
          wikiDB[slug].definitions.push({
            book: meta.book || '未知书籍',
            author: meta.author || '',
            year: meta.year || '',
            link: meta.link || '',
            content: definitionContent
          });
        }
      }
    }
  }

  // 4. 生成 .mdx 文件
  let count = 0;
  for (const slug in wikiDB) {
    const entry = wikiDB[slug];
    const fileName = `${slug}.mdx`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    // 构造 Frontmatter
    const frontmatter = [
      '---',
      `title: ${entry.titleCN} (${entry.titleEN})`,
      `description: ${entry.titleCN}的定义汇编。`,
      `keywords: [${entry.keywords.join(', ')}]`,
      `sidebar:`,
      `  label: ${entry.titleCN} (${entry.titleEN})`,
      '---'
    ].join('\n');

    // 构造正文
    const definitionsText = entry.definitions.map(def => {
      const sourceInfo = `《${def.book}》${def.author ? ` (${def.author}, ${def.year})` : ''}`;
      // 如果有链接，给书名加链接
      // const sourceLink = def.link ? `[${sourceInfo}](${def.link})` : sourceInfo; 
      // 既然你希望格式简洁，我们暂不加链接，或者你可以按需把下面这行解注
      
      return `${sourceInfo} 认为，${entry.titleEN} 是：\n\n> ${def.content.replace(/\n/g, '\n> ')}`; 
      // replace 是为了让多段落引用也能正确显示引用线
    }).join('\n\n');

    const fileContent = `${frontmatter}\n\n这里是 ${entry.titleCN} 的 wiki 页面。\n\n## 定义汇编\n\n${definitionsText}\n`;

    fs.writeFileSync(outputPath, fileContent);
    count++;
  }

  console.log(`🎉 构建完成！已处理 ${files.length} 个源文件，生成了 ${count} 个 Wiki 词条。`);
}

// 辅助函数：简易解析 frontmatter (不依赖第三方库)
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };

  const metaRaw = match[1];
  const body = match[2];
  const meta = {};

  metaRaw.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      meta[key] = value;
    }
  });

  return { meta, body };
}

buildWiki();
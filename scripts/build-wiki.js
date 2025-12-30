// scripts/build-wiki.js
import fs from 'node:fs';
import path from 'node:path';

// === 配置区域 ===
// Node v22 可以直接使用 import.meta.dirname 获取当前目录
const SOURCE_DIR = path.join(import.meta.dirname, '../wiki_source'); 
const OUTPUT_DIR = path.join(import.meta.dirname, '../src/content/docs/wiki'); 

// === 主逻辑 ===

async function buildWiki() {
  console.log('🚀 开始构建 Wiki...');

  // 1. 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 2. 初始化数据库 (内存中)
  const wikiDB = {};

  // 3. 读取源文件
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ 错误：找不到源目录 ${SOURCE_DIR}`);
    // 如果目录不存在，先创建它，避免报错
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    console.log(`✅ 已自动创建源目录，请放入 markdown 文件后重试。`);
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
    const sections = body.split(/^###\s+/m).slice(1);

    for (const section of sections) {
      const firstLineEnd = section.indexOf('\n');
      const headerRaw = firstLineEnd === -1 ? section : section.slice(0, firstLineEnd).trim();
      const definitionContent = firstLineEnd === -1 ? '' : section.slice(firstLineEnd).trim();

      // === 关键：解析标题行 (兼容中英文括号) ===
      const match = headerRaw.match(/^(.+?)\s*(?:[（(](.+?)[)）])?$/);

      if (match) {
        const titleEN = match[1].trim(); 
        const aliasesRaw = match[2] ? match[2].trim() : ''; 
        
        const slug = titleEN.toLowerCase().replace(/\s+/g, '-');
        const keywords = aliasesRaw.split(/\s+/).filter(k => k);
        const titleCN = keywords.length > 0 ? keywords[0] : titleEN; 

        if (!wikiDB[slug]) {
          wikiDB[slug] = {
            titleEN,
            titleCN,
            keywords: [titleEN, ...keywords], 
            definitions: []
          };
        }

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
      // 目标格式：**《书名》** / *作者 （年份）*
      let sourceInfo = `**《${def.book}》**`;
      
      if (def.author) {
        sourceInfo += ` / *${def.author}`;
        if (def.year) {
          sourceInfo += ` （${def.year}）`; // 使用全角括号
        }
        sourceInfo += `*`; // 结束斜体
      }
      
      // 处理引用块：确保多段落引用每行都有 >
      const quotedContent = def.content.split('\n').map(line => line.trim() ? `> ${line}` : '>').join('\n');
      
      return `${sourceInfo}\n\n${quotedContent}`; 
    }).join('\n\n');

    const fileContent = `${frontmatter}\n\n这里是 ${entry.titleCN} 的 wiki 页面。\n\n## 定义汇编\n\n${definitionsText}\n`;

    fs.writeFileSync(outputPath, fileContent);
    count++;
  }

  console.log(`🎉 构建完成！已处理 ${files.length} 个源文件，生成了 ${count} 个 Wiki 词条。`);
}

// 辅助函数：健壮的 Frontmatter 解析 (兼容 Windows \r\n 和 Mac/Linux \n)
function parseFrontmatter(text) {
  // 正则解释：
  // ^---\s*[\r\n]+  -> 匹配开头的 ---，允许后面有空格，必须换行
  // ([\s\S]+?)      -> 捕获中间的 meta 内容 (非贪婪)
  // [\r\n]+---\s* -> 匹配结束的 ---，允许前面有换行，后面有空格
  // [\r\n]+         -> 必须换行后才是正文
  // ([\s\S]*)       -> 捕获剩下的正文
  const match = text.match(/^---\s*[\r\n]+([\s\S]+?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/);
  
  if (!match) {
    // 调试信息：如果你发现还有文件解析失败，控制台会告诉你
    if (text.trim().startsWith('---')) {
      console.warn('⚠️ 警告：发现疑似 Frontmatter 但解析失败，请检查 --- 后面是否有奇怪的字符。');
    }
    return { meta: {}, body: text };
  }

  const metaRaw = match[1];
  const body = match[2];
  const meta = {};

  // 按行分割，兼容 \r\n
  metaRaw.split(/\r?\n/).forEach(line => {
    // 找到第一个冒号的位置
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key && value) {
        meta[key] = value;
      }
    }
  });

  return { meta, body };
}

buildWiki();
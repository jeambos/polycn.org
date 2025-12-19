import os

# 设置你的文档目录
DOCS_DIR = r'src/content/docs'

def add_frontmatter():
    for root, dirs, files in os.walk(DOCS_DIR):
        for file in files:
            if file.endswith('.md') or file.endswith('.mdx'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 检查是否已经有 Frontmatter
                if content.strip().startswith('---'):
                    print(f"[跳过] 已存在: {file}")
                    continue

                # 尝试获取标题
                lines = content.split('\n')
                title = ""
                
                # 策略1: 提取第一行如果是 # 开头
                if lines and lines[0].startswith('# '):
                    title = lines[0].replace('# ', '').strip()
                    # 移除原有的 # 标题行，避免页面重复
                    content = '\n'.join(lines[1:]).strip()
                else:
                    # 策略2: 使用文件名（去掉扩展名）
                    title = os.path.splitext(file)[0]
                    # 如果文件名是 intro 或 index，尝试用文件夹名
                    if title in ['intro', 'index']:
                        title = os.path.basename(root)

                # 构造新的内容
                new_content = f"---\ntitle: {title}\n---\n\n{content}"

                # 写入文件
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"[修改] 已添加标题 '{title}': {file}")

if __name__ == '__main__':
    add_frontmatter()
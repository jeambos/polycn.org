// --- 自动随机做题脚本 (适用于 Norms/Adaption/OpenOrNot 等量表题) ---

(function autoFillQuiz() {
  console.log("🚀 自动做题脚本启动...");

  const timer = setInterval(() => {
    // 1. 检查是否已到达结果页 (通过查找结果页特有的元素)
    const resultHeader = document.querySelector('h2'); 
    // 简单判断：如果标题包含"报告"或"结果"，或者找不到下一页按钮了
    const nextBtn = document.getElementById('qz-next-btn');
    
    if (!nextBtn || (resultHeader && resultHeader.innerText.includes("报告"))) {
      console.log("✅ 问卷已完成，停止脚本。");
      clearInterval(timer);
      return;
    }

    // 2. 获取当前页面所有可见的选项按钮 (五点量表)
    // 我们的组件中，量表按钮有类名 .qz-scale-btn
    const allButtons = Array.from(document.querySelectorAll('.qz-scale-btn'));

    if (allButtons.length > 0) {
      // 3. 按每题 5 个选项分组进行随机点击
      // 量表题固定是 5 个选项一组
      for (let i = 0; i < allButtons.length; i += 5) {
        // 确保这组按钮是属于同一题的 (防止切页时 DOM 变动导致的越界)
        const questionGroup = allButtons.slice(i, i + 5);
        if (questionGroup.length === 5) {
          // 随机选一个 (0-4)
          const randomIndex = Math.floor(Math.random() * 5);
          // 模拟点击
          questionGroup[randomIndex].click();
        }
      }
      console.log(`🤖 已随机填写本页 ${allButtons.length / 5} 道题`);
    }

    // 4. 点击“下一页”或“查看结果”
    // 稍微延迟一下，让 React 状态更新和动画跑完，避免点太快被震动回弹
    setTimeout(() => {
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
        console.log("➡️ 点击下一页...");
      }
    }, 200);

  }, 800); // 每 800ms 执行一次循环，给页面滚动和渲染留时间
})();
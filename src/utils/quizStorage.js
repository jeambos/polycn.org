// src/utils/quizStorage.js

const STORAGE_KEY = 'poly_user_records';

export const QuizStorage = {
  // 1. 保存测试结果
  saveResult: (quizId, resultData) => {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      // 更新该测试的记录
      current[quizId] = {
        ...resultData,
        timestamp: Date.now(), // 记录时间
        isCompleted: true
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      console.log(`[Storage] Saved result for ${quizId}`);
    } catch (e) {
      console.error("保存失败", e);
    }
  },

  // 2. 获取所有记录 (用于生成档案)
  getAllRecords: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  },

  // 3. 获取单个记录 (用于回显)
  getRecord: (quizId) => {
    const records = QuizStorage.getAllRecords();
    return records[quizId] || null;
  },

  // 4. 清空数据 (隐私功能)
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    // 同时也清除中间进度
    Object.keys(localStorage).forEach(k => {
      if(k.startsWith('quiz_progress_')) localStorage.removeItem(k);
    });
    alert("所有本地测试数据已清除");
    window.location.reload();
  }
};
import React, { useState, useMemo, useEffect } from 'react';
import '../../../styles/Quiz.css';
import QuestionCard from './QuestionCard';

/**
 * 问卷分页与逻辑控制器
 * @param {Array} questions - 题目数组
 * @param {function} onFinish - 完成回调 (answers) => void
 * @param {string} mode - 'list'(默认) | 'single'
 * @param {number} perPage - 列表模式下每页题目数 (默认10)
 * @param {function} getNextQuestionId - (选填) 单题模式下的跳转逻辑 (currentId, answer) => nextId
 */
const QuizPager = ({ 
  questions, 
  onFinish, 
  mode = 'list', 
  perPage = 10,
  getNextQuestionId 
}) => {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); // list: 页码; single: 题号
  const [history, setHistory] = useState([]); // single: 历史栈(用于回退)
  const [shakeBtn, setShakeBtn] = useState(false);

  // ------------------------------------------------
  // 滚动辅助函数
  // ------------------------------------------------
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToNextUnansweredOrButton = (currentQId, currentQs) => {
    // 1. 找当前页里，位于当前题之后的第一个空题
    const currentIndexInPage = currentQs.findIndex(q => q.id === currentQId);
    const nextUnanswered = currentQs.slice(currentIndexInPage + 1).find(q => answers[q.id] === undefined);
    
    if (nextUnanswered) {
      scrollToId(`q-${nextUnanswered.id}`);
    } else {
      // 2. 如果都做完了，滚动到下一页按钮
      scrollToId('qz-next-btn');
    }
  };

  // ------------------------------------------------
  // 答题处理
  // ------------------------------------------------
  const handleAnswer = (qId, val, currentQs) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [qId]: val };
      return newAnswers;
    });

    // 仅在列表模式下触发自动滚动
    if (mode === 'list') {
      // 稍微延迟一点，让用户看到选中效果
      setTimeout(() => {
        scrollToNextUnansweredOrButton(qId, currentQs);
      }, 300);
    }
  };

  // ------------------------------------------------
  // 导航逻辑：下一页 / 下一题
  // ------------------------------------------------
  const handleNext = () => {
    // 1. 校验逻辑
    let currentQs = [];
    if (mode === 'list') {
      const start = currentIndex * perPage;
      currentQs = questions.slice(start, start + perPage);
    } else {
      currentQs = [questions[currentIndex]]; // 单题模式
    }

    const firstUnanswered = currentQs.find(q => answers[q.id] === undefined);

    if (firstUnanswered) {
      setShakeBtn(true);
      setTimeout(() => setShakeBtn(false), 500);
      scrollToId(`q-${firstUnanswered.id}`); // 滚到没做的那题
      return;
    }

    // 2. 跳转逻辑
    if (mode === 'list') {
      // List Mode: 简单翻页
      const totalPages = Math.ceil(questions.length / perPage);
      if (currentIndex < totalPages - 1) {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        onFinish(answers);
      }
    } else {
      // Single Mode: 支持条件跳转
      const currentQ = questions[currentIndex];
      const nextId = getNextQuestionId ? getNextQuestionId(currentQ.id, answers[currentQ.id]) : null;
      
      let nextIndex = -1;
      if (nextId) {
        nextIndex = questions.findIndex(q => q.id === nextId);
      } else {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex < questions.length && nextIndex !== -1) {
        setHistory(prev => [...prev, currentIndex]); // 入栈
        setCurrentIndex(nextIndex);
        window.scrollTo(0, 0);
      } else {
        onFinish(answers);
      }
    }
  };

  // ------------------------------------------------
  // 导航逻辑：上一页 / 上一题
  // ------------------------------------------------
  const handlePrev = () => {
    if (mode === 'list') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        window.scrollTo(0, 0);
      }
    } else {
      if (history.length > 0) {
        const prevIndex = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1)); // 出栈
        setCurrentIndex(prevIndex);
        window.scrollTo(0, 0);
      } else if (currentIndex > 0) {
        // Fallback if no history (linear)
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  // ------------------------------------------------
  // 渲染计算
  // ------------------------------------------------
  const visibleQuestions = useMemo(() => {
    if (mode === 'list') {
      const start = currentIndex * perPage;
      return questions.slice(start, start + perPage);
    } else {
      return [questions[currentIndex]];
    }
  }, [questions, currentIndex, mode, perPage]);

  // 进度条计算
  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
  
  const isFirstPage = mode === 'list' ? currentIndex === 0 : (currentIndex === 0 && history.length === 0);
  const isLastStep = mode === 'list' 
    ? currentIndex === Math.ceil(questions.length / perPage) - 1 
    : currentIndex === questions.length - 1; // 单题模式的“最后”比较模糊，通常由跳转逻辑决定，这里仅做简单参考

  return (
    <div>
      {/* 顶部进度条 (可选，通过Portal或Context传出去更好，这里先简单内置) */}
      {/* ✅ 新增：内置进度条 */}
      <div className="qz-progress-track">
        <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      {/* 如果外层 QuizContainer 已经有了进度条，这里可以不渲染，或者配合使用 */}
      
      {/* 题目列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {visibleQuestions.map(q => (
          <QuestionCard
            key={q.id}
            id={`q-${q.id}`}
            question={q}
            value={answers[q.id]}
            onChange={(val) => handleAnswer(q.id, val, visibleQuestions)}
          />
        ))}
      </div>

      {/* 底部导航栏 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
        {!isFirstPage && (
          <button onClick={handlePrev} className="qz-btn-outline">
            {mode === 'list' ? '上一页' : '上一题'}
          </button>
        )}
        
        <button 
          id="qz-next-btn"
          onClick={handleNext} 
          className={`qz-btn-primary ${shakeBtn ? 'qz-shake' : ''}`}
        >
          {isLastStep ? "查看结果" : (mode === 'list' ? "下一页" : "下一题")}
        </button>
      </div>
    </div>
  );
};

export default QuizPager;
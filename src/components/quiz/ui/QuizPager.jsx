import React, { useState, useMemo, useEffect } from 'react';
import '../../../styles/Quiz.css';
import QuestionCard from './QuestionCard';

/**
 * 问卷分页与逻辑控制器
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
  const [history, setHistory] = useState([]); // single: 历史栈
  const [shakeBtn, setShakeBtn] = useState(false);
  
  // ✅ 新增：专门控制辅助文字显示在哪一题
  const [activeLabelId, setActiveLabelId] = useState(null);

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

  // ------------------------------------------------
  // 逻辑 A: 页面加载/切换时，定位到第一个未作答
  // ------------------------------------------------
  useEffect(() => {
    // 找本页第一个没做的
    const firstUnanswered = visibleQuestions.find(q => answers[q.id] === undefined);
    
    if (firstUnanswered) {
      setActiveLabelId(firstUnanswered.id);
    } else {
      // 需求3: 如果都做完了(找不到unanswer)，不要清空，停留在本页最后一题
      // 这样能保持高度，防止布局塌缩
      if (visibleQuestions.length > 0) {
        setActiveLabelId(visibleQuestions[visibleQuestions.length - 1].id);
      }
    }
    // 注意：这里依赖 visibleQuestions 变化（翻页时触发），而不依赖 answers
    // 这样答题时不会强制跳回“第一个未作答”
  }, [visibleQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------
  // 滚动辅助
  // ------------------------------------------------
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToNextUnansweredOrButton = (targetId) => {
    // 这里的 targetId 是我们要去的那一题
    if (targetId) {
      scrollToId(`q-${targetId}`);
    } else {
      scrollToId('qz-next-btn');
    }
  };

  // ------------------------------------------------
  // 答题处理
  // ------------------------------------------------
  // ------------------------------------------------
  // 答题处理
  // ------------------------------------------------
  const handleAnswer = (qId, val) => {
    // 1. 更新答案状态
    setAnswers(prev => ({ ...prev, [qId]: val }));

    // 2. 逻辑 B (修复版): 做题后，智能跳过已答题目
    const currentQIndex = visibleQuestions.findIndex(q => q.id === qId);
    
    // 从当前题目的【下一题】开始，向后查找第一个【在 answers 里没有值】的题目
    // 注意：此时 answers 变量还是旧闭包中的值，但这不影响查找“后续”题目
    const nextUnansweredQ = visibleQuestions
      .slice(currentQIndex + 1)
      .find(q => answers[q.id] === undefined);

    if (nextUnansweredQ) {
      // 场景 1: 后面还有没写的题 -> 标签移过去，屏幕滚过去
      setActiveLabelId(nextUnansweredQ.id);
      
      if (mode === 'list') {
        setTimeout(() => scrollToNextUnansweredOrButton(nextUnansweredQ.id), 300);
      }
    } else {
      // 场景 2: 本页后续题目都写完了 -> 滚到底部按钮
      // 此时 activeLabelId 保持在当前题即可，或者不做处理
      if (mode === 'list') {
        setTimeout(() => scrollToNextUnansweredOrButton(null), 300);
      }
    }
  };

  // ------------------------------------------------
  // 导航逻辑
  // ------------------------------------------------
  const handleNext = () => {
    // 逻辑 C (需求1): 提交答案(点击下一页)时，如果校验失败，回到第一个未作答
    const firstUnanswered = visibleQuestions.find(q => answers[q.id] === undefined);

    if (firstUnanswered) {
      setShakeBtn(true);
      setTimeout(() => setShakeBtn(false), 500);
      
      // 核心：不仅滚动，标签也要移过去，提示用户“这里没填”
      setActiveLabelId(firstUnanswered.id);
      scrollToId(`q-${firstUnanswered.id}`);
      return;
    }

    // --- 翻页逻辑 ---
    if (mode === 'list') {
      const totalPages = Math.ceil(questions.length / perPage);
      if (currentIndex < totalPages - 1) {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        onFinish(answers);
      }
    } else {
      // Single Mode Jump Logic
      const currentQ = questions[currentIndex];
      const nextId = getNextQuestionId ? getNextQuestionId(currentQ.id, answers[currentQ.id]) : null;
      
      let nextIndex = -1;
      if (nextId) {
        nextIndex = questions.findIndex(q => q.id === nextId);
      } else {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex < questions.length && nextIndex !== -1) {
        setHistory(prev => [...prev, currentIndex]);
        setCurrentIndex(nextIndex);
        window.scrollTo(0, 0);
      } else {
        onFinish(answers);
      }
    }
  };

  const handlePrev = () => {
    if (mode === 'list') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        window.scrollTo(0, 0);
      }
    } else {
      if (history.length > 0) {
        const prevIndex = history[history.length - 1];
        setHistory(prev => prev.slice(0, -1));
        setCurrentIndex(prevIndex);
        window.scrollTo(0, 0);
      } else if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);
  const isFirstPage = mode === 'list' ? currentIndex === 0 : (currentIndex === 0 && history.length === 0);
  const isLastStep = mode === 'list' 
    ? currentIndex === Math.ceil(questions.length / perPage) - 1 
    : currentIndex === questions.length - 1;

  return (
    <div>
      {/* 进度条 */}
      <div className="qz-progress-track">
        <div className="qz-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* 题目列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {visibleQuestions.map(q => (
          <QuestionCard
            key={q.id}
            id={`q-${q.id}`}
            question={q}
            value={answers[q.id]}
            onChange={(val) => handleAnswer(q.id, val)}
            // ✅ 核心：只显示 activeLabelId 匹配的那一题
            showScaleLabels={q.id === activeLabelId}
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
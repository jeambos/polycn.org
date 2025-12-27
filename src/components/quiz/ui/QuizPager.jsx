import React, { useState, useMemo, useEffect } from 'react';
import '../../../styles/Quiz.css';
import QuestionCard from './QuestionCard';

/**
 * 简单的恢复进度提示弹窗
 */
const ResumeModal = ({ onResume, onRestart }) => (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }}>
    <div className="qz-card qz-fade-in" style={{ 
      maxWidth: '320px', textAlign: 'center', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)' 
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
      <h3 className="qz-heading-lg" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
        发现未完成的进度
      </h3>
      <p className="qz-text-body" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        您上次还有部分题目未完成，是否要恢复之前的进度？
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={onRestart}
          className="qz-btn-outline"
          style={{ flex: 1, padding: '0.6rem' }}
        >
          重新开始
        </button>
        <button 
          onClick={onResume}
          className="qz-btn-primary"
          style={{ flex: 1, padding: '0.6rem' }}
        >
          恢复进度
        </button>
      </div>
    </div>
  </div>
);

/**
 * 问卷分页与逻辑控制器 (支持本地存储恢复)
 */
const QuizPager = ({ 
  questions, 
  onFinish, 
  mode = 'list', 
  perPage = 10,
  getNextQuestionId,
  quizId // ✅ 新增：用于区分不同问卷的存储 Key
}) => {
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [history, setHistory] = useState([]); 
  const [shakeBtn, setShakeBtn] = useState(false);
  const [activeLabelId, setActiveLabelId] = useState(null);
  
  // ✅ 新增：控制恢复弹窗显示
  const [showResumeAlert, setShowResumeAlert] = useState(false);
  const [savedData, setSavedData] = useState(null);

  // ------------------------------------------------
  // 1. 初始化检查：是否有存档？
  // ------------------------------------------------
  useEffect(() => {
    if (!quizId) return; // 如果没有传 ID 就不启用缓存

    const key = `quiz_progress_${quizId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 只有当存有答案，且答案还没做完时才提示
        if (parsed && Object.keys(parsed).length > 0 && Object.keys(parsed).length < questions.length) {
          setSavedData(parsed);
          setShowResumeAlert(true);
        }
      }
    } catch (e) {
      console.error("读取存档失败", e);
    }
  }, [quizId, questions.length]);

  // ------------------------------------------------
  // 2. 自动保存：每次 answers 变化都存入
  // ------------------------------------------------
  useEffect(() => {
    if (!quizId) return;
    
    // 如果答案为空（刚开始或刚重置），不覆盖存档（除非是明确的清空操作，由外部控制）
    // 但为了简化，我们只在有值时保存
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(answers));
    }
  }, [answers, quizId]);

  // ------------------------------------------------
  // 3. 恢复与重置处理
  // ------------------------------------------------
  const handleResume = () => {
    if (savedData) {
      setAnswers(savedData);
      
      // 计算应该跳到哪一页 (找到第一个未答题)
      const firstUnansweredIdx = questions.findIndex(q => savedData[q.id] === undefined);
      if (firstUnansweredIdx !== -1) {
        // 设置页码
        const targetPage = mode === 'list' ? Math.floor(firstUnansweredIdx / perPage) : firstUnansweredIdx;
        setCurrentIndex(targetPage);
        
        // 设置焦点提示
        const targetQId = questions[firstUnansweredIdx].id;
        setActiveLabelId(targetQId);
        
        // 稍作延迟滚动，等待渲染完成
        setTimeout(() => {
          const el = document.getElementById(`q-${targetQId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
    setShowResumeAlert(false);
  };

  const handleRestart = () => {
    // 清除本地存储
    if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
    setShowResumeAlert(false);
    // 状态本身就是空的，无需额外操作
  };

  // ------------------------------------------------
  // 渲染计算 (保持原有逻辑)
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
  // 辅助效果
  // ------------------------------------------------
  useEffect(() => {
    // 仅在非恢复弹窗显示期间执行定位逻辑
    if (showResumeAlert) return;

    const firstUnanswered = visibleQuestions.find(q => answers[q.id] === undefined);
    if (firstUnanswered) {
      setActiveLabelId(firstUnanswered.id);
    } else if (visibleQuestions.length > 0) {
      setActiveLabelId(visibleQuestions[visibleQuestions.length - 1].id);
    }
  }, [visibleQuestions, showResumeAlert]); // eslint-disable-line

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToNextUnansweredOrButton = (targetId) => {
    if (targetId) {
      scrollToId(`q-${targetId}`);
    } else {
      scrollToId('qz-next-btn');
    }
  };

  // ------------------------------------------------
  // 答题处理 (包含已修正的跳题逻辑)
  // ------------------------------------------------
  const handleAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));

    const currentQIndex = visibleQuestions.findIndex(q => q.id === qId);
    
    // 向后查找第一个未答题
    const nextUnansweredQ = visibleQuestions
      .slice(currentQIndex + 1)
      .find(q => answers[q.id] === undefined); // 注意这里 answers 闭包问题不影响查找逻辑上的"后续"

    if (nextUnansweredQ) {
      setActiveLabelId(nextUnansweredQ.id);
      if (mode === 'list') {
        setTimeout(() => scrollToNextUnansweredOrButton(nextUnansweredQ.id), 300);
      }
    } else {
      if (mode === 'list') {
        setTimeout(() => scrollToNextUnansweredOrButton(null), 300);
      }
    }
  };

  // ------------------------------------------------
  // 导航逻辑
  // ------------------------------------------------
  const handleNext = () => {
    const firstUnanswered = visibleQuestions.find(q => answers[q.id] === undefined);

    if (firstUnanswered) {
      setShakeBtn(true);
      setTimeout(() => setShakeBtn(false), 500);
      setActiveLabelId(firstUnanswered.id);
      scrollToId(`q-${firstUnanswered.id}`);
      return;
    }

    if (mode === 'list') {
      const totalPages = Math.ceil(questions.length / perPage);
      if (currentIndex < totalPages - 1) {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      } else {
        // ✅ 完成时清除本地存储
        if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
        onFinish(answers);
      }
    } else {
      // Single Mode
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
        // ✅ 完成时清除本地存储
        if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
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
    <div style={{ position: 'relative' }}>
      {/* 恢复弹窗 */}
      {showResumeAlert && (
        <ResumeModal onResume={handleResume} onRestart={handleRestart} />
      )}

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
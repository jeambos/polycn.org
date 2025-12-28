import React, { useState, useMemo, useEffect } from 'react';
import '../../../styles/Quiz.css';

/**
 * 恢复进度提示弹窗 (复用)
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
        <button onClick={onRestart} className="qz-btn-outline" style={{ flex: 1, padding: '0.6rem' }}>
          重新开始
        </button>
        <button onClick={onResume} className="qz-btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
          恢复进度
        </button>
      </div>
    </div>
  </div>
);

/**
 * 情境反应分页器 (Case-Reaction Pager)
 * 逻辑：Step 1 单选 (最符合) -> Step 2 多选 (也符合) -> 下一题
 */
const CaseReactionPager = ({ 
  questions, 
  onFinish, 
  quizId 
}) => {
  const [answers, setAnswers] = useState({});
  const [qIndex, setQIndex] = useState(0); 
  const [step, setStep] = useState(1); // 1: Primary, 2: Secondary
  const [tempSecondary, setTempSecondary] = useState([]); // Step 2 临时状态
  
  // 存档相关状态
  const [showResumeAlert, setShowResumeAlert] = useState(false);
  const [savedData, setSavedData] = useState(null);

  // ------------------------------------------------
  // 1. 本地存储逻辑 (初始化)
  // ------------------------------------------------
  useEffect(() => {
    if (!quizId) return;
    const key = `quiz_progress_${quizId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // 如果有存档且未完成
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
  // 2. 自动保存
  // ------------------------------------------------
  useEffect(() => {
    if (!quizId) return;
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(answers));
    }
  }, [answers, quizId]);

  // ------------------------------------------------
  // 3. 恢复与重置
  // ------------------------------------------------
  const handleResume = () => {
    if (savedData) {
      setAnswers(savedData);
      // 跳转到第一道没做的题
      const firstUnanswered = questions.findIndex(q => !savedData[q.id]);
      if (firstUnanswered !== -1) {
        setQIndex(firstUnanswered);
      }
      setStep(1);
      setTempSecondary([]);
    }
    setShowResumeAlert(false);
  };

  const handleRestart = () => {
    if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
    setShowResumeAlert(false);
    setAnswers({});
    setQIndex(0);
    setStep(1);
  };

  // ------------------------------------------------
  // 4. 答题逻辑
  // ------------------------------------------------
  const currentQ = questions[qIndex];
  const currentPrimary = answers[currentQ.id]?.primary;

  // 构造选项列表
  const displayOptions = useMemo(() => {
    const opts = [...currentQ.options];
    if (step === 1) {
      opts.push({ dim: 'none_primary', text: '没有最符合的' });
    } else {
      // Step 2
      if (currentPrimary === 'none_primary') {
        opts.push({ dim: 'none_primary', text: '没有最符合的' });
        opts.push({ dim: 'none_secondary', text: '其余都不符合' });
      } else {
        opts.push({ dim: 'none_secondary', text: '其余都不符合' });
      }
    }
    return opts;
  }, [currentQ, step, currentPrimary]);

  const handlePrimarySelect = (dimKey) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], primary: dimKey }
    }));
    setTempSecondary([]); // 重置多选
    setStep(2); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrimaryDeselect = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], primary: null, secondary: [] }
    }));
    setTempSecondary([]);
    setStep(1);
  };

  const toggleSecondary = (dimKey) => {
    setTempSecondary(prev => {
      if (dimKey === 'none_secondary') {
        return prev.includes('none_secondary') ? [] : ['none_secondary'];
      } else {
        const newSelection = prev.includes(dimKey) 
          ? prev.filter(k => k !== dimKey)
          : [...prev, dimKey];
        return newSelection.filter(k => k !== 'none_secondary');
      }
    });
  };

  const handleNext = () => {
    // 确认保存本题完整答案
    const finalAnswer = { 
      primary: currentPrimary, 
      secondary: tempSecondary 
    };
    
    const newAnswers = { ...answers, [currentQ.id]: finalAnswer };
    setAnswers(newAnswers);

    if (qIndex < questions.length - 1) {
      setQIndex(prev => prev + 1);
      setStep(1);
      setTempSecondary([]);
      window.scrollTo(0,0);
    } else {
      // 完成
      if (quizId) localStorage.removeItem(`quiz_progress_${quizId}`);
      onFinish(newAnswers);
    }
  };

  const handlePrev = () => {
    if (qIndex > 0) {
      setQIndex(prev => prev - 1);
      setStep(1);
      setTempSecondary([]);
      window.scrollTo(0,0);
    }
  };

  // ------------------------------------------------
  // 5. 渲染
  // ------------------------------------------------
  const showPrev = qIndex > 0;
  const showNext = step === 2;
  const canGoNext = tempSecondary.length > 0; // Step 2 必须选一项才能走

  return (
    <div style={{ position: 'relative' }}>
      {showResumeAlert && (
        <ResumeModal onResume={handleResume} onRestart={handleRestart} />
      )}

      {/* 进度条 */}
      <div className="qz-progress-track">
        <div className="qz-progress-fill" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="qz-card animate-fade-in" style={{ paddingBottom: '2rem' }}>
        <h3 className="qz-heading-lg" style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--qz-primary)' }}>
          {currentQ.title}
        </h3>
        <p className="qz-text-body" style={{ fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {currentQ.scenario}
        </p>

        {/* 步骤指示器 */}
        <div style={{
          background: step === 1 ? 'var(--qz-bg-soft)' : 'var(--qz-bg-page)', 
          border: step === 1 ? '1px solid var(--qz-primary)' : '1px solid var(--qz-border)',
          color: step === 1 ? 'var(--qz-primary)' : 'var(--qz-text-main)',
          padding: '0.6rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold',
          marginBottom: '1rem', display: 'flex', gap: '0.5rem', transition: 'all 0.3s'
        }}>
          {step === 1 ? (
            <><span>Step 1:</span> 请选出 1 个<b>最刺痛你</b>的想法</>
          ) : (
            <><span>Step 2:</span> 还有哪些想法<b>也符合</b>？(可多选)</>
          )}
        </div>

        {/* 选项列表 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {displayOptions.map((opt, idx) => {
            const isPrimary = currentPrimary === opt.dim;
            const isSecondary = tempSecondary.includes(opt.dim);

            // 场景 A: Step 1 (默认状态)
            if (step === 1) {
              return (
                <div 
                  key={idx} 
                  onClick={() => handlePrimarySelect(opt.dim)}
                  style={{
                    border: '1px solid var(--qz-border)', 
                    padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    transition: 'all 0.2s', background: 'var(--qz-bg-card)'
                  }}
                  className="hover:bg-gray-50" // Tailwind utility if available, or just ignore
                >
                  <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:'2px solid var(--qz-border)' }}></div>
                  <span style={{ fontSize: '0.95rem', color: 'var(--qz-text-sub)' }}>{opt.text}</span>
                </div>
              );
            }

            // 场景 B: Step 2 - “最符合” (高亮)
            if (isPrimary) {
              return (
                <div 
                  key={idx} 
                  onClick={handlePrimaryDeselect}
                  style={{
                    background: 'var(--qz-primary)', color: 'var(--qz-primary-fg)',
                    padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)', transform: 'scale(1.01)'
                  }}
                >
                  <div style={{ width:'18px', height:'18px', borderRadius:'50%', border:'2px solid white', background:'white' }}></div>
                  <span style={{ fontSize: '0.95rem', fontWeight:'bold' }}>
                    {opt.text} <span style={{ fontSize:'0.75rem', opacity:0.8, marginLeft:'0.5rem' }}>(点击撤销)</span>
                  </span>
                </div>
              );
            }

            // 场景 C: Step 2 - “也符合” (多选)
            return (
              <div 
                key={idx} 
                onClick={() => toggleSecondary(opt.dim)}
                style={{
                  background: isSecondary ? 'var(--qz-bg-soft)' : 'var(--qz-bg-card)',
                  border: isSecondary ? '1px solid var(--qz-primary)' : '1px solid var(--qz-border)',
                  color: isSecondary ? 'var(--qz-text-soft)' : 'var(--qz-text-sub)',
                  padding: '1rem', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width:'18px', height:'18px', borderRadius:'50%', 
                  border: isSecondary ? 'none' : '2px solid var(--qz-border)',
                  background: isSecondary ? 'var(--qz-primary)' : 'transparent'
                }}></div>
                <span style={{ fontSize: '0.95rem', fontWeight: isSecondary?'bold':'normal' }}>{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部导航 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
        {showPrev ? (
          <button onClick={handlePrev} className="qz-btn-outline">
            上一题
          </button>
        ) : <div style={{width:'88px'}}></div>}
        
        {showNext && (
          <button onClick={handleNext} disabled={!canGoNext} className="qz-btn-primary">
            {qIndex === questions.length - 1 ? "查看结果" : "下一题"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseReactionPager;
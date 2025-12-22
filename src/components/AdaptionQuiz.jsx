import React, { useState, useMemo, useEffect } from 'react';
// 直接复用 Assessment 的样式
import '../styles/Assessment.css';

// =====================================================================
// 1. 数据定义：结果原型
// =====================================================================

const RESULT_TYPES = {
  surfer: {
    id: 'surfer',
    name: '🌊 激流冲浪者 (High Adaptability)',
    summary: '你拥有极高的关系适应性。就像冲浪者驾驭波浪一样，你能在复杂的情感动态中保持平衡。',
    advice: '你已经具备了构建健康非单偶关系的各项核心技能。现在的挑战是如何保持这种平衡，同时引导你的伴侣共同成长。你可以尝试挑战更深度的沟通模式，如 RADAR 盘点。',
    risks: '作为“能力者”，你可能会不知不觉承担过多的情感劳动。注意不要让伴侣过度依赖你的情绪调节能力。',
    neighbor: '你的状态非常理想，主要区别在于你比【城堡守护者】更灵活，比【海绵吸纳者】更有底线。'
  },
  guardian: {
    id: 'guardian',
    name: '🏰 城堡守护者 (Guarded/Rigid)',
    summary: '你拥有很强的原则和边界意识，这让你很安全，但也可能让你在关系中显得不够灵活。',
    advice: '安全感固然重要，但过度的防御会阻碍深度的连接。试着在安全的前提下，稍微降低一点吊桥，允许一些不可控的因素进入。练习“脆弱性表达”是你进阶的关键。',
    risks: '当规则被打破时，你容易陷入愤怒或冷战。如果伴侣需要更多的流动性，你们可能会爆发关于“控制”的冲突。',
    neighbor: '你与【激流冲浪者】的区别在于，你倾向于通过“控制环境”来获得安全感，而他们通过“调节自我”来适应环境。'
  },
  sponge: {
    id: 'sponge',
    name: '🧽 海绵吸纳者 (Low Boundaries)',
    summary: '你拥有极强的共情能力，但也因此容易边界模糊，常常因为吸收了伴侣的情绪而感到耗竭。',
    advice: '“爱不是自我牺牲”。你需要优先学习的课题是“课题分离”——分清哪些情绪是伴侣的，哪些是你的。学会温柔而坚定地说“不”，是你保护关系的最好方式。',
    risks: '容易陷入“甚至不知道自己想要什么”的状态，或因为长期委屈而突然爆发（或内爆）。',
    neighbor: '你与【易燃反应者】的区别在于，你通常是向内压抑和讨好的，而不是向外攻击的。'
  },
  reactive: {
    id: 'reactive',
    name: '🔥 易燃反应者 (High Reactivity)',
    summary: '你在关系中充满激情，但情绪的波动也较为剧烈。当需求未被满足时，你容易迅速进入防御或攻击状态。',
    advice: '你的情绪雷达很敏锐，但反应机制需要升级。在冲突发生时，试着按下“暂停键”。练习“非暴力沟通”中的“观察-感受-需要-请求”四步法，代替指责和宣泄。',
    risks: '情绪化的沟通方式容易让伴侣感到疲惫或被攻击，从而导致对方退缩（追-逃模式）。',
    neighbor: '你与【城堡守护者】的区别在于，你的防御机制是热烈的、外放的，而非冷硬的规则。'
  }
};

// =====================================================================
// 2. 题目定义 (24题，聚焦能力)
// =====================================================================
// 维度映射: 
// comms (沟通), resilience (韧性), boundaries (边界), conflict (冲突)

const QUESTIONS = [
  // --- 沟通 (Communication) ---
  { id: 1, text: "当我有难以启齿的需求（如性癖好或某种不安全感）时，我能够坦诚地告诉伴侣，而不是通过暗示。", weights: { surfer: 2, guardian: -1, sponge: -1 } },
  { id: 2, text: "如果不确定伴侣的想法，我会直接询问核实，而不是自己在脑海中编写剧本或猜测。", weights: { surfer: 2, reactive: -2, sponge: -1 } },
  { id: 3, text: "我能耐心地倾听伴侣对我的批评或不满，而不会立刻打断并为自己辩解。", weights: { surfer: 2, reactive: -2, guardian: -1 } },
  { id: 4, text: "即使在谈论很尴尬的话题（如性健康、嫉妒）时，我也能保持相对平和的态度。", weights: { surfer: 2, guardian: 1 } },
  { id: 5, text: "我习惯报喜不报忧，为了避免麻烦，我会选择隐瞒一些可能会让伴侣不开心的小事。", weights: { sponge: 2, guardian: 1, surfer: -2 } }, // 反向

  // --- 情绪韧性 (Resilience) ---
  { id: 6, text: "当感到嫉妒或不安时，我能意识到这通常是我自己的议题，而不是伴侣做错了什么。", weights: { surfer: 2, reactive: -2 } },
  { id: 7, text: "如果伴侣今晚不能陪我，我能安排好自己的时间，享受独处，而不会感到被抛弃。", weights: { surfer: 2, sponge: -2, reactive: -1 } },
  { id: 8, text: "我的情绪很容易受伴侣影响：如果他/她心情不好，我的一整天也会变得很糟糕。", weights: { sponge: 2, reactive: 1, surfer: -2 } }, // 反向
  { id: 9, text: "面对突发状况（如约会临时取消），我通常能快速调整心态，而不是陷入长久的愤怒。", weights: { surfer: 2, guardian: -1, reactive: -2 } },
  { id: 10, text: "我需要伴侣不断地向我保证“最爱的是我”，否则我就会陷入自我怀疑。", weights: { sponge: 2, reactive: 2, surfer: -2 } }, // 反向

  // --- 边界意识 (Boundaries) ---
  { id: 11, text: "我清楚地知道自己的底线在哪里，并且在底线被触碰时，敢于坚定地表达出来。", weights: { surfer: 2, guardian: 2, sponge: -2 } },
  { id: 12, text: "为了让伴侣开心，我经常答应一些我其实并不想做的事情。", weights: { sponge: 2, surfer: -2, guardian: -1 } }, // 反向
  { id: 13, text: "我认为每个人都应该为自己的情绪负责，我不会试图去“拯救”或“治愈”我的伴侣。", weights: { surfer: 2, guardian: 1, sponge: -2 } },
  { id: 14, text: "我很难拒绝伴侣的要求，拒绝会让我产生强烈的内疚感。", weights: { sponge: 2, surfer: -2 } }, // 反向
  { id: 15, text: "我认为伴侣之间应该毫无保留，我不允许对方有我不知道的隐私空间。", weights: { guardian: 2, reactive: 1, surfer: -2 } }, // 反向

  // --- 冲突解决 (Conflict) ---
  { id: 16, text: "发生争执时，我更关注“我们要如何解决这个问题”，而不是“到底是谁的错”。", weights: { surfer: 2, reactive: -2, guardian: 1 } },
  { id: 17, text: "生气的时候，我倾向于用冷战、沉默或回避来应对，直到对方先低头。", weights: { guardian: 2, reactive: 1, surfer: -2 } }, // 反向
  { id: 18, text: "我能够接受我们在某些问题上“求同存异”，不会强迫伴侣必须认同我的观点。", weights: { surfer: 2, guardian: -1 } },
  { id: 19, text: "一旦发生冲突，我的情绪会瞬间爆发，经常说出一些事后后悔的狠话。", weights: { reactive: 2, surfer: -2 } }, // 反向
  { id: 20, text: "如果是我的问题导致了冲突，我能真诚地道歉，并提出具体的改进方案。", weights: { surfer: 2, reactive: -1 } },

  // --- 综合情境 ---
  { id: 21, text: "当原来的约定不再适用时，我愿意重新坐下来与伴侣协商新的规则。", weights: { surfer: 2, guardian: -2 } },
  { id: 22, text: "我认为一段好的关系应该是“没有冲突”的，如果有冲突，说明我们不合适。", weights: { sponge: 1, guardian: 1, surfer: -2 } }, // 反向
  { id: 23, text: "我经常觉得在关系中只有我一个人在付出，这让我感到委屈和愤怒。", weights: { sponge: 1, reactive: 1, surfer: -1 } }, // 反向
  { id: 24, text: "我相信即使经历了激烈的争吵，我们的关系也是可以被修复甚至变得更坚固的。", weights: { surfer: 2, guardian: 1, reactive: -1 } }
];

const PAGE_BREAKS = [6, 12, 18, 24]; // 6题/页

// =====================================================================
// 3. 组件实现
// =====================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">关系适应性评估</h1>
      
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">本评估旨在测试你在复杂关系中的<b>沟通、边界、情绪韧性与冲突解决</b>能力，共24题。</li>
          <li className="intro-item">适应性是可以通过后天学习提升的“技能”，而非不可改变的性格。</li>
          <li className="intro-item">测试结果将为你提供一个当前的“能力画像”，帮助你找到成长的发力点。</li>
          <li className="intro-item">全程不联网，请放下防御，诚实地面对自己的弱点与强项。</li>
        </ul>
      </div>

      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.2)'}}>
        开始评估
      </button>
    </div>
  </div>
);

// 气泡提示
const SharePopover = ({ onClose }) => (
  <div className="share-popover">
    <div className="popover-text">
      受到技术限制，请您<b>截图</b>保存此页面或分享给好友 :)
    </div>
    <button onClick={onClose} className="popover-close">
      我知道了
    </button>
  </div>
);

const ResultScreen = ({ results, onRetry }) => {
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (showShare) {
      const timer = setTimeout(() => setShowShare(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showShare]);

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>评估结果</h2>
        <p style={{color: '#6b7280', fontSize: '0.95rem'}}>以下是您的适应性能力画像，此结果只展示一次，您可截图保存。</p>
      </div>

      {/* 1. Best Match */}
      {results.bestMatch ? (
        <div className="res-card best-match">
          <h3 className="res-header-label">
            YOUR DOMINANT <span className="highlight">STYLE</span>
          </h3>
          <div className="watermark">PolyCN.org</div>
          
          <div className="res-title">
            {results.bestMatch.name}
            <span className="res-match-rate">符合度 {results.bestMatch.percent}%</span>
          </div>
          <div className="res-summary">{results.bestMatch.summary}</div>
          
          <span className="section-label label-advice">💡 成长建议</span>
          <p className="section-text">{results.bestMatch.advice}</p>

          <span className="section-label label-risk">🚩 盲点与风险</span>
          <p className="section-text">{results.bestMatch.risks}</p>

          <span className="section-label label-diff">🔗 类型辨析</span>
          <p className="section-text">{results.bestMatch.neighbor}</p>
        </div>
      ) : (
        <div className="res-card best-match">
          <div className="res-title">混合型适应风格</div>
          <p style={{color: '#d1d5db'}}>你的适应性风格较为均衡，没有表现出极端的单一特质。这通常意味着你在不同情境下会切换不同的应对策略。</p>
        </div>
      )}

      {/* 2. Secondary Match */}
      {results.okMatches.length > 0 && (
        <div className="res-card">
          <h3 className="res-header-label">
            SECONDARY <span className="highlight">TENDENCY</span>
          </h3>
          <div className="res-title">
            {results.okMatches[0].name}
            <span className="res-match-rate">符合度 {results.okMatches[0].percent}%</span>
          </div>
          <div className="res-summary">
            {results.okMatches[0].summary}
            <div className="ok-advice-block">
              <span className="ok-advice-label">注意：</span>
              当你处于压力状态下，可能会退行到这种模式。
            </div>
          </div>
        </div>
      )}

      {/* 4. Actions */}
      <div className="result-actions">
        <div style={{position: 'relative', width: '100%'}}>
          {showShare && <SharePopover onClose={() => setShowShare(false)} />}
          <div onClick={() => setShowShare(true)} className="action-card-btn btn-share-style">
            <strong>分享结果</strong>
            <span style={{fontSize:'0.85rem', color:'#6b7280'}}>生成截图</span>
          </div>
        </div>
        <div onClick={onRetry} className="action-card-btn btn-retry-style">
          <strong>重新测试</strong>
          <span style={{fontSize:'0.85rem', color:'#9ca3af'}}>清空记录</span>
        </div>
      </div>

      {/* 5. More Tests Loop */}
      <div className="more-tests-section">
        <h4 className="more-title">更多测试</h4>
        <div className="test-grid">
          <div className="test-card completed">
            <span className="t-name">关系适应性评估</span>
            <span className="t-status">✅ 已完成</span>
          </div>
          <a href="/assessment/orientation" className="test-card active">
            <span className="t-name" style={{color: '#f97316'}}>关系形态倾向自测</span>
            <span className="t-desc">你是单偶还是多边？</span>
          </a>
        </div>
      </div>

      {/* 6. Mini Nav */}
      <div className="mini-nav">
        <a href="/" className="mini-link">回到首页</a>
        <a href="/start" className="mini-link">开始探索</a>
        <a href="/library" className="mini-link">全部馆藏</a>
      </div>
    </div>
  );
};

// =====================================================================
// 4. 主逻辑 (复用)
// =====================================================================

const AdaptionQuiz = () => {
  const [started, setStarted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [showResult, setShowResult] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);

  const currentQuestions = useMemo(() => {
    const start = pageIndex === 0 ? 0 : PAGE_BREAKS[pageIndex - 1];
    const end = PAGE_BREAKS[pageIndex];
    return QUESTIONS.slice(start, end);
  }, [pageIndex]);

  const firstUnansweredId = useMemo(() => {
    const first = currentQuestions.find(q => answers[q.id] === undefined);
    return first ? first.id : null;
  }, [currentQuestions, answers]);

  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (firstUnansweredId) {
      setShakeBtn(true);
      setTimeout(() => setShakeBtn(false), 500);
      const el = document.getElementById(`q-${firstUnansweredId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (pageIndex < PAGE_BREAKS.length - 1) {
      setPageIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setShowResult(true);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleRetry = () => {
    setStarted(false);
    setPageIndex(0);
    setAnswers({});
    setShowResult(false);
    window.scrollTo(0, 0);
  };

  const results = useMemo(() => {
    if (!showResult) return null;
    
    const scores = {};
    Object.keys(RESULT_TYPES).forEach(k => scores[k] = 0);

    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (!q) return;
      const multiplier = val - 3; 
      if (multiplier !== 0 && q.weights) {
        Object.entries(q.weights).forEach(([typeKey, weight]) => {
          scores[typeKey] += (multiplier * weight);
        });
      }
    });

    const sortedTypes = Object.entries(scores)
      .map(([key, score]) => {
        // 归一化算法 (粗略)
        let percent = Math.round(((score + 15) / 40) * 100); 
        if (percent > 99) percent = 99;
        if (percent < 0) percent = 0;
        return { ...RESULT_TYPES[key], percent };
      })
      .sort((a, b) => b.percent - a.percent);

    const bestMatch = sortedTypes[0];
    const okMatches = sortedTypes.slice(1, 2); // 只取第二名

    return { bestMatch, okMatches, redFlags: [] };
  }, [showResult, answers]);

  if (!started) return <WelcomeScreen onStart={() => setStarted(true)} />;
  if (showResult && results) return <ResultScreen results={results} onRetry={handleRetry} />;

  return (
    <div className="quiz-container animate-fade-in">
      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div>
        {currentQuestions.map((q) => (
          <div key={q.id} id={`q-${q.id}`} className={`quiz-card ${answers[q.id] !== undefined ? 'answered' : ''}`}>
            <div className="question-text">{q.text}</div>
            <div className="options-dots">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                  className={`dot-btn ${answers[q.id] === val ? 'selected' : ''}`}
                >
                  <div className={`dot-circle dot-size-${val} dot-color-${val}`}></div>
                </button>
              ))}
            </div>
            {q.id === firstUnansweredId && (
              <div className="dots-labels-container">
                <span className="dots-label-item">完全<br/>不符合</span>
                <span className="dots-label-item">基本<br/>不符合</span>
                <span className="dots-label-item">中立<br/>说不清</span>
                <span className="dots-label-item">基本<br/>符合</span>
                <span className="dots-label-item">完全<br/>符合</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="nav-actions">
        {pageIndex > 0 && <button onClick={handlePrev} className="btn-prev">上一页</button>}
        <button onClick={handleNext} className={`btn-next ${shakeBtn ? 'animate-shake' : ''}`}>
          {pageIndex < PAGE_BREAKS.length - 1 ? "下一页" : "查看结果"}
        </button>
      </div>
    </div>
  );
};

export default AdaptionQuiz;
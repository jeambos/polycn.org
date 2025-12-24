import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Assessment.css'; // 复用 Assessment.css 样式
import MoreTests from './MoreTests';

// =====================================================================
// 1. 数据定义
// =====================================================================

const DIMENSIONS = {
  comms: { name: "高难度沟通", desc: "面对羞耻或恐惧时坦诚表达的能力" },
  resilience: { name: "情绪韧性", desc: "自我安抚与消化负面情绪的能力" },
  boundaries: { name: "边界维护", desc: "清楚底线并坚定拒绝的能力" },
  conflict: { name: "冲突修复", desc: "从对抗模式切换回合作模式的能力" },
  bandwidth: { name: "情感带宽", desc: "同时滋养多段关系的心力储备" },
  decondition: { name: "去规训化", desc: "摆脱主流恋爱剧本的思维弹性" },
  resource: { name: "资源统筹", desc: "对时间与精力的理性规划能力" },
  autonomy: { name: "独处与自主", desc: "精神独立与享受独处的能力" }
};

const getAdvice = (dimKey, score) => {
  const isHigh = score >= 4;
  const isLow = score <= 2.5;
  
  const adviceMap = {
    comms: {
      high: "你非常坦诚，这是建立信任的基石。",
      mid: "尝试在更羞耻的话题上也保持这种坦诚。",
      low: "试着从“我感到...”句式开始，练习表达脆弱。"
    },
    resilience: {
      high: "你是情绪的冲浪高手，这种稳定非常宝贵。",
      mid: "在压力大时，记得调用你的安抚技巧。",
      low: "建立一个“情绪急救箱”（如冥想、书写）。"
    },
    boundaries: {
      high: "你很清楚我是谁，这保护了你免受耗竭。",
      mid: "注意不要为了和谐而偶尔牺牲底线。",
      low: "练习说“不”，这其实是对关系的保护。"
    },
    conflict: {
      high: "你善于修补裂痕，这是长期关系的关键。",
      mid: "争吵后，试着更快地发起修复尝试。",
      low: "暂停冷战，尝试关注“我们”而非“对错”。"
    },
    bandwidth: {
      high: "你拥有丰沛的爱意，能滋养身边的人。",
      mid: "量力而行，不要透支你的社交能量。",
      low: "先照顾好自己，溢出的爱才是健康的。"
    },
    decondition: {
      high: "你拥有定义关系的自由，不受世俗束缚。",
      mid: "留意那些潜意识里的“应该”和“必须”。",
      low: "试着质疑那些让你痛苦的“标准恋爱观”。"
    },
    resource: {
      high: "你的靠谱和条理是多边关系的润滑剂。",
      mid: "试着更精准地预估你的时间余额。",
      low: "使用工具（如闹钟/置顶）来辅助记忆。"
    },
    autonomy: {
      high: "你享受独处，这让你在关系中更有魅力。",
      mid: "培养一个完全属于你自己的兴趣爱好。",
      low: "独处不是被抛弃，而是与自己约会。"
    }
  };

  if (isHigh) return adviceMap[dimKey].high;
  if (isLow) return adviceMap[dimKey].low;
  return adviceMap[dimKey].mid;
};

const QUESTIONS = [
  // Page 1: 基础 (1-8)
  { id: 1, dim: 'comms', text: "当我有难以启齿的需求（如特定的性癖好或某种不安全感）时，我通常能够鼓起勇气坦诚地告诉伴侣。" },
  { id: 2, dim: 'comms', text: "如果与伴侣发生误会，我更倾向于直接询问核实，而不是自己在脑海中编写剧本或猜测。" },
  { id: 3, dim: 'resilience', text: "当感到嫉妒或不安时，我往往能意识到这通常是我自己的议题，而不是伴侣故意要伤害我。" },
  { id: 4, dim: 'resilience', text: "面对突发状况（如伴侣临时取消约会去陪别人），我通常能较快地自我安抚，而不是陷入长久的愤怒。" },
  { id: 5, dim: 'boundaries', text: "我清楚地知道自己的底线在哪里，并且在底线被触碰时，敢于坚定地表达出来。" },
  { id: 6, dim: 'boundaries', text: "为了让伴侣开心，我有时会答应一些我其实并不想做的事情，事后又感到后悔。", reverse: true },
  { id: 7, dim: 'conflict', text: "发生争执时，我更关注“我们要如何解决这个问题”，而不是纠结“到底是谁的错”。" },
  { id: 8, dim: 'conflict', text: "生气的时候，我倾向于用冷战、沉默或回避来应对，直到对方先低头或事情过去。", reverse: true },

  // Page 2: 进阶 (9-16)
  { id: 9, dim: 'bandwidth', text: "我感觉到自己内心有充沛的爱意，似乎可以同时对不止一个人保持深度的情感关注。" },
  { id: 10, dim: 'bandwidth', text: "仅仅是维持一段亲密关系，往往就已经让我感到精疲力尽，没有余力去经营更多连接。", reverse: true },
  { id: 11, dim: 'decondition', text: "如果一段美好的关系最终没有走向婚姻或同居，我并不觉得这是一种失败。" },
  { id: 12, dim: 'decondition', text: "当我发现自己不是伴侣的“唯一”或“最爱”时，我往往会产生强烈的自我价值感贬低。", reverse: true },
  { id: 13, dim: 'resource', text: "对于重要的人或事（如约会、纪念日），我习惯使用工具（如微信置顶、手机闹钟）来确保自己不会遗忘。" },
  { id: 14, dim: 'resource', text: "我经常出现记错时间、撞期、或在最后一刻才想起来有约的情况。", reverse: true },
  { id: 15, dim: 'autonomy', text: "当伴侣去陪伴其他人时，我通常能把这段时间视为“属于自己的自由时间”，并享受其中。" },
  { id: 16, dim: 'autonomy', text: "如果没有伴侣的陪伴，我往往会觉得生活空虚，不知道该干什么。", reverse: true },

  // Page 3: 深入 (17-24)
  { id: 17, dim: 'comms', text: "我努力尝试耐心地倾听伴侣对我的批评或不满，尽量不立刻打断并为自己辩解。" },
  { id: 18, dim: 'comms', text: "即使在谈论很尴尬的话题（如性健康检测结果、对其他人的心动）时，我也通常能保持相对平和的态度。" },
  { id: 19, dim: 'resilience', text: "我的情绪似乎很容易受伴侣影响：如果他/她心情不好，我的一整天也会变得很糟糕。", reverse: true },
  { id: 20, dim: 'resilience', text: "当负面情绪来袭时，我有自己的一套方法（如运动、书写、冥想）来让自己冷静下来。" },
  { id: 21, dim: 'boundaries', text: "我认为每个人都应该为自己的情绪负责，我尽量不试图去“拯救”或“治愈”我的伴侣。" },
  { id: 22, dim: 'boundaries', text: "面对伴侣不仅合理但让我感到疲惫的要求，我感到很难拒绝，拒绝往往会让我产生强烈的内疚感。", reverse: true },
  { id: 23, dim: 'conflict', text: "我能够接受我们在某些问题上“求同存异”，不会强迫伴侣必须认同我的观点。" },
  { id: 24, dim: 'conflict', text: "一旦发生冲突，我的情绪容易瞬间爆发，有时会说出一些带有攻击性的话。", reverse: true },

  // Page 4: 挑战 (25-32)
  { id: 25, dim: 'bandwidth', text: "当我的一个伴侣遇到困难需要支持时，我通常仍有余力去关照另一个伴侣的感受，而不至于顾此失彼。" },
  { id: 26, dim: 'bandwidth', text: "我乐于在不同的关系中展现不同的自我面向（如在A面前像孩子，在B面前像导师），这让我感到丰富而非分裂。" },
  { id: 27, dim: 'decondition', text: "我能够理解并接受，伴侣可以从不同的人身上获得不同的满足（如智识、性、陪伴），我不需要满足他/她的一切。" },
  { id: 28, dim: 'decondition', text: "看到社会上歌颂“一生一世一双人”的爱情时，我潜意识里仍觉得那才是最高级、最完美的爱。", reverse: true },
  { id: 29, dim: 'resource', text: "我能够比较清晰地评估自己未来一周的时间和精力余额，不会轻易许下无法兑现的承诺。" },
  { id: 30, dim: 'resource', text: "在多线并行的生活中，我往往觉得生活一团乱麻，很难平衡工作、生活和多段关系。", reverse: true },
  { id: 31, dim: 'autonomy', text: "我拥有自己独立的社交圈、兴趣爱好或事业，这些并不依赖于我的伴侣而存在。" },
  { id: 32, dim: 'autonomy', text: "做重大人生决定时，虽然会参考伴侣意见，但我最终能基于自己的意愿做出独立选择。" },

  // Page 5: 综合 (33-40)
  { id: 33, dim: 'comms', text: "为了避免麻烦或冲突，我有时会习惯报喜不报忧，隐瞒一些可能会让伴侣不开心的小事。", reverse: true },
  { id: 34, dim: 'resilience', text: "我发现自己很需要伴侣不断地向我保证“最爱的是我”，否则我就容易陷入自我怀疑。", reverse: true },
  { id: 35, dim: 'boundaries', text: "当我感到精力耗竭时，我能够主动提出暂停或独处，而不会为了维持关系强撑。" },
  { id: 36, dim: 'conflict', text: "如果是我的问题导致了冲突，冷静下来后，我通常能真诚地道歉，并提出改进方案。" },
  { id: 37, dim: 'bandwidth', text: "频繁的社交互动和情感交流容易让我感到能量透支，我需要很长的恢复期。", reverse: true },
  { id: 38, dim: 'decondition', text: "我愿意尝试定义属于自己的关系规则（如住在不同城市、不共享财务），哪怕这在旁人看来很奇怪。" },
  { id: 39, dim: 'resource', text: "我有意识地规划金钱的使用，以支撑这种可能比单偶制花费更高的生活方式（更多的约会、交通成本）。" },
  { id: 40, dim: 'autonomy', text: "独处对我来说是一种滋养；长时间无法独处会让我感到窒息或烦躁。" },
];

const PAGE_BREAKS = [8, 16, 24, 32, 40]; // 8题/页

// =====================================================================
// 2. 辅助组件
// =====================================================================

// 欢迎页组件
const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">复杂关系适应能力评估</h1>
      
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">本评估旨在测试你在复杂关系中的<b>沟通、边界、情绪韧性与冲突解决</b>能力，共40题。</li>
          <li className="intro-item">适应性是可以通过后天学习提升的“技能”，而非不可改变的性格。</li>
          <li className="intro-item">测试结果将为你提供一个当前的“能力画像”，帮助你找到成长的发力点。</li>
          <li className="intro-item">全程不联网，请放下防御，诚实地面对自己的弱点与强项。</li>
        </ul>
      </div>

      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.2)'}}>
        开始评估
      </button>
    </div>

<MoreTests currentId="adaption" status="welcome" />


  </div>
);

// 分享气泡组件
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

// 雷达图组件
const RadarChart = ({ scores, activeDim, onDimClick }) => {
  // Config
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(DIMENSIONS);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Helpers
  const getCoordinates = (value, index) => {
    // 旋转 -90度 (-PI/2) 让第一个轴在正上方
    const angle = index * angleSlice - Math.PI / 2;
    // 归一化: 满分5分 -> 半径
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const getLabelCoordinates = (index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius + 25; // Label padding
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // 生成雷达多边形路径
  const points = axes.map((key, i) => {
    const score = scores[key] || 0;
    const coords = getCoordinates(score, i);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  // 背景网格 (5层)
  const gridLevels = [1, 2, 3, 4, 5].map(level => {
    const levelPoints = axes.map((_, i) => {
      const coords = getCoordinates(level, i);
      return `${coords.x},${coords.y}`;
    }).join(" ");
    return <polygon key={level} points={levelPoints} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
  });

  return (
    <div className="radar-section">
      <div className="radar-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} style={{width: '100%', height: '100%'}}>
          {/* Background Grid */}
          {gridLevels}
          
          {/* Axes Lines */}
          {axes.map((_, i) => {
            const start = getCoordinates(0, i);
            const end = getCoordinates(5, i);
            return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth="1" />;
          })}

          {/* Data Polygon */}
          <polygon points={points} fill="rgba(249, 115, 22, 0.2)" stroke="#f97316" strokeWidth="2" />
          
          {/* Data Points */}
          {axes.map((key, i) => {
            const score = scores[key] || 0;
            const coords = getCoordinates(score, i);
            return <circle key={i} cx={coords.x} cy={coords.y} r="3" fill="#f97316" />;
          })}

          {/* Labels (Clickable) */}
          {axes.map((key, i) => {
            const coords = getLabelCoordinates(i);
            const isActive = activeDim === key;
            return (
              <text 
                key={key} 
                x={coords.x} 
                y={coords.y} 
                className={`radar-label-btn ${isActive ? 'active' : ''}`}
                onClick={() => onDimClick(key)}
              >
                {DIMENSIONS[key].name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* 交互反馈区 */}
      {activeDim && (
        <div className="radar-stat-box">
          <div className="stat-name">{DIMENSIONS[activeDim].name}</div>
          <div className="stat-val">{scores[activeDim].toFixed(1)} / 5.0</div>
          <div className="stat-desc">{DIMENSIONS[activeDim].desc}</div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// 3. 结果页
// =====================================================================

const ResultScreen = ({ answers, onRetry }) => {
  const [activeDim, setActiveDim] = useState('comms'); // 默认选中第一个
  const [showShare, setShowShare] = useState(false); // 分享弹窗状态

  // 3秒后自动关闭气泡
  useEffect(() => {
    if (showShare) {
      const timer = setTimeout(() => setShowShare(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showShare]);

  // 计算分数
  const scores = useMemo(() => {
    const raw = {};
    const count = {};
    // Init
    Object.keys(DIMENSIONS).forEach(k => { raw[k] = 0; count[k] = 0; });

    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (q) {
        // 反向题处理: 5->1, 4->2, 3->3, 2->4, 1->5
        const actualVal = q.reverse ? (6 - val) : val;
        raw[q.dim] += actualVal;
        count[q.dim] += 1;
      }
    });

    // 平均分
    const final = {};
    let totalSum = 0;
    Object.keys(raw).forEach(k => {
      final[k] = count[k] > 0 ? (raw[k] / count[k]) : 0;
      totalSum += raw[k];
    });
    
    // 总分 (满分 40题 * 5 = 200 -> 映射到 100)
    const totalScore = Math.round((totalSum / 200) * 100);

    return { dimScores: final, totalScore };
  }, [answers]);

  // 排序维度 (强项/弱项)
  const sortedDims = useMemo(() => {
    return Object.entries(scores.dimScores)
      .sort(([, a], [, b]) => b - a) // 降序
      .map(([key, val]) => ({ key, val, ...DIMENSIONS[key] }));
  }, [scores]);

  const strongDims = sortedDims.filter(d => d.val >= 4.0);
  const weakDims = sortedDims.filter(d => d.val < 4.0); // 其余皆为提升空间

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>适应力画像</h2>
        <p style={{color: '#6b7280', fontSize: '0.95rem'}}>这是您的多元关系生存能力仪表盘</p>
      </div>

      {/* 1. 总分卡片 */}
      <div className="score-card">
        <div className="watermark">PolyCN.org</div>
        <div className="score-circle">
          <span className="score-big">{scores.totalScore}</span>
          <span className="score-small">/ 100</span>
        </div>
        <div className="score-comment">
          {scores.totalScore >= 85 ? "您的关系适应力非常出色，能驾驭复杂的动态。" :
           scores.totalScore >= 70 ? "基础稳固，但在部分高难度领域仍有提升空间。" :
           "在进入复杂关系前，建议先着重练习基础的情绪与沟通能力。"}
        </div>
      </div>

      {/* 2. 雷达图 */}
      <RadarChart 
        scores={scores.dimScores} 
        activeDim={activeDim} 
        onDimClick={setActiveDim} 
      />

      {/* 3. 维度拆解 */}
      <div className="breakdown-section">
        {/* 优势领域 */}
        {strongDims.length > 0 && (
          <>
            <h3 className="breakdown-title">
              <span style={{color: '#10b981'}}>✦</span> 您的强项 (Superpowers)
            </h3>
            <div className="dim-grid">
              {strongDims.map(d => (
                <div key={d.key} className="dim-card">
                  <div className="dim-header">
                    <span className="dim-name">{d.name}</span>
                    <span className="dim-score" style={{color: '#10b981'}}>{d.val.toFixed(1)}</span>
                  </div>
                  <div className="dim-bar-bg"><div className="dim-bar-fill fill-high" style={{width: `${(d.val/5)*100}%`}}></div></div>
                  <p className="dim-text">{getAdvice(d.key, d.val)}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 提升空间 */}
        <h3 className="breakdown-title">
          <span style={{color: '#f59e0b'}}>✦</span> 需关注的领域 (Growth Areas)
        </h3>
        <div className="dim-grid">
          {weakDims.map(d => (
            <div key={d.key} className="dim-card">
              <div className="dim-header">
                <span className="dim-name">{d.name}</span>
                <span className="dim-score" style={{color: d.val < 3 ? '#ef4444' : '#f59e0b'}}>{d.val.toFixed(1)}</span>
              </div>
              <div className="dim-bar-bg">
                <div 
                  className={`dim-bar-fill ${d.val < 3 ? 'fill-low' : 'fill-mid'}`} 
                  style={{width: `${(d.val/5)*100}%`}}
                ></div>
              </div>
              <p className="dim-text">{getAdvice(d.key, d.val)}</p>
              {d.val < 3 && (
                <span className="action-tip">建议：优先阅读相关指南或进行针对性练习。</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Actions */}
      <div className="result-actions">
        {/* Share Button */}
        <div style={{position: 'relative', width: '100%'}}>
          {showShare && <SharePopover onClose={() => setShowShare(false)} />}
          <div 
            onClick={() => setShowShare(true)} 
            className="action-card-btn btn-share-style"
          >
            <strong>分享结果</strong>
          </div>
        </div>

        {/* Retry Button */}
        <div onClick={onRetry} className="action-card-btn btn-retry-style">
          <strong>重测本卷</strong>
        </div>
      </div>

      <MoreTests currentId="adaption" status="result" />

      {/* 6. Mini Nav */}
      <div className="mini-nav">
        <a href="/" className="mini-link">全站首页</a>
        <a href="/start" className="mini-link">开始菜单</a>
        <a href="/library" className="mini-link">全部馆藏</a>
        <a href="/wiki" className="mini-link">百科Wiki</a>
      </div>
    </div>
  );
};

// =====================================================================
// 4. 主逻辑
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

  if (!started) return <WelcomeScreen onStart={() => setStarted(true)} />;
  if (showResult) return <ResultScreen answers={answers} onRetry={handleRetry} />;

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
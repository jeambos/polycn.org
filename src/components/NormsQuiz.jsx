import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Assessment.css'; // 复用 Assessment.css 的所有样式

// =====================================================================
// 1. 维度与文案定义
// =====================================================================

const DIMENSIONS = {
  enmeshment: { name: "伴侣共生", desc: "个体独立性 vs 融合共生" },
  one_only: { name: "全能期待", desc: "伴侣功能的多样性 vs 唯一性" },
  gender: { name: "性别脚本", desc: "传统分工 vs 多元角色" },
  family: { name: "代际边界", desc: "自我主导 vs 家庭干预" },
  institution: { name: "制度迷思", desc: "形式主义 vs 关系实质" },
  jealousy: { name: "嫉妒逻辑", desc: "嫉妒即爱 vs 嫉妒即信号" },
  sex_love: { name: "性爱捆绑", desc: "性道德化 vs 身体自主" },
  exclusivity: { name: "绝对排他", desc: "身心绑定 vs 流动接受度" }
};

// 结果页文案 (高分评价 - 即受规训程度高)
const HIGH_SCORE_TEXTS = {
  enmeshment: "你倾向于追求一种‘你中有我，我中有你’的高浓度融合感。这种紧密连接能带来极大的安全感，但同时，这也意味着你的个人边界相对模糊，可能会让你在关系中难以区分‘我的情绪’和‘对方的情绪’。",
  one_only: "你对伴侣寄予了非常高的厚望，希望他/她能同时满足你从情感、生活到精神层面的大部分需求。这反映了你对完美连接的向往，但客观上，这可能会给对方带来较大的心理负荷，也可能让你更容易感到失望。",
  gender: "你的恋爱观在一定程度上保留了传统的性别分工模式（如男主外女主内、男刚女柔）。这种明确的脚本能减少相处中的不确定性，但它也可能在无形中限制了你或伴侣展现更丰富、更多元的个性特质。",
  family: "你非常看重恋爱关系与原生家庭的融合，认为获得长辈认可和家庭和谐是幸福的重要基石。这种观念体现了你的责任感，但当个人意愿与家庭期待发生冲突时，你可能会面临比常人更艰难的抉择。",
  institution: "你倾向于将‘修成正果’（如结婚、生子）视为一段关系成功与否的核心指标。这让你的人生路径变得很清晰，做完‘规定动作’就好，但你也许会容易忽视自己的独特需求、感受不到关系在当下带给你的真实体验。",
  jealousy: "你倾向于将嫉妒心和占有欲解读为‘在乎’和‘爱’的证明。这种逻辑是社会常见的，但你可能会忽视了，嫉妒背后可能是缺乏安全感或者其他被亏欠的需求，从而失去了深入探索自我的机会。",
  sex_love: "你倾向于认为性行为必须以深厚的情感或承诺为前提，赋予性较高的道德意义。这种观念能保护你在性关系中的安全感，但这可能让你错过了很多探索生理快感和身体可能性的机会。",
  exclusivity: "你认为身心的绝对排他是维护关系信任的基石，甚至对‘精神上的游离’也保持高度警惕。这为你构建了纯粹的爱情理想。但你可能忽视了，每个人都是独立自主的个体，不应成为被人控制的财产。而且，对他人的心动往往是某种本能反应，并非只是世风日下的影响，当你遭遇这种事时可能会心情很不好受。"
};

// 40道题目 (每维度5题，得分越高代表受规训越深)
const QUESTIONS = [
  // Page 1: 伴侣共生 + 全能期待 (1-10)
  { id: 1, dim: 'enmeshment', text: "“你就是我的另一半”，没有伴侣，我觉得我的人生是不完整的。" },
  { id: 2, dim: 'enmeshment', text: "做重大决定时，如果伴侣不同意，我就倾向于不去做了。" },
  { id: 3, dim: 'enmeshment', text: "我不太喜欢伴侣有我完全不认识的社交圈子，我想融入他/她的所有生活。" },
  { id: 4, dim: 'enmeshment', text: "如果伴侣想一个人去长途旅行而不带我，我会觉得他/她可能没那么爱我了。" },
  { id: 5, dim: 'enmeshment', text: "我认为爱人之间不应该有秘密，互相查看手机和聊天记录是可以接受的。" },
  { id: 6, dim: 'one_only', text: "我认为恋人的需求应该永远高于朋友的需求。" },
  { id: 7, dim: 'one_only', text: "遇到烦恼时，伴侣应该是最能完全理解我的人。" },
  { id: 8, dim: 'one_only', text: "我不应该从伴侣以外的人（如亲密朋友）那里寻求比伴侣更深的情感支持/情绪价值。" },
  { id: 9, dim: 'one_only', text: "我的伴侣应该同时扮演好我的最好的朋友、性伴侣和灵魂知己这几个角色。" },
  { id: 10, dim: 'one_only', text: "当伴侣无法满足我的某个核心需求（如性或精神交流）时，我会感到很难过。" },

  // Page 2: 性别脚本 + 代际边界 (11-20)
  { id: 11, dim: 'gender', text: "在约会和家庭开支中，男性多承担一些经济责任是比较合理的。" },
  { id: 12, dim: 'gender', text: "相比于男性，女性通常更适合照顾家庭和处理细腻的情感问题。" },
  { id: 13, dim: 'gender', text: "男人应该要有男人的样子（阳刚），女人应该要有女人的样子（温柔）。" },
  { id: 14, dim: 'gender', text: "我很难接受“女强男弱”或“女主外男主内”的家庭模式。" },
  { id: 15, dim: 'gender', text: "在性生活中，男性应该主动一些，女性应该矜持一些，这更顺应天性。" },
  { id: 16, dim: 'family', text: "谈恋爱是两个人的事，但结婚绝对是两个家庭的事。" },
  { id: 17, dim: 'family', text: "如果父母强烈反对我的伴侣，我们走到最后的可能性就很小了。" },
  { id: 18, dim: 'family', text: "过年过节回谁家这类问题，还是要多考虑长辈的意见，不能只顾自己。" },
  { id: 19, dim: 'family', text: "孩子跟谁姓这类问题，如果处理不好伤了老人的心，是不孝顺的表现。" },
  { id: 20, dim: 'family', text: "为了家庭和谐，有时候牺牲一点个人的婚恋自由是值得的。" },

  // Page 3: 制度迷思 + 嫉妒逻辑 (21-30)
  { id: 21, dim: 'institution', text: "正经谈恋爱，肯定都是奔着领证结婚去的。" },
  { id: 22, dim: 'institution', text: "只有完成了领证、办酒的流程，我们才算是正儿八经、堂堂正正的一对。" },
  { id: 23, dim: 'institution', text: "如果一段关系持续多年却不同居、不结婚，那这段关系终究不够圆满。" },
  { id: 24, dim: 'institution', text: "生育是婚姻的重要组成部分，没有孩子的家庭总觉得缺了点什么。" },
  { id: 25, dim: 'institution', text: "搞开放关系或者不愿意结婚的人，大都只是年轻时玩玩而已，最终还是要回归家庭的。" },
  { id: 26, dim: 'jealousy', text: "如果伴侣看到我和别人聊得很开心，但是不吃醋，我会怀疑 ta 是不是不够爱我。" },
  { id: 27, dim: 'jealousy', text: "适度的嫉妒和占有欲是情趣，能证明对方很有魅力，也能证明我很在乎。" },
  { id: 28, dim: 'jealousy', text: "听到伴侣夸奖别人的异性（或同性）魅力，我心里会本能地感到不舒服。" },
  { id: 29, dim: 'jealousy', text: "爱就是占有，我不希望任何人在任何层面（情感或身体）分享我的伴侣。" },
  { id: 30, dim: 'jealousy', text: "“不嫉妒的爱”听起来很美好，但其实是违背人性的，根本不存在。" },

  // Page 4: 性爱捆绑 + 绝对排他 (31-40)
  { id: 31, dim: 'sex_love', text: "没有爱的性，终究是空洞的，或者不道德的。" },
  { id: 32, dim: 'sex_love', text: "约炮或一夜情是私生活混乱的表现，反映了一个人的人品问题。" },
  { id: 33, dim: 'sex_love', text: "我很难接受伴侣以前睡过很多人。" },
  { id: 34, dim: 'sex_love', text: "性是美好的，但它应该只属于一段确定的、有承诺的恋爱关系。" },
  { id: 35, dim: 'sex_love', text: "如果伴侣提出想要尝试多人运动等非传统的性形式，我会觉得被冒犯。" },
  { id: 36, dim: 'exclusivity', text: "如果真的爱一个人，身体和心理会自动“屏蔽”其他人的吸引力。" },
  { id: 37, dim: 'exclusivity', text: "我不能接受伴侣对其他人产生“精神出轨”（如心动、依恋）。" },
  { id: 38, dim: 'exclusivity', text: "我不能接受伴侣和我在关系存续期间，与其他人发生肉体关系。" },
  { id: 39, dim: 'exclusivity', text: "我无法接受伴侣和异性（或同性）朋友单独去旅行。" },
  { id: 40, dim: 'exclusivity', text: "“爱是可以同时分给很多人的”这句话，听起来就像是为花心找的借口。" }
];

const PAGE_BREAKS = [10, 20, 30, 40]; // 10题/页

// =====================================================================
// 2. 辅助组件
// =====================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">恋爱观“出厂设置”检测</h1>
      
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">我们每个人的恋爱观，有多少是自己思考的结果，又有多少是社会文化潜移默化植入的“出厂设置”？</li>
          <li className="intro-item">本测试共 40 题，涵盖 8 个核心维度，从生活细节到核心价值观，为您进行一次深度扫描。</li>
          <li className="intro-item"><b>请注意：</b>得分越高，代表您的观念越符合主流规范（受规训程度越高）。</li>
          <li className="intro-item">这不仅仅是一个测试，更是一次“红药丸”般的觉醒体验。请诚实面对自己的第一直觉。</li>
        </ul>
      </div>

      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.2)'}}>
        开始检测
      </button>
    </div>
  </div>
);

// 分享气泡
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

// 雷达图组件 (复用逻辑)
const RadarChart = ({ scores, activeDim, onDimClick }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(DIMENSIONS);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  const getCoordinates = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = (value / 5) * radius; // 5分制
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const getLabelCoordinates = (index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius + 30;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const points = axes.map((key, i) => {
    const score = scores[key] || 0;
    const coords = getCoordinates(score, i);
    return `${coords.x},${coords.y}`;
  }).join(" ");

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
          {gridLevels}
          {axes.map((_, i) => {
            const start = getCoordinates(0, i);
            const end = getCoordinates(5, i);
            return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#e5e7eb" strokeWidth="1" />;
          })}
          <polygon points={points} fill="rgba(249, 115, 22, 0.2)" stroke="#f97316" strokeWidth="2" />
          {axes.map((key, i) => {
            const score = scores[key] || 0;
            const coords = getCoordinates(score, i);
            return <circle key={i} cx={coords.x} cy={coords.y} r="3" fill="#f97316" />;
          })}
          {axes.map((key, i) => {
            const coords = getLabelCoordinates(i);
            const isActive = activeDim === key;
            return (
              <text 
                key={key} x={coords.x} y={coords.y} 
                className={`radar-label-btn ${isActive ? 'active' : ''}`}
                onClick={() => onDimClick(key)}
              >
                {DIMENSIONS[key].name}
              </text>
            );
          })}
        </svg>
      </div>
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
// 3. 结果页 (Dashboard)
// =====================================================================

const ResultScreen = ({ answers, onRetry }) => {
  const [activeDim, setActiveDim] = useState('exclusivity'); // 默认选最后一个(通常分高)
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (showShare) {
      const timer = setTimeout(() => setShowShare(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showShare]);

  const scores = useMemo(() => {
    const raw = {};
    Object.keys(DIMENSIONS).forEach(k => raw[k] = 0);
    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (q) raw[q.dim] += val; // 简单累加，每题1-5分，每维度5题
    });

    const final = {};
    let totalSum = 0;
    Object.keys(raw).forEach(k => {
      final[k] = raw[k] / 5; // 平均分 (1-5)
      totalSum += raw[k];
    });
    
    // 总分: 满分200 (40*5) -> 映射到100%
    const totalPercentage = Math.round((totalSum / 200) * 100);
    return { dimScores: final, totalPercentage };
  }, [answers]);

  // 将维度按得分从高到低排序，只展示Top 4高分项（即受规训最深的）
  const highScores = useMemo(() => {
    return Object.entries(scores.dimScores)
      .sort(([, a], [, b]) => b - a)
      .map(([key, val]) => ({ key, val, ...DIMENSIONS[key] }))
      .slice(0, 4); // 展示前4个最“严重”的
  }, [scores]);

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>检测报告</h2>
        <p style={{color: '#6b7280', fontSize: '0.95rem'}}>以下是您的观念成分分析，此结果只展示一次，您可截图保存。</p>
      </div>

      {/* 1. 总分卡片 */}
      <div className="score-card">
        <div className="watermark">PolyCN.org</div>
        <div className="score-circle">
          <span className="score-big">{scores.totalPercentage}%</span>
        </div>
        <div className="score-comment">
          {scores.totalPercentage >= 80 ? "您是一位“标准剧本”的忠实执行者。" :
           scores.totalPercentage >= 60 ? "您在主流与自由之间，似乎正在寻找平衡。" :
           "您是一位亲密关系剧本的“即兴创作者”。"}
        </div>
        <div style={{marginTop: '1rem', fontSize:'0.85rem', color: '#6b7280'}}>
          * 数值越高，代表受传统单偶制规范影响越深
        </div>
      </div>

      {/* 2. 雷达图 */}
      <RadarChart scores={scores.dimScores} activeDim={activeDim} onDimClick={setActiveDim} />

      {/* 3. 深度解读 (只展示高分项) */}
      <div className="breakdown-section">
        <h3 className="breakdown-title">
          <span style={{color: '#f97316'}}>✦</span> 您的核心观念透视
        </h3>
        <p style={{marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.9rem'}}>
          以下维度是您受传统规范影响较深的领域。这并非错误，但了解它们，能帮您看清潜意识里的“默认选项”。
        </p>
        
        <div className="dim-grid">
          {highScores.map(d => (
            <div key={d.key} className="dim-card">
              <div className="dim-header">
                <span className="dim-name">{d.name}</span>
                <span className="dim-score" style={{color: '#f97316'}}>{d.val.toFixed(1)}</span>
              </div>
              <div className="dim-bar-bg">
                <div className="dim-bar-fill fill-mid" style={{width: `${(d.val/5)*100}%`, background: '#f97316'}}></div>
              </div>
              <p className="dim-text">{HIGH_SCORE_TEXTS[d.key]}</p>
            </div>
          ))}
        </div>
      </div>

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

      {/* 5. More Tests */}
      <div className="more-tests-section">
        <h4 className="more-title">更多测试</h4>
        <div className="test-grid">
          <div className="test-card completed">
            <span className="t-name">“出厂设置”检测</span>
            <span className="t-status">✅ 已完成</span>
          </div>
          <a href="/assessment/adaption" className="test-card active">
            <span className="t-name" style={{color: '#f97316'}}>关系适应性评估</span>
            <span className="t-desc">看看你的沟通与情绪能力</span>
          </a>
          <a href="/assessment/orientation" className="test-card active">
            <span className="t-name" style={{color: '#f97316'}}>关系形态倾向自测</span>
            <span className="t-desc">你是单偶还是多边？</span>
          </a>
        </div>
      </div>

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

const NormsQuiz = () => {
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
                <span className="dots-label-item">完全<br/>不同意</span>
                <span className="dots-label-item">不太<br/>同意</span>
                <span className="dots-label-item">中立<br/>说不清</span>
                <span className="dots-label-item">比较<br/>同意</span>
                <span className="dots-label-item">完全<br/>同意</span>
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

export default NormsQuiz;
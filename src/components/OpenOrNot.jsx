import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Assessment.css'; // 复用统一的样式系统
import MoreTests from './MoreTests';

// =====================================================================
// 1. 维度定义 (5x8 完美矩阵)
// =====================================================================

const DIMENSIONS = {
  trust: { name: "信任厚度", desc: "关系的滋养度与安全感基线" },
  comms: { name: "沟通机制", desc: "处理冲突与谈论困难话题的能力" },
  values: { name: "价值共识", desc: "底层三观的一致性" },
  resilience: { name: "情绪韧性", desc: "嫉妒与不安全感的自我消化能力" },
  indep: { name: "独立边界", desc: "精神独立与生活自主性" },
  reality: { name: "现实构造", desc: "资源、时间与麻烦的承受力" },
  equality: { name: "权利对等", desc: "对特权与双标的免疫力" },
  sex: { name: "性爱观念", desc: "性匹配度与观念的兼容性" }
};

// =====================================================================
// 2. 题目定义 (40题, 5分制, 部分反向计分)
// =====================================================================

const QUESTIONS = [
  // --- 维度1: 信任厚度 (Trust) ---
  { id: 1, dim: 'trust', text: "回顾过去一年，我觉得和 ta 在一起的大部分时间是轻松、“回血”的，而不是那种让我觉得心累、一直在“耗电”的感觉。" },
  { id: 4, dim: 'trust', text: "我感到在这段关系中非常安全，不需要通过查岗或随时报备来确认对方的爱。" },
  { id: 5, dim: 'trust', text: "我想尝试开放，是因为我觉得我们现在的感情挺好的，我也还有多余的精力去认识新的人；而不是因为我觉得现在的感情没意思了，想去外面找点刺激来弥补。" },
  { id: 6, dim: 'trust', text: "如果现在分手，我有信心我们依然能体面地对待彼此，而不会变成仇人。" },
  { id: 3, dim: 'trust', text: "我其实没那么在乎 ta 在外面有没有人，只要 ta 对我一直好，不破坏我现有生活的安稳和美好，我就能接受。" },

  // --- 维度2: 沟通机制 (Comms) ---
  { id: 7, dim: 'comms', text: "当伴侣指出我的缺点或让我感到受伤时，我能忍住不立刻反击，先听 ta 把话说完。" },
  { id: 9, dim: 'comms', text: "每次发生冲突后，我们通常能很快和好，不会长时间陷入冷战或互不搭理的状态。" },
  { id: 11, dim: 'comms', text: "如果我搞砸了某件事（如破坏了规则）并坦白告知，我相信 ta 在发泄完情绪冷静下来后，会愿意和我一起解决问题，而不是一直抓着不放。" },
  { id: 12, dim: 'comms', text: "同样地，如果对方搞砸了某件事并坦白，我也能控制住自己想攻击对方的冲动，在情绪平复后，尽可能平静地去解决事情本身。" },
  { id: 2, dim: 'comms', text: "每次吵架或者闹大矛盾，我们最后都能把话说开、真正“翻篇”，而不是嘴上不说心里记仇，下次吵架又把旧事翻出来说。" },

  // --- 维度3: 价值共识 (Values) ---
  { id: 13, dim: 'values', text: "我们都认为：忠诚与否应该由我们自己制定的标准来决定。只要是彼此知情同意的事，就算别人觉得是“出轨”，我们也不在乎。" },
  { id: 14, dim: 'values', text: "我们相信：归根结底，每个人都是独立自主的个体，而不是谁的私有财产。我有权支配我的身体和时间，ta 也是。" },
  { id: 15, dim: 'values', text: "我不觉得恋人关系一定就比朋友关系更高级。如果我和某个朋友相处得特别好，在我心里的分量甚至可能超过恋人，这没什么不对。" },
  { id: 8, dim: 'values', text: "我们可以毫无负担地讨论羞耻的性癖好，或者对其他人的心动细节。" },
  { id: 10, dim: 'values', text: "虽然还没定具体的规则，但对于“什么绝对不行”（比如带病回家、让熟人知道）这种底线问题，我相信我们俩的大方向是一致的。" },

  // --- 维度4: 情绪韧性 (Resilience) ---
  { id: 16, dim: 'resilience', text: "即使我会感到不舒服，但在想象伴侣和别人亲密的画面时，我有信心自己能慢慢消化这种情绪。" },
  { id: 17, dim: 'resilience', text: "当我感到嫉妒或不安时，我能直接表达“我需要安慰”，而不是通过发脾气来博取关注。" },
  { id: 18, dim: 'resilience', text: "我有稳定的自我价值感，不会因为伴侣夸奖别人，就觉得自己被贬低或不如别人。" },
  { id: 19, dim: 'resilience', text: "如果伴侣因为新恋情而容光焕发（热恋上头），我理智上能替 ta 感到高兴。" },
  { id: 26, dim: 'resilience', text: "我清楚地知道我的快乐由我自己负责，伴侣不是我的“情绪供养者”。" },

  // --- 维度5: 独立与边界 (Indep) ---
  { id: 23, dim: 'indep', text: "如果伴侣今晚去约会不回来，我一个人在家也能安排得丰富多彩，不会觉得凄凉。" },
  { id: 24, dim: 'indep', text: "我有核心的、独立于伴侣之外的社交圈，不完全依赖伴侣带我玩。" },
  { id: 27, dim: 'indep', text: "我们已经想好了，如果在这个城市遇到熟人或同事，该如何解释我们的关系状态（无论是实话实说，还是编个理由糊弄过去）。" },
  { id: 28, dim: 'indep', text: "即使我身边的环境（如亲戚、主流朋友圈）都坚定地拥护单偶制，我也依然想尝试开放，而不是因为大家都这样我才想试试。" },
  { id: 30, dim: 'indep', text: "我不太在意那些不重要的人（如普通同事、网友）怎么评价我的私生活。" },

  // --- 维度6: 现实构造 (Reality) ---
  { id: 20, dim: 'reality', text: "我的经济状况允许我谈两份恋爱，不会因为多了一个人的开销而感到手头拮据。" },
  { id: 21, dim: 'reality', text: "即使在工作最忙的时候，我也能保证每周都有高质量的时间专注陪伴现在的伴侣。" },
  { id: 22, dim: 'reality', text: "我做好了心理准备：开放关系不仅是浪漫和刺激，更意味着要花大量时间去沟通、去处理麻烦，这其实是一件很辛苦的事。" },
  { id: 29, dim: 'reality', text: "我们已经讨论过，遇到情人节、生日或过年这种特殊日子，该怎么分配陪伴时间（是必须陪原配，还是可以轮流），以免到时候心里不平衡。" },
  { id: 25, dim: 'reality', text: "遇到困难或情绪低落时，除了伴侣，我有其他可以倾诉和求助的朋友。" },

  // --- 维度7: 权利对等 (Equality) ---
  { id: 31, dim: 'equality', text: "如果开放一段时间后，我在外面很受欢迎，而 ta 一直没人理，我会觉得这种局面挺好的，甚至暗自松了一口气。", reverse: true },
  { id: 32, dim: 'equality', text: "无论我们约定了什么限制（比如不过夜），我都会像要求对方一样严格要求我自己。" },
  { id: 33, dim: 'equality', text: "如果这周五晚上 ta 出去约会过得很开心，而我没有约会只能一个人在家，我能坦然接受这种“暂时的落单”。" },
  { id: 34, dim: 'equality', text: "如果 ta 新认识的那个人让我感觉不舒服，我觉得我有权利要求 ta 立刻断绝来往，否则就是不爱我。", reverse: true },
  { id: 35, dim: 'equality', text: "我真心认为，伴侣拥有和我完全一样的权利去探索情感和性，不需要任何额外附加条件。" },

  // --- 维度8: 性爱观念 (Sex) ---
  { id: 36, dim: 'sex', text: "实话实说，我想开放（或同意开放），很大一部分原因是我们俩在性趣、频率或者玩法上这就凑不到一块去，但这又不至于让我们分手。" },
  { id: 37, dim: 'sex', text: "只要一想到 ta 刚和别人亲热过，回头再来亲我或者碰我，我生理上就会产生一种本能的恶心或者抗拒。", reverse: true },
  { id: 38, dim: 'sex', text: "在我看来，性很多时候就是一场双人运动或者解压方式，跟“爱不爱”没多大关系，睡了别人不代表背叛。" },
  { id: 39, dim: 'sex', text: "如果我知道 ta 在别人那里获得了比我能给的更爽的性体验，我会觉得非常挫败，感觉自己作为一个男人/女人的尊严被打击了。", reverse: true },
  { id: 40, dim: 'sex', text: "对于戴套、定期去医院检查这些事，我们俩都是那种特别怕死、特别惜命的人，绝对不会因为一时兴起就心存侥幸。" }
];

const PAGE_BREAKS = [5, 10, 15, 20, 25, 30, 35, 40];

// =====================================================================
// 3. 结果反馈逻辑
// =====================================================================

const STARTERS = {
  trust: "如果我们分手了，你觉得最可能的原因会是什么？是感情淡了，还是因为有了别人？",
  comms: "上一次我们吵架吵得很凶，是因为什么？如果下次因为谈恋爱的事情吵架，我们约定个什么暗号来暂停？",
  values: "在你心里，到底是“睡了别人”算背叛，还是“对我也撒谎”算背叛？为什么？",
  resilience: "如果我今晚出去见人很开心，回家后你是希望我跟你分享细节，还是希望我闭嘴别提？",
  indep: "如果周末我出去谈恋爱一天不回来，你一个人在家打算安排点什么活动让自己开心？",
  reality: "明年情人节或者你的生日，如果我们都有了新恋爱对象，这天该怎么分？是各玩各的，还是必须留给彼此？",
  equality: "说实话，如果我在外面很受欢迎，约会不断，而你一直找不到合适的人，你会觉得失落或者不公平吗？",
  sex: "如果我和别人发生了关系，回来后想亲你，你会觉得膈应或者“脏”吗？我们需要设定什么缓冲期（比如洗澡）吗？"
};

const getFeedbackText = (dimKey, score) => {
  const isHigh = score >= 4;
  const isLow = score <= 2.5;

  const texts = {
    trust: {
      low: "你们的关系目前处于消耗状态，或者存在未解决的矛盾。",
      high: "你们之间有深厚的安全感依恋，这是开放关系最坚实的后盾。"
    },
    comms: {
      low: "你们习惯用冷战或爆发来处理分歧，目前的机制容易导致误解。",
      high: "你们具备谈论困难话题的能力，能帮你们避开 90% 的雷区。"
    },
    values: {
      low: "你们的三观存在根本性冲突，这种认知错位强行开放会带来痛苦。",
      high: "你们在忠诚、独立和身体自主权上有着高度一致的现代观念。"
    },
    resilience: {
      low: "你的心理承受力较弱，容易陷入自我怀疑，可能更适合高排他性环境。",
      high: "你有强大的自我安抚能力，能识别嫉妒只是情绪信号而非事实。"
    },
    indep: {
      low: "你们处于“共生”状态，缺乏独立行走的能力，容易产生强烈的失落感。",
      high: "你们是两个完整的圆，拥有独立的社交圈和独处能力。"
    },
    reality: {
      low: "现实条件不支持。无论是经济拮据还是时间匮乏，都支撑不起第二段关系。",
      high: "你们很务实，有足够的资源盈余去应对开放带来的麻烦。"
    },
    equality: {
      low: "存在特权思维。这种开放往往是一方对另一方的剥削，不是健康的关系。",
      high: "你们真心尊重彼此的权利，不存在“只许州官放火”的特权思想。"
    },
    sex: {
      low: "存在严重的生理排斥或性观念冲突，强行违背身体意愿会造成创伤。",
      high: "你们能将性与爱适度解绑，且风控意识极强。"
    }
  };
  
  if (isLow) return texts[dimKey].low;
  if (isHigh) return texts[dimKey].high;
  return "你们在这一项上表现尚可，但仍有提升空间，建议多加留意。";
};

// =====================================================================
// 4. 子组件
// =====================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">开放关系准备度自查</h1>
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">开放关系不是解决问题的灵药，它是关系的“放大镜”。</li>
          <li className="intro-item">本评估共 40 题，从<b>关系内功、现实资源、核心观念</b>等 8 个维度，帮你客观盘点这段关系目前的“抗震等级”。</li>
          <li className="intro-item"><b>注意：</b>默认你们已处于一段单偶制关系中。请诚实面对内心。</li>
        </ul>
      </div>
      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.1)'}}>
        开始评估
      </button>
    </div>
    <MoreTests currentId="openornot" status="welcome" />
  </div>
);

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

// 雷达图 (带交互)
const RadarChart = ({ scores, activeDim, onDimClick }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(DIMENSIONS);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  const getCoordinates = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = (value / 5) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const getLabelCoordinates = (index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = radius + 25;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const points = axes.map((key, i) => {
    const score = scores[key] || 0;
    const coords = getCoordinates(score, i);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  return (
    <div className="radar-section" style={{marginBottom: '2rem'}}>
      <div className="radar-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} style={{width: '100%', height: '100%'}}>
          {/* 网格层 */}
          {[1, 2, 3, 4, 5].map(level => (
            <polygon 
              key={level} 
              points={axes.map((_, i) => {
                const c = getCoordinates(level, i);
                return `${c.x},${c.y}`;
              }).join(" ")} 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="1" 
            />
          ))}
          {/* 轴线 */}
          {axes.map((_, i) => {
            const s = getCoordinates(0, i);
            const e = getCoordinates(5, i);
            return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#e5e7eb" strokeWidth="1" />;
          })}
          {/* 数据层 */}
          <polygon points={points} fill="rgba(230, 149, 37, 0.2)" stroke="#e69525" strokeWidth="2" />
          {axes.map((key, i) => {
            const c = getCoordinates(scores[key] || 0, i);
            return <circle key={i} cx={c.x} cy={c.y} r="3" fill="#e69525" />;
          })}
          {/* 标签层 (可点击) */}
          {axes.map((key, i) => {
            const c = getLabelCoordinates(i);
            const isActive = activeDim === key;
            return (
              <text 
                key={key} x={c.x} y={c.y} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                onClick={() => onDimClick(key)}
                style={{
                  fontSize:'0.75rem', 
                  fill: isActive ? '#e69525' : '#6b7280',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {DIMENSIONS[key].name}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* 联动分数标签 (参考 NormsQuiz) */}
      {activeDim && (
        <div className="radar-stat-box" style={{
          borderColor: '#fed7aa', 
          background: '#fff7ed', 
          marginTop: '-1rem',
          textAlign: 'center'
        }}>
          <div className="stat-name" style={{color: '#9a3412'}}>{DIMENSIONS[activeDim].name}</div>
          <div className="stat-val" style={{color: '#ea580c'}}>{scores[activeDim].toFixed(1)} / 5.0</div>
          <div className="stat-desc" style={{color: '#c2410c', fontSize: '0.9rem'}}>{DIMENSIONS[activeDim].desc}</div>
        </div>
      )}
    </div>
  );
};

const ResultScreen = ({ answers, onRetry }) => {
  const [showShare, setShowShare] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [activeDim, setActiveDim] = useState('trust'); // 默认选中第一个维度

  // 计算分数
  const scores = useMemo(() => {
    const raw = {};
    const count = {};
    Object.keys(DIMENSIONS).forEach(k => { raw[k] = 0; count[k] = 0; });

    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (q) {
        const actualVal = q.reverse ? (6 - val) : val;
        raw[q.dim] += actualVal;
        count[q.dim] += 1;
      }
    });

    const dimScores = {};
    let totalSum = 0;
    Object.keys(raw).forEach(k => {
      dimScores[k] = count[k] > 0 ? (raw[k] / count[k]) : 0;
      totalSum += raw[k];
    });

    const totalScore = Math.round((totalSum / 200) * 100);
    return { dimScores, totalScore };
  }, [answers]);

  // 判定状态
  let status = 'green';
  if (scores.totalScore < 60) status = 'red';
  else if (scores.totalScore < 85) status = 'yellow';

  const statusConfig = {
    red: { color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', title: '🔴 红灯 · 暂缓行动', sub: '地基晃动，请勿动工', text: '你们的关系目前处于“亏空”状态。测试显示，你们在地基信任、沟通机制或核心观念上存在较大分歧。此时引入开放关系，极大概率会破坏现有的稳定。' },
    yellow: { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', title: '🟡 黄灯 · 谨慎尝试', sub: '带病上阵，需备好药箱', text: '你们有尝试的意愿，但“装备”尚未齐全。你们现在的状态可以维持单偶制，但应对开放关系的复杂性会比较吃力。建议先放慢速度，针对短板进行补课。' },
    green: { color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', title: '🟢 绿灯 · 状态良好', sub: '状态良好，祝旅途愉快', text: '你们拥有坚实的信任、成熟的沟通机制以及高度的观念共识。对你们而言，开放关系不再是逃避问题的手段，而是丰富彼此生命的探索。' }
  };
  const currentStatus = statusConfig[status];

  // 熔断检测
  const meltdowns = [];
  if (scores.dimScores.trust < 2.5) meltdowns.push({ name: "信任熔断", text: "检测到关系地基严重不稳。此时开放无异于在一栋快倒塌的房子上加盖楼层。请立刻停止计划。" });
  if (scores.dimScores.comms < 2.5) meltdowns.push({ name: "沟通熔断", text: "缺乏处理高难度对话的机制。在学会“如何不带攻击地吵架”之前，请勿尝试。" });
  if (scores.dimScores.equality < 2.5) meltdowns.push({ name: "权利熔断", text: "检测到严重的“双重标准”倾向。这种不对等的开放是剥削性的，会导致严重心理失衡。" });
  if (scores.dimScores.sex < 2.5) meltdowns.push({ name: "性观念熔断", text: "存在严重的生理排斥或性观念冲突。请尊重身体的直觉，不要强迫自己受罪。" });

  // 最低分维度 -> 聊天话题
  const lowestDim = Object.keys(scores.dimScores).reduce((a, b) => scores.dimScores[a] < scores.dimScores[b] ? a : b);
  const starterText = STARTERS[lowestDim];

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>评估报告</h2>
      </div>

      {/* 1. 总分红绿灯卡片 (深色高级感) */}
      <div className="score-card" style={{
        background: `linear-gradient(135deg, ${currentStatus.color} 0%, ${status === 'yellow' ? '#92400e' : status === 'red' ? '#7f1d1d' : '#064e3b'} 100%)`,
        boxShadow: `0 10px 30px -10px ${currentStatus.color}66`
      }}>
        <div className="watermark">PolyCN</div>
        <div className="score-circle">
          <span className="score-big" style={{
             background: 'linear-gradient(180deg, #fff 0%, #e5e7eb 100%)',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent'
          }}>{scores.totalScore}</span>
        </div>
        <div className="score-comment" style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'white'}}>
          {currentStatus.title}
        </div>
        <div style={{color: 'rgba(255,255,255,0.85)', marginTop: '0.5rem', fontSize: '0.95rem'}}>
          {currentStatus.text}
        </div>
      </div>

      {/* 2. 熔断警报 */}
      {meltdowns.length > 0 && (
        <div style={{margin: '1.5rem 0'}}>
          {meltdowns.map((m, i) => (
            <div key={i} style={{
              background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '1rem', marginBottom: '0.8rem', borderRadius: '4px'
            }}>
              <strong style={{color: '#991b1b'}}>⛔ {m.name}：</strong>
              <span style={{color: '#b91c1c'}}>{m.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* 3. 雷达图 (带交互) */}
      <RadarChart scores={scores.dimScores} activeDim={activeDim} onDimClick={setActiveDim} />

      {/* 4. 今晚聊什么 */}
      <div style={{background: '#f3f4f6', padding: '1.5rem', borderRadius: '12px', margin: '2rem 0', border: '1px dashed #9ca3af'}}>
        <h3 style={{margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: '#374151'}}>💬 今晚聊什么？</h3>
        <p style={{marginBottom: '0.8rem', color: '#4b5563', fontSize: '0.9rem'}}>针对本次测试出的短板，今晚你们可以坦诚讨论一下：</p>
        <p style={{margin: 0, color: '#1f2937', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.6}}>
          “{starterText}”
        </p>
      </div>

      {/* 5. 详细诊断 (折叠 + Grid布局) */}
      <div style={{marginBottom: '2rem'}}>
        <button 
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          style={{
            width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid #d1d5db', 
            borderRadius: '99px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#6b7280', fontSize: '0.9rem', transition: 'all 0.2s'
          }}
        >
          {isDetailsExpanded ? "收起详细诊断报告 ⬆️" : "点击展开详细报告 ⬇️"}
        </button>
        
        {isDetailsExpanded && (
          <div className="animate-fade-in" style={{
            marginTop: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // 响应式 Grid：电脑双栏，手机单栏
            gap: '0.8rem'
          }}>
            {/* 平铺所有8个维度 */}
            {Object.keys(DIMENSIONS).map(key => (
              <div key={key} style={{
                background: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems:'center'}}>
                  <span style={{fontWeight:'bold', color:'#374151', fontSize:'0.95rem'}}>{DIMENSIONS[key].name}</span>
                  <span style={{
                    color: scores.dimScores[key] < 3 ? '#ef4444' : scores.dimScores[key] >= 4 ? '#10b981' : '#f59e0b',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>{scores.dimScores[key].toFixed(1)}</span>
                </div>
                <p style={{fontSize:'0.85rem', color:'#6b7280', margin:0, lineHeight: 1.5}}>
                  {getFeedbackText(key, scores.dimScores[key])}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="result-actions">
        <div style={{position: 'relative', width: '100%'}}>
          {showShare && <SharePopover onClose={() => setShowShare(false)} />}
          <div onClick={() => setShowShare(true)} className="action-card-btn btn-share-style">
            <strong>分享结果</strong>
          </div>
        </div>
        <div onClick={onRetry} className="action-card-btn btn-retry-style">
          <strong>重新测试</strong>
        </div>
      </div>

      <MoreTests currentId="openornot" status="result" />
      <div className="mini-nav">
        <a href="/" className="mini-link">回到首页</a>
        <a href="/assessment" className="mini-link">更多测试</a>
      </div>
    </div>
  );
};

// =====================================================================
// 5. 主程序
// =====================================================================

const OpenOrNot = () => {
  const [started, setStarted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);

  // 翻页逻辑
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
          <div className="progress-fill" style={{ width: `${progress}%`, background: '#e69525' }}></div>
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
                  <div className={`dot-circle dot-size-${val} dot-color-${val}`} style={{
                    // 修正：使用橙色系 (落日橙)
                    borderColor: '#e69525', 
                    backgroundColor: answers[q.id] === val ? '#e69525' : 'transparent'
                  }}></div>
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
        <button onClick={handleNext} className={`btn-next ${shakeBtn ? 'animate-shake' : ''}`} style={{backgroundColor: '#e69525'}}>
          {pageIndex < PAGE_BREAKS.length - 1 ? "下一页" : "查看结果"}
        </button>
      </div>
    </div>
  );
};

export default OpenOrNot;
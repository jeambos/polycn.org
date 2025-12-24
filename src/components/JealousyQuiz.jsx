import React, { useState, useMemo } from 'react';
import '../styles/Assessment.css'; // 复用统一的样式系统
import MoreTests from './MoreTests';

// =====================================================================
// 1. 维度定义 (7大嫉妒原型)
// =====================================================================

const DIMENSIONS = {
  competitive: { name: "竞争型", desc: "向上比较：担心技不如人，核心是“怕输”" },
  self_esteem: { name: "自尊型", desc: "向下比较：感到品味受辱，核心是“怕丢人”" },
  normative: { name: "观念型", desc: "超我审判：生理性厌恶，核心是“道德焦虑”" },
  abandonment: { name: "遗弃型", desc: "依恋断裂：恐惧连接消失，核心是“怕被抛弃”" },
  exclusion: { name: "排斥型", desc: "信息隔离：局外人焦虑，核心是“不知情”" },
  territorial: { name: "领地型", desc: "资源失控：权益被侵占，核心是“秩序破坏”" },
  projective: { name: "投射型", desc: "阴影投射：贼喊捉贼，核心是“自身欲望的镜像”" }
};

// =====================================================================
// 2. 题目与选项 (10个核心场景，去文学化描述)
// =====================================================================

const QUESTIONS = [
  {
    id: 1,
    title: "场景：强弱并存的新人",
    scenario: "伴侣向你介绍了新对象。你发现这个人在某些方面很有吸引力（如年轻/外貌），但在社会地位、收入或学历上明显不如你。",
    options: [
      { dim: 'competitive', text: "既然选择了那一型，说明在那方面（如年轻/外貌）我确实不如别人，我失去了核心竞争力。" },
      { dim: 'self_esteem', text: "Ta 怎么会看上这种层次的人？这侧面说明了我在 ta 心里也就是这种档次，拉低了我的身价。" },
      { dim: 'normative', text: "这种“高低配”的关系模式（如巨大的年龄/阶级差），让我本能地觉得充满利用色彩，是不道德的。" },
      { dim: 'projective', text: "其实我也挺想找个这种单纯漂亮但没啥背景的人，伴侣只是把我想做的事做出来了。" },
      { dim: 'abandonment', text: "那个人的某些特质（如青春）是我已经失去的，伴侣会因为贪图这些新鲜感而逐渐疏远我。" }
    ]
  },
  {
    id: 2,
    title: "场景：约会后的高能量",
    scenario: "伴侣约会回来，状态明显比平时好很多，甚至比和你在一起时显得更开心、更有活力。",
    options: [
      { dim: 'exclusion', text: "他们肯定发生了什么我不知道的好事。我感觉像个局外人，被隔绝在了 ta 的快乐源泉之外。" },
      { dim: 'competitive', text: "看来那个人比我更有趣、或者性能力更好，才能让 ta 获得这种满足感。" },
      { dim: 'territorial', text: "Ta 把最好的情绪和精力都消耗在外面了，留给我的只剩残羹冷炙（疲惫），这是对我权益的侵占。" },
      { dim: 'normative', text: "看着自己爱的人刚从别人怀里回来还这么高兴，这违背了亲密关系的排他性本能，让我生理上感到恶心。" },
      { dim: 'abandonment', text: "Ta 那么开心，说明 ta 并不需要我也可以过得很好……这种“不需要”让我感到恐慌。" }
    ]
  },
  {
    id: 3,
    title: "场景：手机避嫌",
    scenario: "你们坐在一起，伴侣的手机响了，你们都意识到是外面的新人发来的。此时 ta 选择找个你看不到的地方（如侧过身）回复消息。",
    options: [
      { dim: 'exclusion', text: "这种刻意建立“秘密小世界”的行为，比 ta 真的做了什么更让我难受，我不喜欢被蒙在鼓里。" },
      { dim: 'projective', text: "这么遮遮掩掩往往意味着心里有鬼，就像我如果有秘密不想让 ta 知道时一样。" },
      { dim: 'territorial', text: "现在是属于我们的陪伴时间，ta 却在回应别人。这是对我们共同时间的盗用。" },
      { dim: 'competitive', text: "Ta 此时此刻更在意那个人的消息，而不是身边的我。在那个人面前，我被比下去了。" },
      { dim: 'self_esteem', text: "这种当着我的面防着我的行为，是不信任的表现，让我觉得自己像个外人，很伤自尊。" }
    ]
  },
  {
    id: 4,
    title: "场景：资源的倾斜",
    scenario: "你发现为了给新对象庆祝生日，ta 表现得非常用心（准备昂贵礼物或策划复杂行程），似乎很久没有对你这么用心了。",
    options: [
      { dim: 'territorial', text: "无论是钱还是精力，这本该是用于建设我们家庭/关系的资源。给外人花这么多，是对共同利益的损害。" },
      { dim: 'self_esteem', text: "对外人那么隆重，对我就这么随便？这让我觉得我不值钱，在这个关系里的地位受到了轻视。" },
      { dim: 'normative', text: "亲密关系应该有主次之分。把高规格的待遇给次要伴侣，打破了“厚此薄彼”的应有规矩。" },
      { dim: 'competitive', text: "行动证明了一切，ta 显然更爱那个人。我在 ta 心里的重要性排名下降了。" },
      { dim: 'projective', text: "我平时为了顾家压抑了给别人花钱的冲动，ta 凭什么就可以这么放肆地挥霍？" }
    ]
  },
  {
    id: 5,
    title: "场景：性体验的差异",
    scenario: "伴侣无意中透露，新对象在床上有一些你没有的特质（如更狂野、或有特殊癖好），让 ta 体验到了不同的快感。",
    options: [
      { dim: 'normative', text: "那些玩法太出格/太脏了。这种“淫乱”的画风让我觉得羞耻，不仅是对 ta，也是对我自己。" },
      { dim: 'competitive', text: "原来 ta 喜欢那种？那我是不是太无趣了？我担心因为无法满足这点，ta 会对我失去性趣。" },
      { dim: 'exclusion', text: "你们在性上建立了某种我无法介入的特殊连接/秘密盟约，这让我觉得自己是不完整的。" },
      { dim: 'projective', text: "听得我都心动了。其实我也想玩点刺激的，只是之前没敢提。与其说是嫉妒，不如说是羡慕。" },
      { dim: 'abandonment', text: "性是情感的粘合剂。如果他们在身体上更契合，这种深度连接迟早会带走 ta 的心。" }
    ]
  },
  {
    id: 6,
    title: "场景：社交圈的流言",
    scenario: "你发现你们共同的朋友圈里（如朋友群或熟人），似乎有人知道了ta有新对象这件事，并对此有一些议论。",
    options: [
      { dim: 'self_esteem', text: "这让我很没面子。大家可能会觉得我管不住伴侣，或者觉得我软弱/被绿了，损害了我的社会形象。" },
      { dim: 'territorial', text: "我们的关系状态是私事。让外人知道并评头论足，侵犯了我的隐私边界。" },
      { dim: 'normative', text: "这种事关起门来怎么玩都行，但闹得人尽皆知就是伤风败俗，破坏了体面。" },
      { dim: 'exclusion', text: "别人都知道了，我可能是最后知道（或者无法控制信息传播）的人。我失去了对局面的掌控感。" },
      { dim: 'competitive', text: "大家肯定在拿我和那个新人做比较。万一大家觉得那个人比我更适合 ta，我就彻底下不来台了。" }
    ]
  },
  {
    id: 7,
    title: "场景：当你脆弱时",
    scenario: "你生病了或心情低落，但伴侣早就和新人约好了出门。Ta 犹豫了一下，还是决定按原计划去约会，只留给你基本的照顾。",
    options: [
      { dim: 'abandonment', text: "在我最需要 ta 的时候，ta 选择了别人。这证明了我不是第一位的，我是被抛弃的。" },
      { dim: 'normative', text: "照顾生病的伴侣是基本责任和道义。Ta 这么做就是自私、冷血、不负责任。" },
      { dim: 'territorial', text: "我现在的状态需要人陪，这是我作为伴侣应得的权益。Ta 却把这个时间给了别人，这是克扣了我的权益。" },
      { dim: 'self_esteem', text: "为了重要公事也就算了，为了去约会而丢下生病的我？我在你心里就这么不值钱吗？" },
      { dim: 'projective', text: "换作是我，如果 ta 生病了而我想去约会，我可能也会想溜。但我不敢，ta 竟然真敢这么做。" }
    ]
  },
  {
    id: 8,
    title: "场景：风格的冲突",
    scenario: "你发现新对象是一个和你风格完全相反的人。比如你很精致上进，那个人却很散漫颓废（或者反之）。",
    options: [
      { dim: 'self_esteem', text: "找这种人说明 ta 的品味也就那样了。这不仅是否定 ta 自己，也是在间接拉低我的档次（物以类聚）。" },
      { dim: 'competitive', text: "原来 ta 内心深处喜欢的是那种类型？那我这些年努力维持的形象算什么？我是不是一开始就不是 ta 的理想型？" },
      { dim: 'projective', text: "其实我潜意识里也想活成那样。Ta 找那个人，其实是补全了我们关系里缺失/压抑的那一块。" },
      { dim: 'exclusion', text: "他们那个圈子的氛围（如艺术圈/学术圈）是我完全插不上嘴的。他们处于一个我无法理解的世界里。" },
      { dim: 'normative', text: "这种类型的人一看就不靠谱/太虚伪。我担心伴侣被骗，或者沾染上不好的习气。" }
    ]
  },
  {
    id: 9,
    title: "场景：深度共鸣",
    scenario: "你看到他们正在深入探讨一个你完全不感兴趣、或者听不懂的话题（如某个游戏、专业领域），两人显得极其默契。",
    options: [
      { dim: 'exclusion', text: "那种“只有我们懂”的氛围让我难受。我感觉自己像个傻瓜一样被隔绝在他们的精神世界之外。" },
      { dim: 'abandonment', text: "身体的背叛我能忍，这种灵魂的契合让我觉得我彻底失去了 ta。这种连接是无法被替代的。" },
      { dim: 'competitive', text: "我一直以为我才是最懂 ta 的人。现在出现了一个比我更懂 ta 的人，我“灵魂伴侣”的位置不保了。" },
      { dim: 'self_esteem', text: "他们聊那些显得很高深，是在显摆吗？这让我觉得自己显得很无知、很浅薄，很伤自尊。" },
      { dim: 'projective', text: "真羡慕他们能聊这些。其实我也想找个能聊得来的，而不是只能和伴侣聊柴米油盐。" }
    ]
  },
  {
    id: 10,
    title: "场景：节日的分配",
    scenario: "情人节快到了。伴侣提出，想把情人节拆成两半，白天陪你，晚上去陪新对象（或者反之）。",
    options: [
      { dim: 'normative', text: "情人节本来就是属于“一对”伴侣的特殊日子。把它拆分是对我们关系的亵渎，违背了爱的定义。" },
      { dim: 'territorial', text: "不管是白天还是晚上，这一整天的时间主权都应该是我的。我不接受任何形式的“共享”。" },
      { dim: 'self_esteem', text: "如果让别人知道我情人节只能分到半天，我还要不要面子了？这让我觉得自己像个“兼职”伴侣。" },
      { dim: 'competitive', text: "为什么要分？是因为 ta 觉得只陪我一个人不够满足吗？我们在 ta 心里到底谁更重要？" },
      { dim: 'abandonment', text: "今天分半天，明天是不是就分全天了？这种边界的退让让我觉得很不安全，感觉我们的关系在一点点被蚕食。" }
    ]
  }
];

// =====================================================================
// 3. 子组件：欢迎页
// =====================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">嫉妒类型图谱</h1>
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">嫉妒不是一种单一情绪，它是内心深层需求的信号灯。</li>
          <li className="intro-item">本测试包含 <b>10 个典型场景</b>，用于探索你在亲密关系中的“嫉妒原型”。</li>
          <li className="intro-item">我们将分析你是更害怕<b>“被抛弃”</b>、更在意<b>“输赢”</b>，还是觉得<b>“丢面子”</b>。</li>
          <li className="intro-item"><b>作答方式：</b>每题分两步，先选“最痛点”，再选“共鸣点”。</li>
        </ul>
      </div>
      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.1)'}}>
        开始探索
      </button>
    </div>
    <MoreTests currentId="jealousy" status="welcome" />
  </div>
);

// =====================================================================
// 4. 子组件：结果页
// =====================================================================

const RadarChart = ({ scores, activeDim, onDimClick }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(DIMENSIONS);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;
  
  // 归一化分数 (假设最高分约 15-20，归一化到 0-100% 用于绘图)
  // Step 1 (3分) * 10题 = 30分 max. 但单维度理论最大值约为 3*7 + 1*? ≈ 25
  // 我们设定 radius 对应 15分，超过则顶格
  const MAX_VAL = 12; 

  const getCoordinates = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2;
    // 限制最大半径
    const r = (Math.min(value, MAX_VAL) / MAX_VAL) * radius;
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

  return (
    <div className="radar-section" style={{marginBottom: '2rem'}}>
      <div className="radar-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} style={{width: '100%', height: '100%'}}>
          {[0.2, 0.4, 0.6, 0.8, 1].map(level => (
            <polygon 
              key={level} 
              points={axes.map((_, i) => {
                const angle = i * angleSlice - Math.PI / 2;
                const r = radius * level;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(" ")} 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="1" 
            />
          ))}
          {axes.map((_, i) => {
            const s = getCoordinates(0, i);
            const e = getCoordinates(MAX_VAL, i); // 轴线画满
            return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#f3f4f6" strokeWidth="1" />;
          })}
          <polygon points={points} fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" />
          {axes.map((key, i) => {
            const c = getCoordinates(scores[key] || 0, i);
            return <circle key={i} cx={c.x} cy={c.y} r="3" fill="#ec4899" />;
          })}
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
                  fill: isActive ? '#db2777' : '#6b7280',
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
      
      {activeDim && (
        <div className="radar-stat-box" style={{
          borderColor: '#fbcfe8', background: '#fdf2f8', marginTop: '-1rem', textAlign: 'center'
        }}>
          <div className="stat-name" style={{color: '#be185d'}}>{DIMENSIONS[activeDim].name}</div>
          <div className="stat-desc" style={{color: '#db2777', fontSize: '0.9rem'}}>{DIMENSIONS[activeDim].desc}</div>
        </div>
      )}
    </div>
  );
};

const ResultScreen = ({ answers, onRetry }) => {
  const [activeDim, setActiveDim] = useState(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true); // 默认展开

  // 计算分数
  // Step 1 = 3分, Step 2 = 1分
  const scores = useMemo(() => {
    const raw = {};
    Object.keys(DIMENSIONS).forEach(k => raw[k] = 0);

    Object.values(answers).forEach(ans => {
      // ans: { primary: 'competitive', secondary: ['territorial', ...] }
      if (ans.primary) raw[ans.primary] += 3;
      if (ans.secondary && ans.secondary.length) {
        ans.secondary.forEach(dim => raw[dim] += 1);
      }
    });
    return raw;
  }, [answers]);

  // 找出得分最高的维度 (主导类型)
  const topDim = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>你的嫉妒画像</h2>
      </div>

      {/* 1. 主导类型卡片 */}
      <div className="score-card" style={{
        background: `linear-gradient(135deg, #ec4899 0%, #be185d 100%)`,
        boxShadow: `0 10px 30px -10px rgba(236, 72, 153, 0.4)`
      }}>
        <div className="watermark">PolyCN</div>
        <div style={{color:'white', opacity:0.9, marginBottom:'0.5rem'}}>主导原型</div>
        <div className="score-comment" style={{fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom:'0.5rem'}}>
          {DIMENSIONS[topDim].name}
        </div>
        <div style={{color: 'rgba(255,255,255,0.9)', fontSize: '1rem'}}>
          {DIMENSIONS[topDim].desc}
        </div>
      </div>

      {/* 2. 雷达图 */}
      <RadarChart scores={scores} activeDim={activeDim || topDim} onDimClick={setActiveDim} />

      {/* 3. 详细诊断 (Grid布局) */}
      <div style={{marginBottom: '2rem'}}>
        <button 
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          style={{
            width: '100%', padding: '0.6rem', background: 'transparent', border: '1px solid #d1d5db', 
            borderRadius: '99px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: '#6b7280', fontSize: '0.9rem', transition: 'all 0.2s', marginBottom: '1rem'
          }}
        >
          {isDetailsExpanded ? "收起详细报告 ⬆️" : "点击展开详细报告 ⬇️"}
        </button>
        
        {isDetailsExpanded && (
          <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.8rem'
          }}>
            {Object.keys(DIMENSIONS).sort((a,b) => scores[b] - scores[a]).map(key => (
              <div key={key} style={{
                background: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                opacity: scores[key] === 0 ? 0.6 : 1
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems:'center'}}>
                  <span style={{fontWeight:'bold', color:'#374151', fontSize:'1rem'}}>{DIMENSIONS[key].name}</span>
                  <span style={{
                    color: key === topDim ? '#db2777' : '#6b7280',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>{scores[key]} 分</span>
                </div>
                <p style={{fontSize:'0.85rem', color:'#4b5563', margin:0, lineHeight: 1.5}}>
                  {DIMENSIONS[key].desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="result-actions">
        <div className="action-card-btn btn-retry-style" onClick={onRetry}>
          <strong>重新测试</strong>
        </div>
      </div>
      <MoreTests currentId="jealousy" status="result" />
       <div className="mini-nav">
        <a href="/" className="mini-link">回到首页</a>
        <a href="/assessment" className="mini-link">更多测试</a>
      </div>
    </div>
  );
};

// =====================================================================
// 5. 主程序 (两步交互逻辑)
// =====================================================================

const JealousyQuiz = () => {
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0); // 当前题号
  const [step, setStep] = useState(1); // 1: 选最符合(单选), 2: 选其他(多选)
  
  // 答案结构: { 1: { primary: 'A', secondary: ['B'] }, ... }
  const [answers, setAnswers] = useState({});
  const [tempSecondary, setTempSecondary] = useState([]); // Step 2 的临时多选状态
  const [showResult, setShowResult] = useState(false);

  const currentQ = QUESTIONS[qIndex];

  const handleStart = () => {
    setStarted(true);
    window.scrollTo(0,0);
  };

  // Step 1: 选中一个最符合的 -> 自动跳到 Step 2
  const handlePrimarySelect = (dimKey) => {
    // 记录 Primary
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], primary: dimKey }
    }));
    // 准备进入 Step 2
    setTempSecondary([]);
    setStep(2);
  };

  // Step 1: 没有最符合的 -> 记录 null -> 跳到 Step 2
  const handlePrimaryNone = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], primary: null }
    }));
    setTempSecondary([]);
    setStep(2);
  };

  // Step 2: 切换多选项
  const toggleSecondary = (dimKey) => {
    // 如果该选项已经被选为 Primary，则不能再选（理论上UI应该屏蔽）
    if (answers[currentQ.id]?.primary === dimKey) return;

    setTempSecondary(prev => {
      if (prev.includes(dimKey)) return prev.filter(k => k !== dimKey);
      return [...prev, dimKey];
    });
  };

  // Step 2: 确认提交本题 -> 下一题
  const handleNextQuestion = () => {
    // 保存 Step 2 结果
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], secondary: tempSecondary }
    }));

    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(prev => prev + 1);
      setStep(1);
      window.scrollTo(0,0);
    } else {
      setShowResult(true);
      window.scrollTo(0,0);
    }
  };

  const handleRetry = () => {
    setStarted(false);
    setQIndex(0);
    setStep(1);
    setAnswers({});
    setShowResult(false);
  };

  if (!started) return <WelcomeScreen onStart={handleStart} />;
  if (showResult) return <ResultScreen answers={answers} onRetry={handleRetry} />;

  const currentPrimary = answers[currentQ.id]?.primary;

  return (
    <div className="quiz-container animate-fade-in">
      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`, background: '#ec4899' }}></div>
        </div>
      </div>

      <div className="quiz-card" style={{paddingBottom: '6rem'}}> {/* 底部留白给固定按钮 */}
        <h3 className="question-text" style={{fontSize: '1.1rem', marginBottom: '0.5rem', color: '#831843'}}>
          {currentQ.title}
        </h3>
        <p style={{fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#374151'}}>
          {currentQ.scenario}
        </p>
        
        {/* 提示条 */}
        <div style={{
          background: step === 1 ? '#fdf2f8' : '#f0fdf4',
          color: step === 1 ? '#be185d' : '#15803d',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {step === 1 ? (
            <><span>Step 1:</span> 请凭直觉选出 1 个<b>最戳中你</b>的想法</>
          ) : (
            <><span>Step 2:</span> 还有哪些想法你<b>也有一点</b>？(可多选)</>
          )}
        </div>

        <div className="options-list">
          {currentQ.options.map((opt, idx) => {
            // 状态判断
            const isPrimary = currentPrimary === opt.dim;
            const isSecondary = tempSecondary.includes(opt.dim);
            
            // Step 1 逻辑
            if (step === 1) {
              return (
                <div 
                  key={idx} 
                  onClick={() => handlePrimarySelect(opt.dim)}
                  className="option-item"
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    marginBottom: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.8rem'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', 
                    border: '2px solid #d1d5db', flexShrink: 0, marginTop: '2px'
                  }}></div>
                  <span style={{fontSize: '0.95rem', color: '#4b5563'}}>{opt.text}</span>
                </div>
              );
            }

            // Step 2 逻辑
            return (
              <div 
                key={idx} 
                onClick={() => !isPrimary && toggleSecondary(opt.dim)}
                className="option-item"
                style={{
                  padding: '1rem',
                  border: isPrimary ? '2px solid #db2777' : isSecondary ? '1px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '0.8rem',
                  cursor: isPrimary ? 'default' : 'pointer',
                  background: isPrimary ? '#fdf2f8' : isSecondary ? '#ecfdf5' : 'white',
                  opacity: isPrimary ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.8rem'
                }}
              >
                {/* 图标：Primary显示实心圆，Secondary显示勾选框 */}
                <div style={{
                  width: '20px', height: '20px', flexShrink: 0, marginTop: '2px',
                  borderRadius: isPrimary ? '50%' : '4px',
                  border: isPrimary ? 'none' : isSecondary ? 'none' : '2px solid #d1d5db',
                  background: isPrimary ? '#db2777' : isSecondary ? '#10b981' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px'
                }}>
                  {isPrimary && "★"}
                  {isSecondary && "✓"}
                </div>
                <span style={{fontSize: '0.95rem', color: '#374151'}}>
                  {opt.text}
                  {isPrimary && <span style={{fontSize:'0.8rem', color:'#db2777', marginLeft:'0.5rem'}}>(最符合)</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem',
        display: 'flex', justifyContent: 'center', zIndex: 50,
        boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{maxWidth: '800px', width: '100%', display: 'flex', gap: '1rem'}}>
          {step === 1 ? (
            <button 
              onClick={handlePrimaryNone}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '8px',
                border: '1px solid #d1d5db', background: '#f9fafb', color: '#6b7280',
                fontWeight: '600'
              }}
            >
              没有最符合的 (跳过)
            </button>
          ) : (
            <button 
              onClick={handleNextQuestion}
              className="btn-next"
              style={{width: '100%', margin: 0, background: '#10b981'}}
            >
              {tempSecondary.length === 0 ? "以上都不符合 / 下一题" : "选好了，下一题"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JealousyQuiz;
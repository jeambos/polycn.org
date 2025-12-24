import React, { useState, useMemo } from 'react';
import '../styles/Assessment.css'; // 复用统一样式
import MoreTests from './MoreTests';

// =====================================================================
// 1. 维度定义
// =====================================================================
const DIMENSIONS = {
  competitive: { name: "竞争型", desc: "向上比较：担心技不如人" },
  self_esteem: { name: "自尊型", desc: "向下比较：感到品味受辱" },
  normative: { name: "观念型", desc: "超我审判：生理性厌恶" },
  abandonment: { name: "遗弃型", desc: "依恋断裂：恐惧连接消失" },
  exclusion: { name: "排斥型", desc: "信息隔离：局外人焦虑" },
  territorial: { name: "领地型", desc: "资源失控：权益被侵占" },
  projective: { name: "投射型", desc: "阴影投射：自身欲望镜像" }
};

// =====================================================================
// 2. 个性化文案库 (Description & Advice)
// =====================================================================
const FEEDBACK_DATA = {
  competitive: {
    high: {
      desc: "你经常担心自己“不够好”。一旦伴侣夸奖别人或与优秀的人接触，你就会害怕自己被比下去，从而失去伴侣的爱。",
      adv: "爱不是比赛，没有输赢。伴侣选择你，是因为你是独一无二的你，而不是因为你在各项指标上都打败了所有人。"
    },
    mid: { desc: "你偶尔会拿自己和别人比较，担心自己没有吸引力。", adv: "多关注那些只有你能给伴侣带来的独特价值。" },
    low: { desc: "你对自己很有自信，不怎么担心被别人取代。", adv: "保持这种自信，这是关系稳定的基石。" }
  },
  self_esteem: {
    high: {
      desc: "你很在意伴侣的选择是否“体面”。如果伴侣找了一个你觉得档次很低的人，你会觉得这是在羞辱你的品味，让你很没面子。",
      adv: "试着把“伴侣的行为”和“你的价值”分开。ta 喜欢谁是 ta 的自由，并不代表你也是那种档次，更不影响你的优秀。"
    },
    mid: { desc: "你有点在意别人的眼光，怕伴侣的选择让你丢脸。", adv: "面子是给别人看的，日子是自己过的，别太累。" },
    low: { desc: "你不太用外在条件去评价伴侣的选择。", adv: "继续保持这种对他人的尊重和包容。" }
  },
  normative: {
    high: {
      desc: "你对非单偶行为有强烈的生理性抗拒。即使理智上想尝试，内心深处觉得这“不道德”、“脏”或“不对劲”，这让你非常痛苦。",
      adv: "不要强迫自己“变得开放”。这种恶心感是你在保护自己。请慢下来，重新审视这种关系模式是否真的适合现在的你。"
    },
    mid: { desc: "看到一些出格的行为，你心里还是会咯噔一下。", adv: "问问自己，这些规矩是你想要的，还是别人教你的？" },
    low: { desc: "你心态很开放，不太受传统道德框架的束缚。", adv: "确保这种开放是出于真心，而不是为了迎合对方。" }
  },
  abandonment: {
    high: {
      desc: "你极度害怕被抛弃。只要伴侣的注意力不在你身上，你就会恐慌，觉得 ta 不爱你了，或者即将要离开你。",
      adv: "试着练习“独处时的安全感”。同时，可以要求伴侣给你一些具体的保证（比如约定回家时间），这不丢人，是你的合理需求。"
    },
    mid: { desc: "伴侣不在的时候，你会觉得心里空落落的。", adv: "建立一些属于自己的爱好，让自己充实起来。" },
    low: { desc: "你有很好的安全感，信任伴侣会回来。", adv: "你的信任很珍贵，但也别忘了表达你的想念。" }
  },
  exclusion: {
    high: {
      desc: "你最受不了“不知道”。如果他们有秘密、小群或者你听不懂的梗，那种“局外人”的感觉比背叛更让你难受。",
      adv: "你可以坦诚告诉伴侣：“我不需要控制你，我只是想有一些参与感。”同时，也要学会接受他们有属于自己的小世界。"
    },
    mid: { desc: "你不喜欢那种被蒙在鼓里的感觉。", adv: "和伴侣约定好信息同步的程度，减少猜疑。" },
    low: { desc: "你觉得每个人都有秘密很正常，不怎么纠结。", adv: "保持这种边界感，这会让关系更轻松。" }
  },
  territorial: {
    high: {
      desc: "你觉得属于你的时间、金钱或空间被抢走了。在你看来，爱就像一块有限的蛋糕，分给别人了，你拥有的就少了。",
      adv: "试着从“匮乏心态”转为“富足心态”。虽然时间有限，但爱是无限的。你可以要求一段完全属于你的“高质量独占时间”。"
    },
    mid: { desc: "你不喜欢别人动你的东西或占用你的时间。", adv: "明确划定哪些是你的绝对领域，哪些可以分享。" },
    low: { desc: "你很大方，不太计较资源的分配。", adv: "只要记得照顾好自己的需求，别委屈自己就行。" }
  },
  projective: {
    high: {
      desc: "你怀疑 ta，其实是因为你心里也有类似的想法。也许是你压抑了想玩的冲动，所以觉得 ta 肯定也在乱来。",
      adv: "对自己诚实一点，承认自己的欲望并不可耻。当你接纳了自己内心的“阴暗面”，你就不会总是戴着有色眼镜看 ta 了。"
    },
    mid: { desc: "有时候你会以己度人，去揣测对方的动机。", adv: "直接去问 ta，而不是在脑子里演内心戏。" },
    low: { desc: "你很坦荡，相信伴侣的行为就是字面意思。", adv: "保持这种简单直接的沟通方式。" }
  }
};

// =====================================================================
// 3. 题目数据 (10题) - 保持之前的优化版本
// =====================================================================
const QUESTIONS = [
  {
    id: 1,
    title: "场景：强弱并存的新人",
    scenario: "伴侣向你介绍了新对象。你发现这个人在某些方面很有吸引力（如年轻/外貌），但在社会地位、收入或学历上明显不如你。",
    options: [
      { dim: 'competitive', text: "既然选了那一型，说明在那方面（如青春/外貌）我确实输了，失去了竞争力。" },
      { dim: 'self_esteem', text: "看上这种档次的人？这侧面说明我在 ta 心里也没多高贵，简直是在拉低我的身价。" },
      { dim: 'normative', text: "这种巨大的阶级/年龄差，让我本能地觉得充满利用色彩，很不道德。" },
      { dim: 'projective', text: "其实我也挺想找个这种单纯漂亮没背景的人，ta 只是把我想做的做出来了。" },
      { dim: 'abandonment', text: "那个人有我已经失去的特质（如青春），ta 会因为贪图新鲜感而逐渐疏远我。" }
    ]
  },
  {
    id: 2,
    title: "场景：约会后的高能量",
    scenario: "伴侣约会回来，状态明显比平时好很多，甚至比和你在一起时显得更开心、更有活力。",
    options: [
      { dim: 'exclusion', text: "他们肯定发生了什么我不知道的好事，我像个局外人被隔绝在快乐之外。" },
      { dim: 'competitive', text: "那个人一定比我更有趣或“活儿”更好，才能让 ta 获得这种满足感。" },
      { dim: 'territorial', text: "把好情绪都在外面耗尽了，留给我的只剩疲惫，这是侵占了我的份额。" },
      { dim: 'normative', text: "刚从别人怀里回来还这么高兴，违背了亲密关系的排他本能，让我生理性恶心。" },
      { dim: 'abandonment', text: "Ta 那么开心，说明没有我也可以过得很好……这让我感到自己是多余的。" }
    ]
  },
  {
    id: 3,
    title: "场景：手机避嫌",
    scenario: "你们坐在一起，伴侣的手机响了，你们都意识到是外面的新人发来的。此时 ta 选择找个你看不到的地方（如侧过身）回复消息。",
    options: [
      { dim: 'exclusion', text: "这种刻意建立“秘密小世界”的行为，比真做了什么更让我难受，讨厌被蒙在鼓里。" },
      { dim: 'projective', text: "遮遮掩掩往往意味着心里有鬼，就像我有秘密不想让 ta 知道时一样。" },
      { dim: 'territorial', text: "现在是属于我们的陪伴时间，ta 却在回应别人，这是盗用共同时间。" },
      { dim: 'competitive', text: "此刻 ta 更在意那个人。在那个人面前，我被比下去了。" },
      { dim: 'self_esteem', text: "当面防着我，是不信任的表现，让我觉得自己像个外人，很伤自尊。" }
    ]
  },
  {
    id: 4,
    title: "场景：资源的倾斜",
    scenario: "你发现为了给新对象庆祝生日，ta 表现得非常用心（准备昂贵礼物或策划复杂行程），似乎很久没有对你这么用心了。",
    options: [
      { dim: 'territorial', text: "无论是钱还是精力，这本该是用于建设我们关系的资源，不该外流。" },
      { dim: 'self_esteem', text: "对外人那么隆重，对我就这么随便？觉得我不值钱，地位受到了轻视。" },
      { dim: 'normative', text: "亲密关系应有主次。把高规格待遇给次要伴侣，打破了“厚此薄彼”的规矩。" },
      { dim: 'competitive', text: "行动证明一切，ta 显然更爱那个人。我在 ta 心里的排名下降了。" },
      { dim: 'projective', text: "我平时为了顾家压抑了消费冲动，ta 凭什么就可以这么放肆地挥霍？" }
    ]
  },
  {
    id: 5,
    title: "场景：性体验的差异",
    scenario: "伴侣无意中透露，新对象在床上有一些你没有的特质（如更狂野、或有特殊癖好），让 ta 体验到了不同的快感。",
    options: [
      { dim: 'normative', text: "那些玩法太出格/太脏了。这种“淫乱”画风让我觉得羞耻。" },
      { dim: 'competitive', text: "原来 ta 喜欢那种？那我是不是太无趣了？担心因此对 ta 失去性吸引力。" },
      { dim: 'exclusion', text: "你们在性上建立了某种我无法介入的特殊连接，这让我觉得自己是不完整的。" },
      { dim: 'projective', text: "听得我都心动了。其实我也想玩点刺激的，与其说是嫉妒，不如说是羡慕。" },
      { dim: 'abandonment', text: "性是情感的粘合剂。身体更契合，迟早会把 ta 的心也带走。" }
    ]
  },
  {
    id: 6,
    title: "场景：社交圈的流言",
    scenario: "你发现你们共同的朋友圈里（如朋友群或熟人），似乎有人知道了ta有新对象这件事，并对此有一些议论。",
    options: [
      { dim: 'self_esteem', text: "这让我很没面子。大家会觉得我管不住伴侣，或者软弱/被绿，损害社会形象。" },
      { dim: 'territorial', text: "我们的关系是私事。让外人知道并评头论足，侵犯了我的隐私边界。" },
      { dim: 'normative', text: "关起门怎么玩都行，闹得人尽皆知就是伤风败俗，破坏了体面。" },
      { dim: 'exclusion', text: "别人都知道了，我却是最后知道（或无法控制传播）的人，失去了掌控感。" },
      { dim: 'competitive', text: "大家肯定在拿我和那个新人比较。万一觉得那个人比我更适合 ta，我就下不来台了。" }
    ]
  },
  {
    id: 7,
    title: "场景：当你脆弱时",
    scenario: "你生病了或心情低落，但伴侣早就和新人约好了出门。Ta 犹豫了一下，还是决定按原计划去约会，只留给你基本的照顾。",
    options: [
      { dim: 'abandonment', text: "最需要 ta 的时候 ta 选择了别人。证明我不是第一位，我是被抛弃的。" },
      { dim: 'normative', text: "照顾生病伴侣是基本责任。Ta 这么做就是自私、冷血、不负责任。" },
      { dim: 'territorial', text: "我现在的状态需要人陪，这是作为伴侣应得的权益，不该被克扣。" },
      { dim: 'self_esteem', text: "为了重要公事也就算了，为了约会丢下生病的我？我在你心里就这么不值钱？" },
      { dim: 'projective', text: "换作是我，如果 ta 生病我想去约会，可能也会想溜。但我不敢，ta 竟然真敢。" }
    ]
  },
  {
    id: 8,
    title: "场景：风格的冲突",
    scenario: "你发现新对象是一个和你风格完全相反的人。比如你很精致上进，那个人却很散漫颓废（或者反之）。",
    options: [
      { dim: 'self_esteem', text: "找这种人说明 ta 品味也就那样。这不仅否定 ta 自己，也间接拉低了我的档次。" },
      { dim: 'competitive', text: "原来 ta 内心深处喜欢那种类型？那我这些年维持的形象算什么？我不是理想型？" },
      { dim: 'projective', text: "其实我潜意识里也想活成那样。Ta 找那个人，补全了我们关系里压抑的那一块。" },
      { dim: 'exclusion', text: "他们那个圈子的氛围是我完全插不上嘴的。他们处于一个我无法理解的世界里。" },
      { dim: 'normative', text: "这种类型的人一看就不靠谱。担心伴侣被骗，或者沾染上不好的习气。" }
    ]
  },
  {
    id: 9,
    title: "场景：深度共鸣",
    scenario: "你看到他们正在深入探讨一个你完全不感兴趣、或者听不懂的话题（如某个游戏、专业领域），两人显得极其默契。",
    options: [
      { dim: 'exclusion', text: "那种“只有我们懂”的氛围让我难受。我像个傻瓜被隔绝在他们的精神世界之外。" },
      { dim: 'abandonment', text: "身体背叛能忍，这种灵魂契合让我觉得彻底失去了 ta。这种连接无法替代。" },
      { dim: 'competitive', text: "我以为我才是最懂 ta 的人。现在出现了更懂的人，我“灵魂伴侣”的位置不保。" },
      { dim: 'self_esteem', text: "聊那些显得很高深，是在显摆吗？让我觉得自己无知、浅薄，很伤自尊。" },
      { dim: 'projective', text: "真羡慕能聊这些。其实我也想找个能聊得来的，而不是只能和伴侣聊柴米油盐。" }
    ]
  },
  {
    id: 10,
    title: "场景：节日的分配",
    scenario: "情人节快到了。伴侣提出，想把情人节拆成两半，白天陪你，晚上去陪新对象（或者反之）。",
    options: [
      { dim: 'normative', text: "情人节是属于“一对”伴侣的。把它拆分是对关系的亵渎，违背了爱的定义。" },
      { dim: 'territorial', text: "不管白天晚上，这一整天的时间主权都应该是我的，不接受任何“共享”。" },
      { dim: 'self_esteem', text: "如果让人知道我情人节只能分到半天，还要不要面子？像个“兼职”伴侣。" },
      { dim: 'competitive', text: "为什么要分？是因为只陪我不够满足吗？我们在 ta 心里到底谁更重要？" },
      { dim: 'abandonment', text: "今天分半天，明天就分全天？这种边界退让让我不安全，感觉关系在被蚕食。" }
    ]
  }
];

// =====================================================================
// 4. 子组件定义
// =====================================================================

const SharePopover = ({ onClose }) => (
  <div className="share-popover">
    <div className="popover-text">
      受到技术限制，请您<b>截图</b>保存此页面或分享给好友 :)
    </div>
    <button onClick={onClose} className="popover-close">我知道了</button>
  </div>
);

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">嫉妒类型图谱</h1>
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">嫉妒不是一种单一情绪，而是内心需求的信号灯。</li>
          <li className="intro-item">通过 <b>10 个典型场景</b>，探索你在亲密关系中的“嫉妒原型”。</li>
          <li className="intro-item">我们将分析你是更害怕<b>“被抛弃”</b>、更在意<b>“输赢”</b>，还是觉得<b>“丢面子”</b>。</li>
          <li className="intro-item"><b>作答方式：</b>每题分两步，先选“最痛点”，再选“共鸣点”。</li>
        </ul>
      </div>
      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.1)'}}>开始探索</button>
    </div>
    <MoreTests currentId="jealousy" status="welcome" />
  </div>
);

// 雷达图 (纯展示，带下方联动标签)
const RadarChart = ({ scores, activeDim, onDimClick }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const axes = Object.keys(DIMENSIONS);
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;
  const MAX_VAL = 12; 

  const getCoordinates = (value, index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = (Math.min(value, MAX_VAL) / MAX_VAL) * radius;
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
          {[0.2, 0.4, 0.6, 0.8, 1].map(level => (
            <polygon key={level} points={axes.map((_, i) => {
                const angle = i * angleSlice - Math.PI / 2;
                const r = radius * level;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(" ")} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          ))}
          {axes.map((_, i) => {
            const s = getCoordinates(0, i);
            const e = getCoordinates(MAX_VAL, i);
            return <line key={i} x1={s.x} y1={s.y} x2={e.x} y2={e.y} stroke="#f3f4f6" strokeWidth="1" />;
          })}
          <polygon points={points} fill="rgba(230, 149, 37, 0.2)" stroke="#e69525" strokeWidth="2" />
          {axes.map((key, i) => {
            const c = getCoordinates(scores[key] || 0, i);
            return <circle key={i} cx={c.x} cy={c.y} r="3" fill="#e69525" />;
          })}
          {axes.map((key, i) => {
            const c = getLabelCoordinates(i);
            const isActive = activeDim === key;
            return (
              <text key={key} x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" 
                onClick={() => onDimClick(key)}
                style={{fontSize:'0.75rem', fill: isActive ? '#e69525' : 'var(--qz-text-sub)', fontWeight: isActive ? 'bold' : 'normal', cursor: 'pointer'}}
              >
                {DIMENSIONS[key].name}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* 2. 雷达图下方联动标签 */}
      {activeDim && (
        <div className="radar-stat-box" style={{
          borderColor: '#fed7aa', background: 'var(--qz-bg-soft)', marginTop: '-1rem', textAlign: 'center'
        }}>
          <div className="stat-name" style={{color: '#9a3412'}}>{DIMENSIONS[activeDim].name}</div>
          <div className="stat-val" style={{color: '#ea580c', fontWeight: 'bold'}}>{scores[activeDim]} 分</div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// 5. 结果页组件 (ResultScreen)
// =====================================================================
const ResultScreen = ({ answers, onRetry }) => {
  const [showShare, setShowShare] = useState(false);
  const [activeDim, setActiveDim] = useState(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // 计算分数
  const scores = useMemo(() => {
    const raw = {};
    Object.keys(DIMENSIONS).forEach(k => raw[k] = 0);
    Object.values(answers).forEach(ans => {
      if (ans.primary && DIMENSIONS[ans.primary]) raw[ans.primary] += 3;
      if (ans.secondary && ans.secondary.length) {
        ans.secondary.forEach(dim => {
          if (DIMENSIONS[dim]) raw[dim] += 1;
        });
      }
    });
    return raw;
  }, [answers]);

  // 1. 找出得分最高的 (Dominant)
  const sortedKeys = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const maxScore = scores[sortedKeys[0]];
  // 阈值：如果最高分都没超过 2 分，则视为“无主导”
  const dominantKey = maxScore > 2 ? sortedKeys[0] : null;

  // 2. 找出次要高分 (Secondary): 分数 >= 5 且不是 Dominant
  const secondaryKeys = sortedKeys.filter(key => key !== dominantKey && scores[key] >= 5);

  // 3. 剩余的 (Other): 用于详细报告
  const otherKeys = sortedKeys.filter(key => key !== dominantKey && !secondaryKeys.includes(key));

  // 获取个性化文案
  const getText = (key, score) => {
    let level = 'low';
    if (score >= 6) level = 'high'; // 高分阈值调整为6 (2个Primary 或 6个Secondary)
    else if (score >= 2) level = 'mid';
    return FEEDBACK_DATA[key][level];
  };

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: 'var(--qz-text-main)'}}>你的嫉妒画像</h2>
      </div>

      {/* === 卡片 1: 主导原型 (黑金配色) === */}
      <div className="score-card" style={{
        background: `linear-gradient(135deg, #18181b 0%, #27272a 100%)`, // 黑色背景
        boxShadow: `0 15px 40px -10px rgba(0,0,0,0.5)`,
        border: '1px solid #3f3f46'
      }}>
        <div className="watermark" style={{opacity: 0.1}}>PolyCN</div>
        <div style={{color:'#a1a1aa', fontSize:'0.9rem', marginBottom:'0.5rem', letterSpacing:'1px'}}>主导原型</div>
        
        {dominantKey ? (
          <>
            <div className="score-comment" style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#fbbf24', marginBottom:'1.5rem'}}>
              {DIMENSIONS[dominantKey].name}
            </div>
            <div style={{textAlign: 'left', padding: '0 0.5rem'}}>
              <p style={{color: '#f4f4f5', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem'}}>
                <span style={{color: '#fbbf24', fontWeight:'bold'}}>✦ 您像是：</span>
                {getText(dominantKey, scores[dominantKey]).desc}
              </p>
              <p style={{color: '#d4d4d8', fontSize: '0.95rem', lineHeight: 1.6}}>
                <span style={{color: '#fbbf24', fontWeight:'bold'}}>✦ 您可以：</span>
                {getText(dominantKey, scores[dominantKey]).adv}
              </p>
            </div>
          </>
        ) : (
<>
            <div className="score-comment" style={{fontSize: '2.2rem', fontWeight: 'bold', color: '#fbbf24', marginBottom:'1.5rem'}}>
              无 (平稳型)
            </div>
            <div style={{textAlign: 'left', padding: '0 0.5rem'}}>
              <p style={{color: '#f4f4f5', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1rem'}}>
                <span style={{color: '#fbbf24', fontWeight:'bold'}}>✦ 您像是：</span>
                拥有令人羡慕的“免疫体质”。测试显示你的嫉妒反应微弱，说明你有极高的安全感，或在关系中非常独立豁达。你很少因比较或占有欲内耗，能给予伴侣极大的自由空间。
              </p>
              <p style={{color: '#d4d4d8', fontSize: '0.95rem', lineHeight: 1.6}}>
                <span style={{color: '#fbbf24', fontWeight:'bold'}}>✦ 您可以：</span>
                确认这是“信任”而非“不在乎”。请多用关心表达爱意，以免伴侣误解为冷漠。同时觉察：是真的平静，还是切断了情绪开关？拥有感受痛苦的能力，也是一种生命力。
              </p>
            </div>
          </>
        )}
      </div>

      {/* === 组件 2: 雷达图 === */}
      <RadarChart scores={scores} activeDim={activeDim || (dominantKey || sortedKeys[0])} onDimClick={setActiveDim} />

      {/* === 卡片 3: 次要原型 (橙框白底) === */}
      {secondaryKeys.length > 0 && (
        <div style={{marginBottom: '2rem'}}>
          <h3 style={{fontSize: '1.2rem', color: '#374151', margin: '0 0 1rem 0.5rem'}}>次要原型</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {secondaryKeys.map(key => (
              <div key={key} style={{
                background: '#fff', border: '2px solid #e69525', borderRadius: '12px', padding: '1.5rem',
                boxShadow: '0 4px 15px rgba(230, 149, 37, 0.1)'
              }}>
                <div style={{fontSize: '1.4rem', fontWeight: 'bold', color: '#e69525', marginBottom: '1rem'}}>
                  {DIMENSIONS[key].name}
                </div>
                <div style={{textAlign: 'left'}}>
                  <p style={{color: '#374151', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.8rem'}}>
                    <b>您像是：</b>{getText(key, scores[key]).desc}
                  </p>
                  <p style={{color: 'var(--qz-text-sub)', fontSize: '0.9rem', lineHeight: 1.6}}>
                    <b>您可以：</b>{getText(key, scores[key]).adv}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === 组件 4: 其他维度报告 (折叠) === */}
      <div style={{marginBottom: '2rem'}}>
        <button 
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          style={{
            width: '100%', padding: '0.8rem', background: 'var(--qz-bg-card)', border: '1px solid var(--qz-border)', 
            borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'var(--qz-text-main)', fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
          }}
        >
          {isDetailsExpanded ? "收起其他维度报告 ⬆️" : "查看其他维度报告 ⬇️"}
        </button>
        
        {isDetailsExpanded && (
          <div className="animate-fade-in" style={{
            marginTop: '1.5rem',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem'
          }}>
            {otherKeys.map(key => (
              <div key={key} style={{
                background: 'var(--qz-bg-page)', border: '1px solid var(--qz-border)', borderRadius: '8px', padding: '1rem'
              }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', alignItems:'center'}}>
                  <span style={{fontWeight:'bold', color:'#374151'}}>{DIMENSIONS[key].name}</span>
                  <span style={{color: 'var(--qz-text-sub)', fontWeight: 'bold'}}>{scores[key]} 分</span>
                </div>
                <p style={{fontSize:'0.85rem', color:'var(--qz-text-sub)', margin:0, lineHeight: 1.5}}>
                  您可能{getText(key, scores[key]).desc.toLowerCase().replace('你','')}
                  <br/>
                  <span style={{color:'var(--qz-text-sub)', display:'block', marginTop:'0.4rem'}}>建议：{getText(key, scores[key]).adv}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

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
      <MoreTests currentId="jealousy" status="result" />
      <div className="mini-nav">
        <a href="/" className="mini-link">回到首页</a>
        <a href="/assessment" className="mini-link">更多测试</a>
      </div>
    </div>
  );
};

// =====================================================================
// 6. 主程序 (保持上一版的两步逻辑)
// =====================================================================
const JealousyQuiz = () => {
  const [started, setStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0); 
  const [step, setStep] = useState(1); 
  const [answers, setAnswers] = useState({});
  const [tempSecondary, setTempSecondary] = useState([]); 
  const [showResult, setShowResult] = useState(false);

  const currentQ = QUESTIONS[qIndex];
  
  // 构造选项
  const displayOptions = useMemo(() => {
    const opts = [...currentQ.options];
    const currentPrimary = answers[currentQ.id]?.primary;
    if (step === 1) {
      opts.push({ dim: 'none_primary', text: '没有最符合的' });
    } else {
      if (currentPrimary === 'none_primary') {
        opts.push({ dim: 'none_primary', text: '没有最符合的' });
        opts.push({ dim: 'none_secondary', text: '其余都不符合' });
      } else {
        opts.push({ dim: 'none_secondary', text: '其余都不符合' });
      }
    }
    return opts;
  }, [currentQ, step, answers]);

  const handleStart = () => {
    setStarted(true);
    window.scrollTo(0,0);
  };

  const handlePrimarySelect = (dimKey) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], primary: dimKey }
    }));
    setTempSecondary([]);
    setStep(2); 
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
    const primary = answers[currentQ.id]?.primary;
    if (primary === dimKey) return;

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

// 上一题逻辑：只负责切题，不负责切步骤（步骤回退由点击选项触发）
  const handlePrev = () => {
    if (qIndex > 0) {
      setQIndex(prev => prev - 1);
      setStep(1); // 回到上一题时，默认从 Step 1 开始看
      window.scrollTo(0,0);
    }
  };

  // 导航按钮显示逻辑
  const showPrev = qIndex > 0; // 只要不是第一题，都显示“上一题”
  const showNext = step === 2; // 只有进入 Step 2，才显示右侧按钮
  
  // 按钮状态与文案
  const canGoNext = tempSecondary.length > 0; // Step 2 必须选中至少一项(含"都不符合")才能继续
  const nextLabel = qIndex === QUESTIONS.length - 1 ? "提交查看结果" : "下一题";

  const handleRetry = () => {
    setStarted(false);
    setQIndex(0);
    setStep(1);
    setAnswers({});
    setTempSecondary([]); 
    setShowResult(false);
    window.scrollTo(0,0);
  };


  if (!started) return <WelcomeScreen onStart={handleStart} />;
  if (showResult) return <ResultScreen answers={answers} onRetry={handleRetry} />;

  const currentPrimary = answers[currentQ.id]?.primary;

  return (
    <div className="quiz-container animate-fade-in">
      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%`, background: '#e69525' }}></div>
        </div>
      </div>

      <div className="quiz-card" style={{paddingBottom: '2rem'}}>
        <h3 className="question-text" style={{fontSize: '1.1rem', marginBottom: '0.5rem', color: '#9a3412'}}>
          {currentQ.title}
        </h3>
        <p style={{fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem', color: '#374151'}}>
          {currentQ.scenario}
        </p>
        
        <div style={{
          background: step === 1 ? '#fff7ed' : '#fff', border: step === 1 ? '1px solid #fed7aa' : '1px solid #e5e7eb',
          color: step === 1 ? '#c2410c' : '#374151',
          padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 'bold',
          marginBottom: '1rem', display: 'flex', gap: '0.5rem'
        }}>
          {step === 1 ? (
            <><span>Step 1:</span> 请选出 1 个<b>最符合</b>的想法</>
          ) : (
            <><span>Step 2:</span> 还有哪些想法<b>也符合</b>？(可多选)</>
          )}
        </div>

        {/* 强制覆盖样式的内部 CSS */}
        <style>{`
          /* 最符合 (深色高亮) */
          .opt-primary {
            background-color: var(--qz-primary) !important;
            border-color: var(--qz-primary) !important;
            color: var(--qz-primary-fg) !important;
          }
          .opt-primary .dot {
            background-color: var(--qz-primary-fg) !important;
            border-color: var(--qz-primary-fg) !important;
          }
          
          /* 也符合 (浅色高亮) */
          .opt-secondary {
            background-color: var(--qz-bg-soft) !important;
            border-color: var(--qz-primary) !important;
            color: var(--qz-text-soft) !important;
          }
          .opt-secondary .dot {
            background-color: var(--qz-primary) !important;
            border: none !important;
          }

          /* 默认圆点样式 */
          .dot {
            width: 18px; height: 18px; border-radius: 50%; 
            border: 2px solid #d1d5db; flex-shrink: 0;
            transition: all 0.2s;
          }
        `}</style>

        <div className="options-list">
          {displayOptions.map((opt, idx) => {
            const isPrimary = currentPrimary === opt.dim;
            const isSecondary = tempSecondary.includes(opt.dim);

            // ------------------------------------------------
            // 场景 A: Step 1 (默认状态)
            // ------------------------------------------------
            if (step === 1) {
              return (
                <div 
                  key={idx} 
                  onClick={() => handlePrimarySelect(opt.dim)}
                  className="option-item"
                  style={{
                    background: 'var(--qz-bg-card)', 
                    border: '1px solid var(--qz-border)', 
                    color: 'var(--qz-text-sub)',
                    padding: '1rem', marginBottom: '0.8rem', cursor: 'pointer', borderRadius: '8px',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.8rem'
                  }}
                >
                  <div className="dot"></div>
                  <span style={{fontSize: '0.95rem'}}>{opt.text}</span>
                </div>
              );
            }

            // ------------------------------------------------
            // 场景 B: Step 2 - “最符合” (深橙背景 + 白字)
            // ------------------------------------------------
            if (isPrimary) {
              return (
                <div 
                  key={idx} 
                  onClick={handlePrimaryDeselect}
                  className="option-item opt-primary" // 样式由上方 <style> 强力控制
                  style={{
                    padding: '1rem', marginBottom: '0.8rem', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer'
                  }}
                >
                  <div className="dot"></div>
                  <span style={{fontSize: '0.95rem', fontWeight:'bold'}}>
                    {opt.text} <span style={{fontSize:'0.8rem', opacity:0.8}}>(点击取消)</span>
                  </span>
                </div>
              );
            }

            // ------------------------------------------------
            // 场景 C: Step 2 - “也符合” (浅橙背景 + 橙字)
            // ------------------------------------------------
            return (
              <div 
                key={idx} 
                onClick={() => toggleSecondary(opt.dim)}
                className={`option-item ${isSecondary ? 'opt-secondary' : ''}`}
                style={{
                  // 未选中时保持默认，选中时应用 opt-secondary
                  background: isSecondary ? '' : 'var(--qz-bg-card)',
                  border: isSecondary ? '' : '1px solid var(--qz-border)',
                  color: isSecondary ? '' : 'var(--qz-text-sub)',
                  
                  padding: '1rem', marginBottom: '0.8rem', cursor: 'pointer', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.2s'
                }}
              >
                <div className="dot"></div>
                <span style={{fontSize: '0.95rem', fontWeight: isSecondary?'bold':'normal'}}>{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部固定导航栏 */}
      <div className="nav-bar-fixed">
        <div className="nav-bar-inner">
          {/* 左侧：上一题 (使用占位符保持布局平衡) */}
          {showPrev ? (
            <button onClick={handlePrev} className="btn-prev">
              上一题
            </button>
          ) : (
            <div></div> 
          )}

          {/* 右侧：下一题 / 提交 (仅在 Step 2 显示) */}
          {showNext && (
            <button 
              onClick={handleNext} 
              className="btn-next" 
              disabled={!canGoNext}
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>
      </div>
  );
};

export default JealousyQuiz;
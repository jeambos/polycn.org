import React, { useState, useMemo } from 'react';
import '../../styles/Quiz.css';
import { WelcomeCard, QuizContainer, QuizFooter } from './ui/QuizFrame';
import QuizPager from './ui/QuizPager';
import RadarChart from './ui/RadarChart';
import { ScoreCard, MoreDetails, ResultActions } from './ui/ResultDashboard';

// =====================================================================
// 1. 数据定义 (严格保持原版文案与逻辑参数)
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

const RESULT_FEEDBACK = {
  enmeshment: {
    high: "你倾向于追求一种‘你中有我，我中有你’的高浓度融合感。这种紧密连接能带来极大的安全感，但同时也意味着你的个人边界相对模糊。",
    mid: "你在‘亲密无间’和‘保持自我’之间维持着一种微妙的平衡。你享受依赖，但也懂得在关键时刻保留私人空间。",
    low: "你非常看重关系中的独立性，认为健康的亲密关系是‘两个完整个体的相遇’，而非彼此消融。你拥有清晰的个人边界。"
  },
  one_only: {
    high: "你对伴侣寄予了非常高的厚望，希望他/她能同时满足你从情感、生活到精神层面的大部分需求。这反映了你对完美连接的向往。",
    mid: "你希望伴侣是你的主要支持者，但也接受他/她不是万能的。你开始意识到某些需求（如特定兴趣）也许可以由朋友来满足。",
    low: "你拥有多元的支持系统（朋友、社群），并不认为伴侣必须满足你的一切。这种‘去中心化’的期待让你的关系更轻松。"
  },
  gender: {
    high: "你的恋爱观在一定程度上保留了传统的性别分工模式。这种明确的脚本能减少相处中的不确定性，但也可能限制了角色的多元性。",
    mid: "你并不刻板地遵循传统性别规范，但在某些具体场景（如经济或性主动权）上，你可能仍习惯于顺应主流的期待。",
    low: "你很大程度上已经跳出了性别脚本，倾向于根据个人特质而非性别来定义分工。这让你能构建更平等、流动的伙伴关系。"
  },
  family: {
    high: "你非常看重恋爱关系与原生家庭的融合，认为获得长辈认可和家庭和谐是幸福的重要基石。这是一份沉甸甸的责任。",
    mid: "你尊重家人的意见，但在核心问题上会尝试维护自己的主权。你正在学习如何温柔地划定代际边界。",
    low: "你坚定地认为恋爱是两个人的事，能够有效地隔离原生家庭的干预。这种独立性是你维护关系自由的护城河。"
  },
  institution: {
    high: "你倾向于将‘修成正果’（如结婚、生子）视为一段关系成功与否的核心指标。这让你的人生路径清晰，但也可能形成束缚。",
    mid: "你认可婚姻的价值，但也不完全否认其他形式的可能性。你可能在‘为了感情’和‘为了制度’之间寻求某种务实的妥协。",
    low: "你对‘修成正果’有不同的定义。相比于外在的证书或仪式，你更看重关系内在的质量和真实的生命体验。"
  },
  jealousy: {
    high: "你倾向于将嫉妒心和占有欲解读为‘在乎’的证明。这可能会让你忽略嫉妒背后隐藏的不安全感，错失自我成长的机会。",
    mid: "你有时会因嫉妒而焦虑，但也能意识到这不完全是对方的错。你正在尝试学习如何处理这种复杂的情绪。",
    low: "你不认为嫉妒是爱的必要条件，或者你已经学会了不被嫉妒所绑架。这种情感上的从容非常难得。"
  },
  sex_love: {
    high: "你倾向于认为性行为必须以深厚的情感或承诺为前提。这种观念能保护你的安全感，但也可能限制了探索身体快乐的机会。",
    mid: "你大体上认同‘灵肉合一’，但在特定情境下也能接受性与爱的一定分离，或者开始对身体自主权有了新的思考。",
    low: "你将性视为一种独立的、美好的身体体验，不一定非要承载沉重的道德意义。这种开放态度让你更能享受身体的自主。"
  },
  exclusivity: {
    high: "你认为身心的绝对排他是维护信任的基石。这为你构建了纯粹的爱情理想，但在面对人性的流动性时可能会遭受冲击。",
    mid: "你坚守肉体的忠诚，但对精神层面的流动（如对他人的欣赏或心动）持有一定的包容度，明白那是人性使然。",
    low: "你能够坦然面对甚至欣赏人性中的流动性，不再将伴侣视为私有财产。这种信任建立在深刻的理解而非控制之上。"
  }
};

// 判定逻辑：保持原版阈值 (>= 3.7 High, <= 2.6 Low)
const getFeedback = (dimKey, score) => {
  if (score >= 3.7) return RESULT_FEEDBACK[dimKey].high;
  if (score <= 2.6) return RESULT_FEEDBACK[dimKey].low;
  return RESULT_FEEDBACK[dimKey].mid;
};

// 题目数据：完全保留原版
const QUESTIONS = [
  // Page 1: 伴侣共生 + 全能期待
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
  // Page 2: 性别脚本 + 代际边界
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
  // Page 3: 制度迷思 + 嫉妒逻辑
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
  // Page 4: 性爱捆绑 + 绝对排他
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

// =====================================================================
// 2. 主组件
// =====================================================================

const Norms = () => {
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ dimScores: {}, totalPercentage: 0 });
  const [activeDim, setActiveDim] = useState('exclusivity'); // 结果页默认选中

  // --- 逻辑处理 ---
  
  const handleStart = () => {
    setStarted(true);
    window.scrollTo(0, 0);
  };

  // 这里的 answers 来自 QuizPager 的回传
  const handleFinish = (answers) => {
    // 1. 维度分计算 (Raw Sum)
    const raw = {};
    Object.keys(DIMENSIONS).forEach(k => raw[k] = 0);
    
    // 遍历答案累加
    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (q) raw[q.dim] += val; 
    });

    // 2. 平均分与百分比计算
    const finalScores = {};
    let totalSum = 0;
    Object.keys(raw).forEach(k => {
      // 每维度5题，平均分 = 总分 / 5 (符合原逻辑)
      finalScores[k] = raw[k] / 5; 
      totalSum += raw[k];
    });
    
    // 总百分比 = (总分 / (40题 * 5分)) * 100 = (Total / 200) * 100 (符合原逻辑)
    const totalPercentage = Math.round((totalSum / 200) * 100);

    setScores({ dimScores: finalScores, totalPercentage });
    setShowResult(true);
    window.scrollTo(0, 0);
  };

  const handleRetry = () => {
    setStarted(false);
    setShowResult(false);
    setScores({ dimScores: {}, totalPercentage: 0 });
    window.scrollTo(0, 0);
  };

  // ✅ 修复：获取所有维度 (按分数从高到低排序)，变量名改为 allSortedScores
  const allSortedScores = useMemo(() => {
    if (!showResult) return [];
    return Object.entries(scores.dimScores)
      .sort(([, a], [, b]) => b - a)
      .map(([key, val]) => ({ key, val, ...DIMENSIONS[key] }));
  }, [scores, showResult]);

  // --- 渲染 ---

  if (!started) return (
    <QuizContainer>
      <WelcomeCard 
        title="恋爱观规范程度自评"
        introList={[
          "我们每个人的恋爱观，有多少是自己思考的结果，又有多少是社会文化潜移默化植入的“出厂设置”？",
          "本测试共 40 题，涵盖 8 个核心维度，为您进行一次深度扫描。",
          "得分越高，代表您的观念越符合主流规范（受规训程度越高）。",
          "在答题的过程中，您不妨慢下来想一想：我为什么会这么觉得？"
        ]}
        onStart={handleStart}
      />
      <QuizFooter currentId="norms" />
    </QuizContainer>
  );

  if (showResult) return (
    <QuizContainer>
      {/* 1. 结果大卡片 (黑金风格) */}
      <ScoreCard 
        title="检测报告" 
        theme="dark"
        variant="hero"
      >
        <div style={{ fontSize: '4rem', fontWeight: '900', color: '#fbbf24', lineHeight: 1 }}>
          {scores.totalPercentage}%
        </div>
        <div style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#d4d4d8' }}>
          {/* 保持原版文案判定逻辑 */}
          {scores.totalPercentage >= 80 ? "您是一位“标准剧本”的忠实执行者。" :
           scores.totalPercentage >= 60 ? "您在主流与自由之间，似乎正在寻找平衡。" :
           "您是一位亲密关系剧本的“即兴创作者”。"}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.7 }}>
          * 数值越高，代表受传统单偶制规范影响越深
        </div>
      </ScoreCard>

      {/* 2. 雷达图 */}
      <RadarChart 
        dimensions={DIMENSIONS}
        scores={scores.dimScores}
        activeDim={activeDim}
        onDimClick={setActiveDim}
      />

      {/* 3. 详细解读 (全维度) */}
      <div style={{ marginTop: '3rem' }}>
        <h3 className="qz-heading-lg" style={{ color: 'var(--qz-primary)' }}>✦ 全维度深度解析</h3>
        <p className="qz-text-body" style={{ marginBottom: '1.5rem' }}>
          以下是您在所有 8 个维度上的具体得分与评估（按分数从高到低排序）。
        </p>
        
        {/* ✅ 修复：正确使用 allSortedScores */}
        <MoreDetails 
          label="详细报告"
          items={allSortedScores.map(d => ({
            label: d.name,
            score: `${d.val.toFixed(1)}分`,
            content: getFeedback(d.key, d.val)
          }))}
        />
      </div>

      <ResultActions onRetry={handleRetry} />
      <QuizFooter currentId="norms" status="result" />
    </QuizContainer>
  );

  // 答题页：使用新的 QuizPager
  return (
    <QuizContainer>
      <QuizPager 
        questions={QUESTIONS} 
        onFinish={handleFinish}
        mode="list"  // 列表模式
        perPage={10} // 每页10题
      />
    </QuizContainer>
  );
};

export default Norms;
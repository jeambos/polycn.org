import React, { useState, useMemo } from 'react';
import '../../styles/Quiz.css';
import { WelcomeCard, QuizContainer, QuizFooter } from './ui/QuizFrame';
import QuizPager from './ui/QuizPager';
import RadarChart from './ui/RadarChart';
import { ScoreCard, MoreDetails, ResultActions, ResultAnalysis } from './ui/ResultDashboard';
import { QuizStorage } from '../../utils/quizStorage'; // 引入工具

// =====================================================================
// 1. 数据定义 (严格保持原版文案与逻辑参数)
// =====================================================================

const DIMENSIONS = {
  enmeshment: { name: "二人一体", desc: "认为相爱就该毫无保留、共享一切，还是保留个人隐私与独立空间？" },
  one_only: { name: "全能伴侣", desc: "期望伴侣能满足自己经济、情感、娱乐等所有需求，还是接受需求可以多处满足？" },
  gender: { name: "传统分工", desc: "认同“男强女弱/男主外女主内”的定式，还是支持根据能力与意愿灵活分配角色？" },
  family: { name: "顺应父母", desc: "认为伴侣的选择必须得到父母认可才算正当，还是坚持恋爱结婚完全是个人的私事？" },
  institution: { name: "世俗标配", desc: "认为没有房车、彩礼或领证的关系是不完整的，还是看重相处的实质内容重于形式？" },
  jealousy: { name: "嫉妒即爱", desc: "认为“吃醋”是爱的必要证明，还是认为嫉妒是不安全感的体现，需自我消化？" },
  sex_love: { name: "性爱绑定", desc: "坚持“有爱才能有性”的道德准则，还是认为在知情同意下，性和爱可以独立存在？" },
  exclusivity: { name: "绝对排他", desc: "认为关系必须在身体和精神上保持绝对唯一的占有，还是能接纳更具流动性的关系形态？" }
};

const RESULT_FEEDBACK = {
  enmeshment: { // 二人一体
    high: "你似乎倾向于与伴侣高度融合。当“我们”逐渐取代“我”时，请警惕自我边界的消融；尝试保留一部分完全属于你自己的生活切片。",
    mid: "你可能在渴望亲密与需要空间之间摇摆。试着向伴侣表达你对独处的真实需求，建立“暂停”信号，让短暂的分离成为关系的充电期。",
    low: "你似乎非常看重个人边界与独立空间。这种“亲密有间”的相处模式，能让双方在保持自我的前提下，构建更具弹性和呼吸感的长期关系。"
  },
  one_only: { // 全能伴侣
    high: "你可能期望伴侣成为你的一站式港湾。这种“全能期待”容易给关系带来巨大压力；试着从第三方寻找部分情绪或兴趣的支持，给彼此松绑。",
    mid: "当伴侣无法满足你所有期待时，你可能会感到失落。试着盘点需求清单，区分哪些必须由伴侣提供，哪些可以通过其他社交渠道获得满足。",
    low: "你似乎能接受伴侣功能的局限性。允许彼此向外寻求不同的支持系统（如朋友、社群），能有效减轻单一关系的负重，让相处更轻松。"
  },
  gender: { // 传统分工
    high: "传统的性别脚本似乎是你关系的主要蓝本。虽然这能提供确定性，但也可能限制了彼此的潜能；试着互换一次“分内事”，体验角色的流动。",
    mid: "你可能在某些层面仍受性别惯性影响。留意那些“男生/女生就该……”的潜意识念头，试着与其对话，探索更适合你们独特的互动模式。",
    low: "你似乎已跳出了传统性别角色的框架。根据双方的性格与能力而非性别来分配责任，能让关系运转得更加高效且公平。"
  },
  family: { // 顺应父母
    high: "长辈的意见似乎对你的关系有决定性影响。当孝顺与自主发生冲突时，试着先在内心确认自己的真实感受，避免让关系成为满足他人期待的工具。",
    mid: "在面对父母的评价时，你可能会产生动摇。请记住，生活的实际体验者是你自己；试着温和地划定界限，保护关系免受过度的外部干扰。",
    low: "你似乎将关系的主导权牢牢握在自己手中。能够区分“尊重长辈”与“顺从安排”，是你构建成熟、独立小家庭的重要护城河。"
  },
  institution: { // 世俗标配
    high: "你可能倾向于通过外在条件来锚定安全感。虽然物质基础很重要，但请警惕将形式本身当作终点，错过了构建关系内核（如信任、理解）的机会。",
    mid: "社会公认的“里程碑”可能仍会给你带来焦虑。试着问自己：如果没有这些外在证明，我们当下的相处质量是否依然值得肯定？",
    low: "你似乎更看重关系的实质而非外在形式。这种不被房产证或契约定义的自信，能让你更纯粹地体验爱与连接本身的质量。"
  },
  jealousy: { // 嫉妒即爱
    high: "你也许认为强烈的占有欲是深爱的证明。但过度的嫉妒往往源于对失去的恐惧；试着建立内在的安全基地，爱是给予自由而非通过控制来索取。",
    mid: "当嫉妒袭来，你可能需要努力辨识其背后的含义。试着在情绪平复后，与其分享你的脆弱（如“我担心被替代”），而非单纯地表达愤怒。",
    low: "你似乎能理性地将嫉妒视为一种情绪信号。不把吃醋当成爱的计量单位，而是通过它来觉察自身的不安全感，这能极大地降低关系的内耗。"
  },
  sex_love: { // 性爱绑定
    high: "你可能坚持性必须建立在深厚情感之上。坚守自己的道德准则是可贵的，但也请尝试理解不同的价值观，避免因观念差异而对伴侣产生不必要的评判。",
    mid: "将性与爱分离对你来说可能仍有心理门槛。这完全正常，关键在于确保每一次的身体接触都是基于清晰的知情同意与真实的意愿。",
    low: "你似乎能以开放的视角看待性与爱。理解身体自主权，尊重欲望的自然流动，能让你在探索亲密关系时拥有更广阔的自由度。"
  },
  exclusivity: { // 绝对排他
    high: "忠诚与排他似乎是你关系的核心底线。明确表达这一需求非常重要，同时也请尝试理解，排他形式之外，依然存在着其他形式的深层承诺与连接。",
    mid: "你可能在理智上接受多元，但在情感上仍渴望唯一。诚实地面对这种拉扯，与伴侣协商出适合当下的边界，不必强迫自己一步到位。",
    low: "你似乎对关系形态持有一种流动的包容度。这种不执着于绝对占有的心态，能为你应对复杂的人性与多变的关系阶段提供强大的适应力。"
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
  { id: 1, dim: 'enmeshment', text: "对象就是我的另一半，谈恋爱不存在什么两个人。" },
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
        {/* 3. 详细解读 (使用智能分流组件) */}
      {/* 这里的 threshold={4.0} 决定了多少分算“高分/重点关注” */}
      <ResultAnalysis 
        title="全维度深度解析"
        threshold={4.0} 
        items={allSortedScores.map(d => ({
          label: d.name,
          // ResultAnalysis 会自动 parseFloat 解析数值，这里保留"分"字也无妨，或者去掉也可以
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
        quizId="norms" // ✅ 新增：唯一标识，用于本地存储
      />
    </QuizContainer>
  );
};

export default Norms;
import React, { useState, useMemo } from 'react';
import '../../styles/Quiz.css';
import { WelcomeCard, QuizContainer, QuizFooter } from './ui/QuizFrame';
import QuizPager from './ui/QuizPager';
import RadarChart from './ui/RadarChart';
import { ScoreCard, ResultAnalysis, ResultActions } from './ui/ResultDashboard';

// =====================================================================
// 1. 数据定义
// =====================================================================

const DIMENSIONS = {
  communication: { name: "坦诚沟通", desc: "面对羞耻或恐惧时，依然能真实表达想法与感受的能力" },
  regulation: { name: "情绪调节", desc: "觉察自身情绪波动，并以建设性方式进行自我安抚与消化的能力" },
  boundaries: { name: "守卫底线", desc: "清晰界定自我边界，并在被侵犯时能坚定维护、不因讨好而退让" },
  conflict: { name: "化解冲突", desc: "在分歧中寻求共识，将对抗转化为理解，修复关系裂痕的能力" },
  bandwidth: { name: "情感带宽", desc: "承载他人情绪、提供支持以及应对关系中复杂情感流动的心理容量" },
  deconditioning: { name: "去规训化", desc: "识别并剥离主流社会既定脚本的束缚，摆脱无意识的顺从" },
  energy: { name: "精力分配", desc: "调动精神能量以处理生活杂务、解决实际问题并维持秩序的能力" },
  independence: { name: "精神独立", desc: "建立内在评价体系，不依赖外界认可作为自我价值来源的稳固状态" }
};

const getAdvice = (dimKey, score) => {
  const isHigh = score >= 4;
  const isLow = score <= 2.5;
  
  const adviceMap = {
  communication: { // 坦诚沟通
    high: "你似乎习惯于在关系中袒露真实自我。保持这种在恐惧面前依然敞开的勇气，它是建立深层信任的核心，能让关系在真实的碰撞中更加紧密。",
    mid: "你可能在安全领域能坦诚，但在涉及羞耻感的话题时仍有保留。尝试在感到不适时多向前迈出一步，逐步扩大你们共同的“安全言说区”。",
    low: "表达脆弱对你来说可能是一项挑战。试着从描述当下的感受（如“我感到焦虑”）开始，而非直接表达观点或指责，让对方看到防御背后的真实需求。"
  },
  regulation: { // 情绪调节
    high: "你似乎具备较强的自我安抚能力。这种稳定的内核不仅能助你度过风暴，也能为伴侣提供“情绪容器”，是构建安全依恋关系的重要基石。",
    mid: "面对强烈的情绪波动，你偶尔可能会感到棘手。建立个性化的“暂停机制”或许有帮助：在反应溢出前按下暂停键，待理智回归后再处理关系议题。",
    low: "强烈的情绪可能常让你感到失控。建立一个专属的“情绪急救箱”（如特定的呼吸法或书写练习），在被淹没前通过物理或感官手段帮自己通过难关。"
  },
  boundaries: { // 守卫底线
    high: "你似乎很清楚自己的心理边界。清晰地界定“我是谁”与“我能接受什么”，能有效防止关系中的耗竭与怨怼，这是维持长期关系活力的前提。",
    mid: "你可能在维护和谐与坚持自我之间摇摆。请记住，模糊的边界往往是冲突的温床；温和而坚定地拒绝，其实是在告诉对方如何正确地爱护你。",
    low: "你也许习惯通过退让来换取安全感。练习区分“讨好”与“友善”，从小事开始练习说“不”。真正的亲密关系，是建立在两个独立人格互相尊重的基础上的。"
  },
  conflict: { // 化解冲突
    high: "你似乎善于将冲突转化为增进了解的契机。这种在分歧中寻找共识、在对抗后主动修复的能力，是多边关系能够穿越风雨、长期存续的关键。",
    mid: "争吵后，你可能需要一些时间来平复。尝试缩短从“对抗”到“修复”的冷却期，主动发起连接的信号，避免因为长时间的冷战而形成难以弥合的隔阂。",
    low: "冲突发生时，防御本能可能让你陷入非黑即白的对错之争。试着暂停争辩，转而关注双方未被满足的需求，将视角从“我对你错”切换到“我们共同面对”。"
  },
  bandwidth: { // 情感带宽
    high: "你似乎拥有丰沛的心理能量来承载他人的情感。这种包容力能滋养关系，但也请留意自身的负荷极限，定期清理情绪垃圾，确保持续输出爱意的能力。",
    mid: "你的情感容量可能因状态波动而变化。学会觉察当下的“电量”，在低能量时诚实地向伴侣挂起“免战牌”，避免因勉强支撑而导致的情绪透支或爆发。",
    low: "你目前的心理余裕可能较为有限。在多边关系中，优先照顾好自己的身心状态是第一位的；只有当自我杯满溢出时，给予他人的爱才是轻盈且健康的。"
  },
  deconditioning: { // 去规训化
    high: "你似乎已在很大程度上摆脱了主流脚本的束缚。这种不受世俗标准绑架、自定义关系形态的自由度，是你探索非传统关系模式最宝贵的心理资产。",
    mid: "潜意识里那些关于“正常恋爱”的既定标准可能仍会干扰你。当出现嫉妒或占有欲时，试着觉察这是否源自外界植入的观念，而非你真实的内在需求。",
    low: "传统的婚恋观可能仍是你判断关系的潜标尺。试着审视那些让你痛苦的“应该”和“必须”，思考它们是否真的适用于你当下的关系，逐步重构属于你的规则。"
  },
  energy: { // 精力分配
    high: "你似乎能高效地调动精神能量处理生活杂务。在复杂的多边关系中，这种维持生活秩序、解决实际问题的执行力，是保障关系平稳运行的底层硬件。",
    mid: "在多线程处理生活与情感时，你可能偶尔感到捉襟见肘。尝试更精准地预估你的时间与精力成本，为突发状况留出余量，避免因过度承诺而陷入混乱。",
    low: "琐碎的生活事务可能会消耗你过多的心力。善用外部工具（如日历、提醒事项）来辅助记忆与规划，降低认知负荷，防止生活失序影响到关系质量。"
  },
  independence: { // 精神独立
    high: "你似乎拥有稳固的内在评价体系。不依赖伴侣的反馈来确认自我价值，让你在独处时依然充实，也让你在关系中能保持“亲密而有间”的健康状态。",
    mid: "你可能偶尔会通过伴侣的关注度来衡量自身价值。培养真正属于自己的兴趣领域，建立独立于关系之外的快乐源泉，能让你在关系中更加从容。",
    low: "你也许容易在关系中与其融合而失去自我。独处不是被遗弃，而是与自己建立连接的机会；尝试在没有伴侣陪伴时，专注于滋养自己的身心需求。"
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

// =====================================================================
// 2. 主组件
// =====================================================================

const Adaption = () => {
  const [started, setStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState({ dimScores: {}, totalScore: 0 });
  const [activeDim, setActiveDim] = useState('comms');

  // --- 逻辑处理 ---
  
  const handleStart = () => {
    setStarted(true);
    window.scrollTo(0, 0);
  };

  const handleFinish = (answers) => {
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

    setScores({ dimScores, totalScore });
    setShowResult(true);
    window.scrollTo(0, 0);
  };

  const handleRetry = () => {
    setStarted(false);
    setShowResult(false);
    setScores({ dimScores: {}, totalScore: 0 });
    window.scrollTo(0, 0);
  };

  // 准备数据供 ResultAnalysis 使用
  const analysisItems = useMemo(() => {
    if (!showResult) return [];
    return Object.entries(scores.dimScores)
      .sort(([, a], [, b]) => b - a)
      .map(([key, val]) => ({ 
        label: DIMENSIONS[key].name, 
        score: `${val.toFixed(1)}分`, // 格式化为字符串，Analysis组件会自动解析数值
        content: getAdvice(key, val)
      }));
  }, [scores, showResult]);

  // --- 渲染 ---

  if (!started) return (
    <QuizContainer>
      <WelcomeCard 
        title="复杂关系适应能力评估"
        introList={[
          "本评估旨在测试你在复杂关系中的沟通、边界、情绪韧性与冲突解决能力，共40题。",
          "适应性是可以通过后天学习提升的“技能”，而非不可改变的性格。",
          "测试结果将为你提供一个当前的“能力画像”，帮助你找到成长的发力点。",
          "全程不联网，请放下防御，诚实地面对自己的弱点与强项。"
        ]}
        onStart={handleStart}
      />
      <QuizFooter currentId="adaption" />
    </QuizContainer>
  );

  if (showResult) return (
    <QuizContainer>
      {/* 1. 结果大卡片 */}
      <ScoreCard 
        title="适应力画像" 
        theme="dark"
        variant="hero"
      >
        <div style={{ fontSize: '4rem', fontWeight: '900', color: '#fbbf24', lineHeight: 1 }}>
          {scores.totalScore} <span style={{fontSize:'1.5rem', fontWeight:'500', color:'#6b7280'}}>/ 100</span>
        </div>
        <div style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#d4d4d8' }}>
          {scores.totalScore >= 85 ? "您的关系适应力非常出色，能驾驭复杂的动态。" :
           scores.totalScore >= 70 ? "基础稳固，但在部分高难度领域仍有提升空间。" :
           "建议先着重练习基础的情绪与沟通能力。"}
        </div>
      </ScoreCard>

      {/* 2. 雷达图 */}
      <RadarChart 
        dimensions={DIMENSIONS}
        scores={scores.dimScores}
        activeDim={activeDim}
        onDimClick={setActiveDim}
      />

      {/* 3. 全维度结果解析 (使用新组件) */}
      <ResultAnalysis 
        items={analysisItems} 
        title="全维度能力解析"
      />

      {/* 4. 底部按钮组 (ResultAnalysis 不包含按钮，所以这里要放) */}
      <ResultActions onRetry={handleRetry} />
      <QuizFooter currentId="adaption" status="result" />
    </QuizContainer>
  );

  // 答题页
  return (
    <QuizContainer>
      <QuizPager 
        questions={QUESTIONS} 
        onFinish={handleFinish}
        mode="list" 
        perPage={8} 
      />
    </QuizContainer>
  );
};

export default Adaption;
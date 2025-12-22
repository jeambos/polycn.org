import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Assessment.css'; // 需确保同目录下有该 CSS 文件

// =====================================================================
// 1. 数据定义区域
// =====================================================================

// 结果类型定义 (包含详细文案)
const RESULT_TYPES = {
  monogamous: {
    id: 'monogamous',
    name: '单偶取向 (Monogamous)',
    summary: '你非常重视关系的稳定性与排他性。在一段专注、承诺明确的一对一关系中，你最能获得安全感与满足感。',
    advice: '寻找一位同样珍视承诺与深度的伴侣，建立共同的人生愿景。在关系中，你可以尝试建立深层的“二人世界”仪式感，将精力和爱意集中投资。',
    risks: '可能会因为过度依赖伴侣而产生“共生”压力，或因伴侣的正常社交而感到不安全。调整建议：在享受亲密的同时，有意识地培养个人的兴趣爱好和独立朋友圈，记住“我是完整的，才能更好地相爱”。',
    neighbor: '你与【连续单偶取向】很像，区别在于你可能更渴望一种“永恒”的叙事，而不仅仅是当下的唯一。'
  },
  serial_mono: {
    id: 'serial_mono',
    name: '连续单偶取向 (Serial Monogamy)',
    summary: '你倾向于在不同的人生阶段全心投入一段明确的一对一关系。你重视当下的承诺，但不强求一段关系必须维持一生。',
    advice: '跟随生命阶段的流动去爱。每一段关系都是你人生的一块拼图，尽情投入当下，如果在成长中彼此方向不再一致，允许好聚好散。',
    risks: '容易陷入“无缝衔接”的循环，用新关系来逃避旧关系的伤痛。调整建议：在两段关系之间留出一段“独处空窗期”，用于复盘和自我修复。',
    neighbor: '你与【单偶取向】很像，区别在于你更能接受关系的自然终结，将其视为成长而非失败。'
  },
  monogamish: {
    id: 'monogamish',
    name: '松散单偶取向 (Monogamish)',
    summary: '你整体上偏向单偶关系，但在边界上较为宽松。相比于绝对的排他，你更看重核心关系的质量，允许一定程度的弹性。',
    advice: '建立一段稳固的一对一核心关系，但在规则上保留“透气孔”（如允许特定情境下的调情或无需报备的社交）。重点在于与伴侣达成共识：什么是我们的底线。',
    risks: '容易在“弹性”和“出轨”之间模糊界限，引发信任危机。调整建议：诚实是最高原则，不要利用“松散”作为欺骗的借口，任何越界行为前先沟通。',
    neighbor: '你与【开放关系】很像，区别在于你的重心依然是“封闭”多于“开放”，外部探索只是点缀。'
  },
  adaptable: {
    id: 'adaptable',
    name: '可适应型 (Adaptable)',
    summary: '你对关系的形式没有强烈的执念。无论是单偶还是非单偶，只要关系内部沟通顺畅、逻辑自洽，你都能从容适应并感到满足。',
    advice: '你的天赋是“包容”，寻找一位人格成熟、沟通能力强的伴侣（无论什么倾向）最为重要。你可以成为很好的倾听者和配合者，构建量身定制的关系。',
    risks: '容易因为“什么都行”而逐渐失去自我，变成伴侣的附属品（变色龙效应）。调整建议：定期自问“这真的是我想要的吗，还是为了配合对方？”，保持核心需求的清晰。',
    neighbor: '你与【探索中】的区别在于，你是“游刃有余”的，而探索者往往是“迷茫焦虑”的。'
  },
  exploring: {
    id: 'exploring',
    name: '探索中 (Exploring)',
    summary: '你正处于一种“寻找”的状态。目前的某些关系模式让你感到不适（错位感），你渴望尝试新的可能性，尽管方向可能还不明确。',
    advice: '不要急于定义自己。阅读书籍、参加社群讨论、与不同观念的人交流。把现在的阶段当作“试衣间”，允许自己尝试和犯错，直到找到那件合身的衣服。',
    risks: '容易因为急于摆脱现状而冲动进入一段复杂的非单偶关系，导致受伤。调整建议：慢下来，知识储备先行，不要把非单偶制当成解决现有关系问题的救命稻草。',
    neighbor: '你与【可适应型】的区别在于，你内心有一种强烈的“不适感”驱动你去改变，而非随遇而安。'
  },
  open_rel: {
    id: 'open_rel',
    name: '开放关系取向 (Open Relationship)',
    summary: '你适合以一段核心关系为基础，同时对外部的性或情感连接持开放态度。你重视核心伴侣的安全感，也珍视个人的自由。',
    advice: '构建“核心+外围”的同心圆结构。维护好与主要伴侣的信任基石，在此基础上探索外部世界。制定清晰的健康与边界协议是关键。',
    risks: '容易忽视“次要伴侣”的感受，或者核心伴侣感到被工具化。调整建议：即使是短暂的关系也需要尊重，同时要时刻关注核心关系的温度，避免顾此失彼。',
    neighbor: '你与【多重亲密】很像，区别在于你通常有明确的“主次之分”，且外部关系可能更偏向肉体或轻情感。'
  },
  polyamorous: {
    id: 'polyamorous',
    name: '多重亲密取向 (Polyamory)',
    summary: '你拥有充沛的情感容量，希望同时与多个人建立深度的亲密关系。你乐于见到伴侣也能获得快乐（同喜），并愿意为此承担沟通成本。',
    advice: '学习高阶的时间管理和非暴力沟通。建立多段平行的深度关系，让爱意流动。承认每个人的独特性，不要在伴侣间做比较。',
    risks: '过度承诺（Over-promising）导致精疲力尽，或陷入复杂的三角调节。调整建议：量力而行，不要为了“集邮”而建立关系，确保每一段关系都有足够的滋养。',
    neighbor: '你与【开放关系】很像，区别在于你追求的是多段“爱”而不仅仅是“体验”，每一段关系都很重。'
  },
  non_hierarchical: {
    id: 'non_hierarchical',
    name: '非层级多重亲密 (Non-Hierarchical)',
    summary: '你不希望将不同的关系进行人为的排序（如主次之分）。你更在意每一段关系各自的发展节奏，尊重每段关系的独立性。',
    advice: '去中心化的生活方式。像经营花园一样经营关系网，每朵花都有自己的土壤和花期。依靠“日程表”而非“特权”来分配资源。',
    risks: '在资源冲突（如谁陪你过年）时缺乏决策机制，导致混乱。调整建议：虽然没有层级，但要有优先级判断标准（如先约先得、紧急程度），避免陷入决策瘫痪。',
    neighbor: '你与【自主关系】很像，但你可能更愿意为了伴侣们的需求而进行一定程度的协商和妥协。'
  },
  solo_poly: {
    id: 'solo_poly',
    name: '自主关系取向 (RA/Solo Poly)',
    summary: '你高度重视个人的独立与自主。你不希望亲密关系成为限制个人发展的框架，不将关系视为优先于自我选择的结构。',
    advice: '以自我为圆心构建生活。你可以拥有深厚的连接，但保持财务、居住和决策的独立。你的“主要伴侣”其实是你自己。',
    risks: '过度强调独立可能演变成“回避依恋”，导致他人感到无法靠近。调整建议：区分“独立”与“孤立”，在保持自我的同时，练习展示脆弱和依赖的能力。',
    neighbor: '你与【非层级多重】很像，区别在于你更强调“我不属于任何人”，拒绝关系自动扶梯（如结婚同居）。'
  },
  high_boundary: {
    id: 'high_boundary',
    name: '高边界非单偶 (High-Boundary ENM)',
    summary: '你对非单偶关系持开放态度，但你的安全感建立在清晰的规则与约定之上。你偏好在明确的框架内探索自由。',
    advice: '“契约式”探索。在进入关系前，详细讨论并制定“关系说明书”。适合采用 DADT（不知情原则）或严格的排他协议变体。',
    risks: '规则可能成为控制焦虑的工具，一旦出现意外情况（规则漏洞）易崩溃。调整建议：记住规则是为人服务的，随着信任增加，试着逐步让渡一些控制权，容忍模糊性。',
    neighbor: '你与【单偶取向】很像，区别在于你用规则管理的是“开放”的风险，而不是完全封闭。'
  }
};

// 题目数据 (40道题，已线性排列)
// 维护者注：原逻辑为 6个维度 + 4个红灯题。
// 为了用户体验，红灯题被插在中间位置。
const RAW_QUESTIONS = [
  // --- Page 1: 维度一 排他 (1-6) ---
  {
    id: 1,
    text: "只有当确信我是伴侣眼中‘唯一的、不可替代的’特殊存在时，我才能在关系中感到安全和满足。",
    weights: { monogamous: 2, serial_mono: 2, high_boundary: 1 }
  },
  {
    id: 2,
    text: "只要想到伴侣的内心深处还住着另一个同样重要的人，我就会感到自我价值降低，或感到关系受到了威胁。",
    weights: { monogamous: 2, monogamish: 1, serial_mono: 1 }
  },
  {
    id: 3,
    text: "成为某个人情感上的‘唯一寄托’或‘全部世界’，这让我感到的不是荣幸，而是一种沉重的心理负担。",
    weights: { polyamorous: 2, solo_poly: 2, non_hierarchical: 1 }
  },
  {
    id: 4,
    text: "即使理智上接受，但如果真的想象伴侣与他人发生亲密接触，我的身体会有明显的恶心、僵硬或恐慌反应。",
    weights: { monogamous: 2, serial_mono: 2 }
  },
  {
    id: 5,
    text: "如果看到伴侣因为与他人的互动而感到快乐和满足，我内心深处会因为‘他/她很高兴’而感到欣慰（同喜），并无嫉妒。",
    weights: { polyamorous: 2, non_hierarchical: 2, open_rel: 1 }
  },
  {
    id: 6,
    text: "我认为伴侣之间的时间和关注应当默认是专属彼此的，我很难接受需要去‘争取’伴侣的注意力。",
    weights: { monogamous: 2, monogamish: 1 }
  },

  // --- Page 2: 维度二 稳定 + 红灯1 (7-12 + 101) ---
  {
    id: 7,
    text: "当我投入一段严肃关系时，我是以‘长久维持’甚至‘终身相伴’为目标开始的，不以长久为目的的关系让我缺乏安全感。",
    weights: { monogamous: 2, serial_mono: 2, high_boundary: 1 }
  },
  {
    id: 101, // 🔴 红灯: 病理性嫉妒
    isRedFlag: true,
    title: "深层情绪检测",
    text: "即使是很小的互动（如伴侣夸赞别人一句），也会引发我强烈的愤怒，或者产生被抛弃的极度恐慌。",
    warning: "你的安全感可能处于高度预警状态。无论选择何种关系，建立内心的安全基地可能是当务之急。"
  },
  {
    id: 8,
    text: "如果一段美好的关系最终结束了，即使过程很愉快，我依然倾向于认为这是一种‘失败’或‘遗憾’。",
    weights: { monogamous: 2, monogamish: 1 }
  },
  {
    id: 9, 
    text: "对我来说，关系的‘形式’（是单偶还是多边）并不重要，重要的是两个人当下的相处质量。只要沟通顺畅，我不介意形式发生变化。",
    weights: { adaptable: 2, solo_poly: 1 }
  },
  {
    id: 10,
    text: "我常因为‘已经在一起很久了’或‘习惯了对方’，而倾向于维持一段哪怕不再让我感到满足的关系。",
    weights: { monogamous: 1, monogamish: 1 }
  },
  {
    id: 11,
    text: "我能接受关系随着生命阶段自然改变（例如从恋人变成朋友，或从排他变成开放），而不需要为此感到恐慌。",
    weights: { adaptable: 2, solo_poly: 2, non_hierarchical: 1, serial_mono: 1 }
  },
  {
    id: 12,
    text: "如果不知道一段关系‘未来会怎样’（例如是否结婚、是否有明确结果），当下的不确定性会让我感到强烈的焦虑。",
    weights: { monogamous: 2, high_boundary: 2 }
  },

  // --- Page 3: 维度三 容量 + 红灯2 (13-18 + 102) ---
  {
    id: 13,
    text: "处于热恋或深爱状态时，我对其他人会完全失去浪漫或性方面的兴趣，注意力只集中在一个人身上。",
    weights: { monogamous: 2, serial_mono: 2 }
  },
  {
    id: 14,
    text: "我可以同时对不同的人产生不同质感的爱意，且这些感情能够共存，不会因为有了新的爱意而减少对旧人的爱。",
    weights: { polyamorous: 2, non_hierarchical: 2, open_rel: 1 }
  },
  {
    id: 15,
    text: "应对一个人的情绪需求和生活琐事，就已经耗尽了我所有的社交与情感能量。",
    weights: { monogamous: 2, open_rel: 1 } 
  },
  {
    id: 102, // 🔴 红灯: 过度讨好
    isRedFlag: true,
    title: "深层情绪检测",
    text: "为了维持关系和谐，我常常无底线地压抑自己的真实需求，甚至到了委曲求全的地步。",
    warning: "你可能容易在关系中失去自我。在探索多边关系前，请先试着练习确立自己的底线。"
  },
  {
    id: 16,
    text: "我拥有充沛的情感，只照顾一个伴侣无法完全释放我想要关怀他人、与他人建立深层连接的愿望。",
    weights: { polyamorous: 2, non_hierarchical: 1 }
  },
  {
    id: 17,
    text: "无论伴侣多么完美，我都觉得只与一个人深度连接，无法满足我情感或智识上的全部需求。",
    weights: { polyamorous: 2, solo_poly: 1, open_rel: 1 }
  },
  {
    id: 18,
    text: "需要在不同的人际关系模式中来回切换（例如对A温柔、与B理智），这让我感到非常疲惫和混乱。",
    weights: { monogamous: 2, monogamish: 1 }
  },

  // --- Page 4: 维度四 边界 (19-24) ---
  {
    id: 19,
    text: "如果不明确界定‘我们现在算什么关系’（例如是朋友还是恋人），这种定义不清的状态会让我感到不安。",
    weights: { monogamous: 2, high_boundary: 2, serial_mono: 1 }
  },
  {
    id: 20,
    text: "我相信明确的约定或承诺，胜过相信当下的感觉。当出现分歧时，我倾向于回归之前的约定来解决。",
    weights: { high_boundary: 2, monogamous: 1, open_rel: 1 }
  },
  {
    id: 21, 
    text: "在关系中，如果伴侣需要排他，我能接受；如果伴侣需要空间，我也能接受。我自己的需求会随着伴侣的风格而灵活调整。",
    weights: { adaptable: 2, serial_mono: 1 }
  },
  {
    id: 22,
    text: "我认为伴侣之间应当没有秘密，我需要知道对方大部分的行踪和想法才能感到安心。",
    weights: { monogamous: 2, monogamish: 1, high_boundary: 1 }
  },
  {
    id: 23,
    text: "即使在最亲密的关系中，我也希望能保留一部分完全属于自己的、对方不知道的私密生活。",
    weights: { solo_poly: 2, open_rel: 1, adaptable: 1 }
  },
  {
    id: 24,
    text: "当关系中出现一些未曾约定的灰色地带时，我的第一反应是恐慌，而不是好奇或开放地去探索。",
    weights: { monogamous: 2, high_boundary: 2 }
  },

  // --- Page 5: 维度五 优先序 + 红灯3 (25-30 + 103) ---
  {
    id: 25,
    text: "我认为理想的爱，意味着两个人高度融合，不分你我，共同作为一个整体面对世界。",
    weights: { monogamous: 2, monogamish: 1 }
  },
  {
    id: 103, // 🔴 红灯: 双重标准
    isRedFlag: true,
    title: "价值观检测",
    text: "坦白说，我希望自己拥有更多自由去探索外部世界，但同时希望我的伴侣对我保持绝对的排他与忠诚。",
    warning: "这种不对等的期待通常是关系冲突的根源。请思考一下，这种需求是源于对自由的渴望，还是源于对他人的控制欲？"
  },
  {
    id: 26,
    text: "当个人发展（如去异地工作）与维持关系发生冲突时，我倾向于调整自己的人生计划以保全关系。",
    weights: { monogamous: 2, serial_mono: 1 }
  },
  {
    id: 27,
    text: "如果一段关系要求我改变生活习惯或放弃独处时间，我的第一反应是想要逃离这段关系，而不是妥协。",
    weights: { solo_poly: 2, non_hierarchical: 1 }
  },
  {
    id: 28,
    text: "在做重大人生决定时，我习惯优先考虑对自己最有利的选项，而不是优先考虑这会对伴侣产生什么影响。",
    weights: { solo_poly: 2, non_hierarchical: 1 }
  },
  {
    id: 29,
    text: "我享受那种‘没有对方就生活不下去’的相互依赖感，这让我感到安全且被需要。",
    weights: { monogamous: 2, monogamish: 1 }
  },
  {
    id: 30, 
    text: "我很清楚自己在感情中想要什么、不要什么，所以我不会因为外界的诱惑或伴侣的要求而感到迷茫。",
    weights: { adaptable: 1, solo_poly: 1, monogamous: 1, exploring: -2 } 
  },

  // --- Page 6: 维度六 探索 + 红灯4 (31-36 + 104) ---
  {
    id: 31, 
    text: "我常感到目前的亲密关系模式（无论现在是哪种）让我觉得不适或别扭，但我还不确定什么样的模式才真正适合我。",
    weights: { exploring: 2, adaptable: -1 }
  },
  {
    id: 32, 
    text: "我对于尝试新的关系模式（如开放关系）有一种迫切的渴望，觉得那可能是我解决当前困惑的途径。",
    weights: { exploring: 2, open_rel: 1 }
  },
  {
    id: 33,
    text: "哪怕传统婚姻有再多问题，我也觉得那是一条最安全、最省心的路。",
    weights: { monogamous: 2, monogamish: 1 }
  },
  {
    id: 34,
    text: "如果探索新关系意味着要经历嫉妒的煎熬或复杂的沟通，我宁愿选择平淡但安稳的生活。",
    weights: { monogamous: 2, adaptable: 1 }
  },
  {
    id: 104, // 🔴 红灯: 救世主
    isRedFlag: true,
    title: "深层情绪检测",
    text: "我享受被很多人同时需要的感觉，这往往让我卷入复杂的情感纠葛，导致局面失控或让他人受伤。",
    warning: "“能爱很多人”与“需要被很多人依赖”是不同的。请警惕这种倾向是否让你陷入了混乱的边界纠缠。"
  },
  {
    id: 35,
    text: "只要想到偏离传统的单一伴侣制，我内心就会涌起一股难以名状的羞耻感或罪恶感。",
    weights: { monogamous: 2, high_boundary: 1 }
  },
  {
    id: 36, 
    text: "我不确定自己到底适合什么，所以我愿意承担风险去尝试不同的关系，把犯错看作是寻找自我的必要成本。",
    weights: { exploring: 2, solo_poly: 2, non_hierarchical: 1, adaptable: -1 }
  }
];

// 预留的后续问卷链接 (Placeholder)
const FUTURE_QUIZZES = [
  { id: 'adaptability', name: '关系适应性评估', desc: '测试你的沟通模式与冲突解决风格', status: 'coming' },
  { id: 'jealousy', name: '嫉妒类型图谱', desc: '你是防御型嫉妒还是竞争型嫉妒？', status: 'coming' },
  { id: 'style', name: '依恋类型自测', desc: '你的依恋风格如何影响多边关系', status: 'coming' },
];

// =====================================================================
// 2. 子组件区域
// =====================================================================

/**
 * 欢迎页面组件
 */
const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    {/* 标题区 */}
    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
      <h1 className="result-title" style={{ border: 'none', marginBottom: '0.5rem' }}>
        关系倾向自测问卷
      </h1>
      <p style={{ color: '#6b7280' }}>
        探索内心，而非定义未来
      </p>
    </div>

    {/* 必读说明 */}
    <div className="welcome-box">
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#c2410c' }}>
        🔴 测前必读
      </h3>
      <ul style={{ lineHeight: '1.8', color: '#374151' }}>
        <li style={{ marginBottom: '0.8rem' }}>
          <strong>1. 关于目的：</strong> 本问卷主旨并非推销非单偶制，而是作为一面镜子，帮助您厘清自己的关系倾向。在探索过程中，诚实地面对自己比得到某个特定的结果更重要。
        </li>
        <li style={{ marginBottom: '0.8rem' }}>
          <strong>2. 关于心态：</strong> 请暂时放下单偶制的社会规训（例如“正常的恋爱应该是怎样的”），也不要评判自己的想法是否“正确”。请仅依据您内心最真实的直觉作答。
        </li>
        <li>
          <strong>3. 关于隐私：</strong> 本问卷的所有代码与计算过程全程在您的本地浏览器运行，不会上传至任何服务器。即使断网，您也可以安全、完整地完成测试。
        </li>
      </ul>
    </div>

    {/* 开始按钮 */}
    <div className="welcome-btn-wrapper" style={{ marginTop: '2.5rem', marginBottom: '3rem' }}>
      <button onClick={onStart} className="btn-primary">
        开始自我探索
      </button>
    </div>

    {/* 更多问卷预留区 */}
    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
        更多测试 (Coming Soon)
      </h4>
      <div className="ok-match-grid">
        {FUTURE_QUIZZES.map(quiz => (
          <div key={quiz.id} className="ok-card" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            <div style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.2rem' }}>{quiz.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{quiz.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * 结果展示组件
 */
const ResultScreen = ({ results, onRetry }) => {
  return (
    <div className="quiz-container animate-fade-in">
      {/* 1. 红灯警示区 */}
      {results.redFlags.length > 0 && (
        <div className="red-flag-box">
          <h3 className="red-flag-title">
            ⚠️ 探索前的温柔提醒
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#b91c1c', marginBottom: '1rem' }}>
            在您的回答中，我们监测到了一些可能影响关系质量的深层信号。这些不是指责，而是保护。
          </p>
          <div>
            {results.redFlags.map(q => (
              <div key={q.id} className="red-flag-item">
                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1f2937' }}>{q.title}</div>
                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#666', marginBottom: '8px' }}>
                  "{q.text}" (您选择了符合)
                </div>
                <div style={{ color: '#dc2626', fontSize: '0.9rem' }}>{q.warning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Best Match */}
      <div className="result-card">
        <div className="result-watermark">?</div>
        <h2 className="result-label">You are best for</h2>

        {results.bestMatch ? (
          <>
            <h1 className="result-title">{results.bestMatch.name}</h1>
            <div style={{ lineHeight: '1.7', color: '#d1d5db' }}>
              <p style={{ fontSize: '1.1rem', color: 'white', marginBottom: '1.5rem', fontWeight: '500' }}>
                {results.bestMatch.summary}
              </p>
              <div className="result-advice-box">
                <span className="result-tag text-orange">💡 人生规划建议</span>
                {results.bestMatch.advice}
              </div>
              <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="result-advice-box">
                  <span className="result-tag text-red">🚩 潜在风险与调整</span>
                  {results.bestMatch.risks}
                </div>
                <div className="result-advice-box">
                  <span className="result-tag text-blue">🔗 相似辨析</span>
                  {results.bestMatch.neighbor}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>复合型 / 流动型</h1>
            <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>
              您的关系倾向呈现出高度的流动性或复合特征，没有单一的标签能完全定义您（最高匹配度未达 80%）。
              <br />这通常意味着您拥有极强的适应力，或者正处于观念重塑的阶段。
              <br />请参考下方的“潜在适合”选项，那里可能有您的答案。
            </p>
          </div>
        )}
      </div>

      {/* 3. OK Matches */}
      {results.okMatches.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderLeft: '4px solid #9ca3af', paddingLeft: '0.75rem', color: '#1f2937' }}>
            You are OK for (潜在适合)
          </h2>
          <div className="ok-match-grid">
            {results.okMatches.map(type => (
              <div key={type.id} className="ok-card">
                <div className="ok-header">
                  <h3 style={{ fontWeight: 'bold', color: '#111827' }}>{type.name}</h3>
                  <span className="ok-badge">匹配度: {type.percent}%</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.75rem', lineHeight: '1.5' }}>{type.summary}</p>
                <div style={{ fontSize: '0.85rem', color: '#4b5563', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                  <strong>💡 建议：</strong> {type.advice}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 底部操作栏 */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
        <div className="footer-nav">
          <a href="/start" className="footer-link">🚀 开始探索</a>
          <a href="/start/faq" className="footer-link">❓ 常见问题</a>
          <a href="/start/myths" className="footer-link">🚫 常见误区</a>
          <a href="/library" className="footer-link">📚 馆藏大厅</a>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onRetry} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer', textDecoration: 'underline' }}>
            🔄 重新测试
          </button>
          <a href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
            🏠 返回首页
          </a>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// 3. 主控制组件
// =====================================================================

const Assessment = () => {
  const [started, setStarted] = useState(false);
  const [pageIndex, setPageIndex] = useState(0); // 当前页码 (0-based)
  const [answers, setAnswers] = useState({}); // { [questionId]: score }
  const [showResult, setShowResult] = useState(false);

  // 分页设置：每页6题
  const QUESTIONS_PER_PAGE = 6;
  const totalPages = Math.ceil(RAW_QUESTIONS.length / QUESTIONS_PER_PAGE);

  // 获取当前页的题目
  const currentQuestions = useMemo(() => {
    const start = pageIndex * QUESTIONS_PER_PAGE;
    return RAW_QUESTIONS.slice(start, start + QUESTIONS_PER_PAGE);
  }, [pageIndex]);

  // 处理单题选择
  const handleSelectOption = (questionId, val) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
  };

  // 处理“下一页”
  const handleNextPage = () => {
    // 简单校验：必须答完本页所有题
    const allAnswered = currentQuestions.every(q => answers[q.id] !== undefined);
    if (!allAnswered) {
      alert("请完成本页所有题目后再继续 :)");
      return;
    }

    if (pageIndex < totalPages - 1) {
      setPageIndex(prev => prev + 1);
      // 滚动回顶部
      document.getElementById('quiz-container')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowResult(true);
      document.getElementById('quiz-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 重新开始
  const handleRetry = () => {
    setStarted(false);
    setPageIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  // 计算结果 (Memoized)
  const results = useMemo(() => {
    if (!showResult) return null;

    const scores = {};
    Object.keys(RESULT_TYPES).forEach(k => scores[k] = 0);
    const redFlags = [];

    Object.entries(answers).forEach(([qId, scoreStr]) => {
      const score = parseInt(scoreStr);
      const q = RAW_QUESTIONS.find(i => i.id === parseInt(qId));
      if (!q) return;

      if (q.isRedFlag) {
        if (score >= 4) redFlags.push(q);
      } else {
        const multiplier = score - 3;
        if (multiplier !== 0 && q.weights) {
          Object.entries(q.weights).forEach(([typeKey, weightValue]) => {
            scores[typeKey] += (multiplier * weightValue);
          });
        }
      }
    });

    const sortedTypes = Object.entries(scores)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([key, score]) => {
        let percent = Math.round((score / 25) * 100); 
        if (percent > 99) percent = 99;
        if (percent < 0) percent = 0;
        return { ...RESULT_TYPES[key], score, percent };
      });

    const bestMatch = sortedTypes[0].percent >= 80 ? sortedTypes[0] : null;
    const okMatches = sortedTypes.filter(t => t.percent >= 50 && t.id !== bestMatch?.id).slice(0, 3);

    return { bestMatch, okMatches, redFlags };
  }, [showResult, answers]);


  // 渲染逻辑分支
  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  if (showResult && results) {
    return <ResultScreen results={results} onRetry={handleRetry} />;
  }

  // 答题中界面
  const progress = ((pageIndex) / totalPages) * 100;

  return (
    <div id="quiz-container" className="quiz-container animate-fade-in">
      {/* 进度条 */}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress + (100/totalPages)}%` }}></div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        {currentQuestions.map((q, index) => (
          <div key={q.id} className="quiz-card" style={{ marginBottom: '1.5rem' }}>
            <div className="question-meta">
              Question {(pageIndex * QUESTIONS_PER_PAGE) + index + 1} / {RAW_QUESTIONS.length}
            </div>
            <h2 className="question-text">
              {q.text}
            </h2>

            <div className="option-list">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSelectOption(q.id, val)}
                  className={`option-btn ${answers[q.id] === val ? 'selected' : ''}`}
                >
                  <span className="option-number">{val}</span>
                  <span style={{ color: answers[q.id] === val ? '#c2410c' : '#374151' }}>
                    {val === 1 && "非常不符合"}
                    {val === 2 && "比较不符合"}
                    {val === 3 && "中立 / 说不清"}
                    {val === 4 && "比较符合"}
                    {val === 5 && "非常符合"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 翻页按钮 */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <button onClick={handleNextPage} className="btn-primary">
          {pageIndex < totalPages - 1 ? "下一页" : "查看结果"}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
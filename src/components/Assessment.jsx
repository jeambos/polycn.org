import React, { useState, useMemo, useEffect } from 'react';
import '../styles/Assessment.css';
import MoreTests from './MoreTests';

// =====================================================================
// 1. 数据定义 (保持不变)
// =====================================================================

const RESULT_TYPES = {
  monogamous: {
    id: 'monogamous',
    name: '单偶取向 (Monogamous)',
    summary: '你非常重视关系的稳定性与排他性。在一段专注、承诺明确的一对一关系中，你最能获得安全感与满足感。',
    advice: '寻找一位同样珍视承诺与深度的伴侣，建立共同的人生愿景。在关系中，尝试建立深层的“二人世界”仪式感。',
    risks: '可能会因为过度依赖伴侣而产生“共生”压力。调整建议：有意识地培养个人的兴趣爱好和独立朋友圈。',
    neighbor: '区别在于你是追求“唯一与永恒”的，而不是像连续单偶者那样更能接受关系的自然终结。'
  },
  serial_mono: {
    id: 'serial_mono',
    name: '连续单偶取向 (Serial Monogamy)',
    summary: '你倾向于在不同的人生阶段全心投入一段明确的一对一关系。你重视当下的承诺，但不强求一段关系必须维持一生。',
    advice: '跟随生命阶段的流动去爱。尽情投入当下，如果在成长中彼此方向不再一致，允许好聚好散。',
    risks: '容易陷入“无缝衔接”来逃避旧关系的伤痛。调整建议：在两段关系之间留出“独处空窗期”用于复盘。',
    neighbor: '区别在于你是“阶段性投入”的，而不是像单偶取向者那样将结束视为失败。'
  },
  monogamish: {
    id: 'monogamish',
    name: '松散单偶取向 (Monogamish)',
    summary: '你整体上偏向单偶关系，但在边界上较为宽松。相比于绝对的排他，你更看重核心关系的质量，允许一定程度的弹性。',
    advice: '建立稳固的核心关系，在规则上保留“透气孔”。重点在于与伴侣达成共识：什么是我们的底线。',
    risks: '容易在“弹性”和“出轨”之间模糊界限。调整建议：诚实是最高原则，任何越界行为前先沟通。',
    neighbor: '区别在于你是“封闭为主，开放为辅”的，而不是像开放关系者那样主动探索外部连接。'
  },
  adaptable: {
    id: 'adaptable',
    name: '可适应型 (Adaptable)',
    summary: '你对关系的形式没有强烈的执念。无论是单偶还是非单偶，只要关系内部沟通顺畅、逻辑自洽，你都能从容适应。',
    advice: '你的天赋是“包容”。寻找一位人格成熟、沟通能力强的伴侣最重要。你可以构建量身定制的关系。',
    risks: '容易因为“什么都行”而逐渐失去自我。调整建议：定期自问“这真的是我想要的吗，还是为了配合对方？”',
    neighbor: '区别在于你是“游刃有余”的，而不是像探索者那样处于“迷茫焦虑”的状态。'
  },
  exploring: {
    id: 'exploring',
    name: '探索中 (Exploring)',
    summary: '你正处于一种“寻找”的状态。目前的某些关系模式让你感到不适（错位感），你渴望尝试新的可能性，尽管方向可能还不明确。',
    advice: '不要急于定义自己。把现在的阶段当作“试衣间”，允许自己尝试和犯错，直到找到那件合身的衣服。',
    risks: '容易因急于摆脱现状而冲动进入复杂关系。调整建议：慢下来，知识储备先行，不要把非单偶制当成救命稻草。',
    neighbor: '区别在于你是被内心的“不适感”驱动改变，而不是像可适应型那样随遇而安。'
  },
  open_rel: {
    id: 'open_rel',
    name: '开放关系取向 (Open Relationship)',
    summary: '你适合以一段核心关系为基础，同时对外部的性或情感连接持开放态度。你重视核心伴侣的安全感，也珍视个人的自由。',
    advice: '构建“核心+外围”的结构。维护好与主要伴侣的信任基石，在此基础上探索外部世界。',
    risks: '容易忽视“次要伴侣”的感受。调整建议：时刻关注核心关系的温度，避免顾此失彼。',
    neighbor: '区别在于你通常有明确的“主次之分”，而不是像多重亲密者那样追求平行的深度关系。'
  },
  polyamorous: {
    id: 'polyamorous',
    name: '多重亲密取向 (Polyamory)',
    summary: '你拥有充沛的情感容量，希望同时与多个人建立深度的亲密关系。你乐于见到伴侣也能获得快乐（同喜）。',
    advice: '学习高阶的时间管理。建立多段平行的深度关系，承认每个人的独特性，不要在伴侣间做比较。',
    risks: '过度承诺导致精疲力尽。调整建议：量力而行，不要为了“集邮”而建立关系。',
    neighbor: '区别在于你追求的是多段“爱”，而不是像开放关系者那样更侧重于“体验”。'
  },
  non_hierarchical: {
    id: 'non_hierarchical',
    name: '非层级多重亲密 (Non-Hierarchical)',
    summary: '你不希望将不同的关系进行人为的排序。你更在意每一段关系各自的发展节奏，尊重每段关系的独立性。',
    advice: '去中心化的生活。像经营花园一样经营关系网，依靠“日程表”而非“特权”来分配资源。',
    risks: '在资源冲突时缺乏决策机制。调整建议：设立优先级判断标准（如先约先得），避免决策瘫痪。',
    neighbor: '区别在于你愿意为了伴侣们的需求而进行协商，而不是像自主关系者那样完全拒绝任何形式的约束。'
  },
  solo_poly: {
    id: 'solo_poly',
    name: '自主关系取向 (RA/Solo Poly)',
    summary: '你高度重视个人的独立与自主。你不希望亲密关系成为限制个人发展的框架，不将关系视为优先于自我选择的结构。',
    advice: '以自我为圆心构建生活。你可以拥有深厚的连接，但保持财务、居住和决策的独立。',
    risks: '过度强调独立可能演变成“回避依恋”。调整建议：区分“独立”与“孤立”，练习展示脆弱。',
    neighbor: '区别在于你更强调“我不属于任何人”，而不是像非层级多重者那样仍处于某种关系网络中。'
  },
  high_boundary: {
    id: 'high_boundary',
    name: '高边界非单偶 (High-Boundary ENM)',
    summary: '你对非单偶关系持开放态度，但你的安全感建立在清晰的规则与约定之上。你偏好在明确的框架内探索自由。',
    advice: '“契约式”探索。在进入关系前，详细讨论并制定“关系说明书”。适合采用 DADT 或严格协议。',
    risks: '规则可能成为控制焦虑的工具。调整建议：随着信任增加，试着逐步让渡一些控制权，容忍模糊性。',
    neighbor: '区别在于你用规则管理的是“开放”的风险，而不是像单偶取向者那样完全封闭。'
  }
};

const CORE_QUESTIONS = [
  // 维度一
  { id: 1, text: "如果确信我是伴侣眼中‘唯一的、不可替代的’特殊存在，我在关系中会更加感到安全和满足。", weights: { monogamous: 2, serial_mono: 2, high_boundary: 1 } },
  { id: 2, text: "当我想到伴侣的内心深处还住着另一个同样重要的人，我更容易感到自我价值被稀释，或觉得关系受到了威胁。", weights: { monogamous: 2, monogamish: 1, serial_mono: 1 } },
  { id: 3, text: "成为某个人情感上的‘唯一寄托’，我知道这是一种荣幸，但是我更多地感受到这是一份责任和沉重的心理负担。", weights: { polyamorous: 2, solo_poly: 2, non_hierarchical: 1 } },
  { id: 4, text: "即使理智上尝试接受，但如果真的想象伴侣与他人发生亲密接触，我往往很难保持身心的平静，甚至会有明显的生理排斥。", weights: { monogamous: 2, serial_mono: 2 } },
  { id: 5, text: "看到伴侣因与他人的互动而快乐时，相比于嫉妒，我似乎更能从中感受到一种‘替他/她高兴’的欣慰感。", weights: { polyamorous: 2, non_hierarchical: 2, open_rel: 1 } },
  { id: 6, text: "我倾向于认为伴侣间的关注应当是专属的；如果需要去‘争取’伴侣的注意力，我通常会感到明显的不适。", weights: { monogamous: 2, monogamish: 1 } },
  // 维度二
  { id: 7, text: "当我投入一段严肃关系时，我更倾向于以‘长久维持’甚至‘终身相伴’为愿景；没有长久承诺的关系往往让我缺乏安全感。", weights: { monogamous: 2, serial_mono: 2, high_boundary: 1 } },
  { id: 8, text: "如果一段关系最终结束了，哪怕过程很愉快，我内心深处依然容易觉得这是一种遗憾，甚至是某种程度的‘失败’。", weights: { monogamous: 2, monogamish: 1 } },
  { id: 9, text: "相比于关系的‘形式’（单偶或多边），我更看重两个人当下的相处质量；只要沟通顺畅，我对关系形式的变化持相对开放的态度。", weights: { adaptable: 2, solo_poly: 1 } },
  { id: 10, text: "我有时会发现自己因为‘在一起很久了’或习惯了对方，而选择留在一段不再那么滋养我的关系里。", weights: { monogamous: 1, monogamish: 1 } },
  { id: 11, text: "对于关系随着生命阶段自然改变（如从恋人变朋友，或从封闭变开放），我通常能比较安然地接受，而不太会感到恐慌。", weights: { adaptable: 2, solo_poly: 2, non_hierarchical: 1, serial_mono: 1 } },
  { id: 12, text: "如果一段关系缺乏明确的‘未来走向’（如结婚或确定结果），这种不确定性往往是我焦虑的主要来源。", weights: { monogamous: 2, high_boundary: 2 } },
  // 维度三
  { id: 13, text: "当我处于深爱状态时，我对其他人的浪漫兴趣通常会显著减退，我的注意力很自然地只聚焦在一个人身上。", weights: { monogamous: 2, serial_mono: 2 } },
  { id: 14, text: "我感觉自己能够同时对不同的人产生不同质感的爱意；新的爱意似乎并不会削减我对原有伴侣的感情。", weights: { polyamorous: 2, non_hierarchical: 2, open_rel: 1 } },
  { id: 15, text: "在我的体验中，应对一个人的情绪需求和生活琐事，往往就已经占据了我大部分的社交与情感能量。", weights: { monogamous: 2, open_rel: 1 } },
  { id: 16, text: "我常觉得自己情感充沛，只照顾一个伴侣似乎不足以完全释放我想要与他人建立深层连接的愿望。", weights: { polyamorous: 2, non_hierarchical: 1 } },
  { id: 17, text: "即便伴侣很好，我有时仍会觉得，仅与一个人建立深度连接，很难满足我在情感或智识上的全部需求。", weights: { polyamorous: 2, solo_poly: 1, open_rel: 1 } },
  { id: 18, text: "需要在不同的人际关系模式中来回切换（如对A温柔、对B理智），这种状态通常让我感到比较疲惫或混乱。", weights: { monogamous: 2, monogamish: 1 } },
  // 维度四
  { id: 19, text: "如果‘我们现在算什么关系’没有一个明确的界定，这种模糊状态更容易让我感到不安。", weights: { monogamous: 2, high_boundary: 2, serial_mono: 1 } },
  { id: 20, text: "相比于变幻莫测的当下感觉，我更倾向于信任明确的约定或承诺；出现分歧时，我习惯回归约定来解决。", weights: { high_boundary: 2, monogamous: 1, open_rel: 1 } },
  { id: 21, text: "我发现自己比较容易随着伴侣的风格调整需求：如果伴侣需要排他，我能接受；如果伴侣需要空间，我也能适应。", weights: { adaptable: 2, serial_mono: 1 } },
  { id: 22, text: "在亲密关系中，如果能知道对方大部分的行踪和想法，我会感到明显更安心；太多的秘密让我不适。", weights: { monogamous: 2, monogamish: 1, high_boundary: 1 } },
  { id: 23, text: "即使关系再亲密，我依然强烈希望保留一部分完全属于自己的私密世界。", weights: { solo_poly: 2, open_rel: 1, adaptable: 1 } },
  { id: 24, text: "当关系中出现未曾约定的灰色地带时，我的第一反应往往是担忧或恐慌，而不是好奇。", weights: { monogamous: 2, high_boundary: 2 } },
  // 维度五
  { id: 25, text: "我向往的理想关系，更接近于两个人高度融合，像一个整体那样去共同面对世界。", weights: { monogamous: 2, monogamish: 1 } },
  { id: 26, text: "当个人发展与维持关系发生冲突时，我往往更愿意调整自己的人生计划，以优先保全关系。", weights: { monogamous: 2, serial_mono: 1 } },
  { id: 27, text: "如果一段关系需要我改变核心生活习惯或放弃独处，我更容易产生想要逃离的冲动，而不是选择妥协。", weights: { solo_poly: 2, non_hierarchical: 1 } },
  { id: 28, text: "在做重大人生决定时，我倾向于优先考虑对自己最有利的选项，其次才是考虑对伴侣的影响。", weights: { solo_poly: 2, non_hierarchical: 1 } },
  { id: 29, text: "那种‘生活中不能没有对方’的深度相互依赖感，通常让我感到很安全，也觉得被需要。", weights: { monogamous: 2, monogamish: 1 } },
  { id: 30, text: "我通常比较清楚自己在感情中想要什么，所以不太容易因为外界诱惑或伴侣要求而感到迷茫。", weights: { adaptable: 1, solo_poly: 1, monogamous: 1, exploring: -2 } },
  // 维度六
  { id: 31, text: "我时常隐隐感到目前的亲密关系模式（无论哪种）似乎有些不合身，让我觉得别扭，哪怕我还说不清原因。", weights: { exploring: 2, adaptable: -1 } },
  { id: 32, text: "我经常感觉到一种想要尝试新关系模式的渴望，觉得那可能是我解决当前困惑的途径。", weights: { exploring: 2, open_rel: 1 } },
  { id: 33, text: "尽管传统婚姻有各种问题，但我依然倾向于认为，那是一条相对最安全、最省心的路。", weights: { monogamous: 2, monogamish: 1 } },
  { id: 34, text: "相比于探索新关系可能带来的复杂与煎熬，我更看重生活的平淡与安稳。", weights: { monogamous: 2, adaptable: 1 } },
  { id: 35, text: "想到偏离传统的单一伴侣制，我内心往往会自动涌起一股羞耻感或不安。", weights: { monogamous: 2, high_boundary: 1 } },
  { id: 36, text: "正因为不确定适合什么，我愿意把尝试不同关系和可能犯的错，看作是寻找自我的必要成本。", weights: { exploring: 2, solo_poly: 2, non_hierarchical: 1, adaptable: -1 } }
];

const RED_FLAGS = [
  { id: 101, isRedFlag: true, title: "情绪反应检测", text: "我发现，即使是很小的互动（如伴侣夸赞别人一句），也往往会引发比我预想中更强烈的愤怒或恐慌。", warning: "你的安全感可能处于预警状态。建立内心的安全基地可能是当务之急。" },
  { id: 102, isRedFlag: true, title: "自我压抑检测", text: "为了维持关系和谐，我经常发现自己在压抑真实需求，有时甚至会感到有些委屈。", warning: "你可能容易在关系中失去自我。建议练习确立自己的底线。" },
  { id: 103, isRedFlag: true, title: "双重标准检测", text: "坦白说，我有时会希望自己拥有更多自由，但同时又希望我的伴侣能对我保持绝对的排他与忠诚。", warning: "这种不对等的期待通常是冲突根源。请思考这是否源于对他人的控制欲？" },
  { id: 104, isRedFlag: true, title: "边界纠缠检测", text: "我比较享受被很多人同时需要的感觉，哪怕这有时会让我卷入一些复杂的情感纠葛。", warning: "“能爱很多人”与“被很多人依赖”不同。警惕这是否让你陷入了混乱的边界纠缠。" }
];

const QUESTIONS = [...CORE_QUESTIONS];
QUESTIONS.splice(7, 0, RED_FLAGS[0]);
QUESTIONS.splice(17, 0, RED_FLAGS[1]);
QUESTIONS.splice(27, 0, RED_FLAGS[2]);
QUESTIONS.splice(37, 0, RED_FLAGS[3]);

const PAGE_BREAKS = [6, 13, 20, 27, 34, 40]; 

// =====================================================================
// 2. 子组件
// =====================================================================

const WelcomeScreen = ({ onStart }) => (
  <div className="quiz-container animate-fade-in">
    <div className="welcome-card">
      <h1 className="welcome-title">关系形态倾向自测</h1>
      
      <div className="intro-box">
        <ul className="intro-list">
          <li className="intro-item">本问卷旨在测试您的关系倾向（您更适合何种关系模式），共40题</li>
          <li className="intro-item">任何关系模式都仅供参考，您自己的关系完全可以由自己定义，不必套用任何模式</li>
          <li className="intro-item">本问卷全程不联网，不收集任何数据，您可放心填写自己真实想法</li>
          <li className="intro-item">本问卷无正确答案，您藉此深入探讨内心真实需求，这一过程比答案更珍贵</li>
          <li className="intro-item">建议您：放下从小到大学习到的恋爱观，从内心出发审视自己的需求</li>
        </ul>
      </div>

      <button onClick={onStart} className="btn-primary" style={{transform: 'scale(1.2)'}}>
        开始探索
      </button>

      

    </div>

    <MoreTests currentId="orientation" status="welcome" />
  </div>
);

// 气泡提示
const SharePopover = ({ onClose }) => (
  <div className="share-popover">
    <div className="popover-text">
      受到技术限制，请您<b>截图</b>保存此页面，手动分享给好友 :)
    </div>
    <button onClick={onClose} className="popover-close">
      我知道了
    </button>
  </div>
);

const ResultScreen = ({ results, onRetry }) => {
  const [showShare, setShowShare] = useState(false);

  // 3秒后自动关闭气泡
  useEffect(() => {
    if (showShare) {
      const timer = setTimeout(() => setShowShare(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showShare]);

  return (
    <div className="quiz-container animate-fade-in">
      <div className="result-header">
        <h2 style={{fontSize: '2rem', fontWeight: '900', color: '#1f2937'}}>测试结果</h2>
        <p style={{color: '#6b7280', fontSize: '0.95rem'}}>以下是您的关系倾向报告，此结果只展示一次，您可截图保存。</p>
      </div>

      {/* 1. Best Match */}
      {results.bestMatch ? (
        <div className="res-card best-match">
          <h3 className="res-header-label">
            YOU ARE <span className="highlight">BEST</span> FOR
          </h3>
          <div className="watermark">PolyCN.org</div>
          
          <div className="res-title">
            {results.bestMatch.name}
            <span className="res-match-rate">契合度 {results.bestMatch.percent}%</span>
          </div>
          <div className="res-summary">{results.bestMatch.summary}</div>
          
          <span className="section-label label-advice">💡 人生规划建议</span>
          <p className="section-text">{results.bestMatch.advice}</p>

          <span className="section-label label-risk">🚩 潜在风险与调整</span>
          <p className="section-text">{results.bestMatch.risks}</p>

          <span className="section-label label-diff">🔗 相似辨析</span>
          <p className="section-text">{results.bestMatch.neighbor}</p>
        </div>
      ) : (
        <div className="res-card best-match">
          <div className="res-title">复合型 / 流动型</div>
          <p style={{color: '#d1d5db'}}>您的倾向呈现出高度的流动性，没有单一标签能定义您。请参考下方的潜在适合类型。</p>
        </div>
      )}

      {/* 2. OK Matches */}
      {results.okMatches.length > 0 && results.okMatches.map(type => (
        <div key={type.id} className="res-card">
          <h3 className="res-header-label">
            YOU ARE <span className="highlight">OK</span> FOR
          </h3>
          <div className="res-title">
            {type.name}
            <span className="res-match-rate">契合度 {type.percent}%</span>
          </div>
          <div className="res-summary">
            {type.summary}
            <div className="ok-advice-block">
              <span className="ok-advice-label">建议：</span>
              {type.advice}
            </div>
          </div>
        </div>
      ))}

      {/* 3. Red Flags */}
      {results.redFlags.length > 0 && (
        <div className="res-card red-flag">
          <div className="res-title" style={{color: '#fecaca'}}>⚠️ 需关注的深层信号</div>
          <p className="red-flag-intro">在您的回答中，我们监测到了一些可能影响关系质量的深层信号：</p>
          <div>
            {results.redFlags.map(q => (
              <div key={q.id} className="red-flag-item">
                <div className="red-flag-title-text">{q.title}</div>
                <div className="red-flag-warning">{q.warning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Actions (Grid布局) */}
      <div className="result-actions">
        {/* Share Button with Popover */}
        <div style={{position: 'relative', width: '100%'}}>
          {showShare && <SharePopover onClose={() => setShowShare(false)} />}
          <div 
            onClick={() => setShowShare(true)} 
            className="action-card-btn btn-share-style"
          >
            <strong>分享结果</strong>
            {/*<span style={{fontSize:'0.85rem', color:'#6b7280'}}>生成截图</span>*/}
          </div>
        </div>

        {/* Retry Button */}
        <div 
          onClick={onRetry} 
          className="action-card-btn btn-retry-style"
        >
          <strong>重新测试</strong>
          {/*<span style={{fontSize:'0.85rem', color:'#9ca3af'}}>清空记录</span>*/}
        </div>
      </div>

      {/* 5. More Tests */}
<MoreTests currentId="orientation" status="result" />

      {/* 6. Mini Nav */}
      <div className="mini-nav">
        <a href="/" className="mini-link">回到首页</a>
        <a href="/start" className="mini-link">开始探索</a>
        <a href="/library" className="mini-link">全部馆藏</a>
        <a href="/wiki" className="mini-link">百科Wiki</a>
      </div>
    </div>
  );
};

// =====================================================================
// 3. 主控制组件 (保持不变)
// =====================================================================

const Assessment = () => {
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
    const redFlags = [];

    Object.entries(answers).forEach(([qId, val]) => {
      const q = QUESTIONS.find(i => i.id === parseInt(qId));
      if (!q) return;

      if (q.isRedFlag) {
        if (val >= 4) redFlags.push(q);
      } else {
        const multiplier = val - 3; 
        if (multiplier !== 0 && q.weights) {
          Object.entries(q.weights).forEach(([typeKey, weight]) => {
            scores[typeKey] += (multiplier * weight);
          });
        }
      }
    });

    const sortedTypes = Object.entries(scores)
      .map(([key, score]) => {
        let percent = Math.round((score / 25) * 100); 
        if (percent > 99) percent = 99;
        if (percent < 0) percent = 0;
        return { ...RESULT_TYPES[key], percent };
      })
      .sort((a, b) => b.percent - a.percent);

    const bestMatch = sortedTypes[0].percent >= 80 ? sortedTypes[0] : null;
    const okMatches = sortedTypes.filter(t => t.percent >= 50 && t.id !== bestMatch?.id).slice(0, 3);

    return { bestMatch, okMatches, redFlags };
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
          <div 
            key={q.id} 
            id={`q-${q.id}`}
            className={`quiz-card ${answers[q.id] !== undefined ? 'answered' : ''}`}
          >
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
        {pageIndex > 0 && (
          <button onClick={handlePrev} className="btn-prev">
            上一页
          </button>
        )}
        <button 
          onClick={handleNext} 
          className={`btn-next ${shakeBtn ? 'animate-shake' : ''}`}
        >
          {pageIndex < PAGE_BREAKS.length - 1 ? "下一页" : "查看结果"}
        </button>
      </div>
    </div>
  );
};

export default Assessment;
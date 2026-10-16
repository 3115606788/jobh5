/* ============================================================
   职业身份重塑H5成长系统 · 应用逻辑
   ============================================================ */

(function() {
'use strict';

/* ---------- 1. 应用状态 ---------- */
const state = {
  // 自查
  currentQuizIndex: 0,
  quizAnswers: [], // 每题得分 1-4
  hasResult: false,
  // 历史
  latestScore: null,
  latestStage: null,
  latestDims: null,
  assessCount: 0,
  // 复盘
  reviewCount: 0,
  // 资源
  favorites: [],
  // 设置
  reduceMotion: false,
  // 当前页面
  pageHistory: ['home'],
};

/* ---------- 2. 自查题库（20 题，4 维度 × 5 题） ---------- */
const QUESTIONS = [
  // 维度 1：身份认知
  { dim: '身份认知', code: 'DIM01', text: '我能说清自己作为职场人的价值点。' },
  { dim: '身份认知', code: 'DIM01', text: '我清楚学生身份与职业身份的行为差异。' },
  { dim: '身份认知', code: 'DIM01', text: '我能向他人介绍自己擅长的专业领域。' },
  { dim: '身份认知', code: 'DIM01', text: '我了解所在行业的发展趋势与核心玩家。' },
  { dim: '身份认知', code: 'DIM01', text: '我能从过去的经历中提炼出可迁移的能力。' },
  // 维度 2：行为习惯
  { dim: '行为习惯', code: 'DIM02', text: '我会主动向负责人确认任务标准。' },
  { dim: '行为习惯', code: 'DIM02', text: '收到否定意见时，我能先听完再回应。' },
  { dim: '行为习惯', code: 'DIM02', text: '我能在截止时间前主动汇报进度。' },
  { dim: '行为习惯', code: 'DIM02', text: '我会按优先级管理自己的工作清单。' },
  { dim: '行为习惯', code: 'DIM02', text: '我会把重要沟通结果形成文字确认。' },
  // 维度 3：心理韧性
  { dim: '心理韧性', code: 'DIM03', text: '被拒绝后，我能在当天恢复行动。' },
  { dim: '心理韧性', code: 'DIM03', text: '面对不确定性，我能列出下一步动作。' },
  { dim: '心理韧性', code: 'DIM03', text: '我能识别自己情绪波动并主动调节。' },
  { dim: '心理韧性', code: 'DIM03', text: '遭遇失败后，我会复盘而非自我否定。' },
  { dim: '心理韧性', code: 'DIM03', text: '我能在压力下保持基本的工作节奏。' },
  // 维度 4：成长规划
  { dim: '成长规划', code: 'DIM04', text: '我有明确的阶段性成长目标。' },
  { dim: '成长规划', code: 'DIM04', text: '我会定期复盘并调整方向。' },
  { dim: '成长规划', code: 'DIM04', text: '我知道下一阶段需要补足的能力。' },
  { dim: '成长规划', code: 'DIM04', text: '我有可量化的进步指标用于自检。' },
  { dim: '成长规划', code: 'DIM04', text: '我会把大目标拆解为可执行的周计划。' },
];

const OPTIONS = [
  { score: 1, label: '完全不符合' },
  { score: 2, label: '不太符合' },
  { score: 3, label: '比较符合' },
  { score: 4, label: '完全符合' },
];

// 阶段判定
const STAGES = [
  { min: 20, max: 35, name: '校园惯性期', desc: '身份认知仍以学生模式为主，行为习惯尚未切换到职业场景。建议从一次完整的职业思维自查开始。' },
  { min: 36, max: 50, name: '角色摇摆期', desc: '开始在职业身份与学生身份之间切换，但遇到压力易回退到旧模式。建议聚焦心理韧性与行为习惯的具象练习。' },
  { min: 51, max: 65, name: '行为过渡期', desc: '职业行为习惯初步建立，但仍需通过复盘巩固身份内化。建议持续周复盘，识别卡点。' },
  { min: 66, max: 80, name: '身份内化期', desc: '职业身份已基本内化，进入阶段性成长优化阶段。建议聚焦成长规划维度，向更长期目标推进。' },
];

// 维度建议库
const DIM_ADVICE = {
  '身份认知': '本周完成一次「价值点提炼」练习：用 100 字写下你能为团队创造的具体价值，并请一位同事或负责人给反馈。可参考资源库《作品集模板》。',
  '行为习惯': '本周做一次「任务标准确认」训练：接到任务后立即向负责人确认验收标准，并把确认结果形成文字。详见指南《职场沟通：如何开口要反馈》。',
  '心理韧性': '本周尝试「拒绝恢复」实验：记录一次被拒绝的情境，写下当天的下一步行动并执行。可参考指南《被拒绝之后》。',
  '成长规划': '本周写一份「30 天最小目标」：选择一个能力点，设定可量化的指标与每周自检节奏。可使用周复盘模板持续追踪。',
};

/* ---------- 3. 指南数据（占位内容） ---------- */
const GUIDES = [
  { id: 'g1', title: '被拒绝之后', tag: '心理韧性', date: '2026-09-12', scene: '简历未通过、面试被拒、offer 被收回——求职期内最常见的高频场景。', understanding: '把否定当作信息而非评价。每一次拒绝都包含了关于匹配度、时机、能力的具体反馈，把它们拆解出来比反复质问自我价值更有用。', actions: ['24 小时内把拒绝内容拆解为「可改进项」与「不可控项」各 3 条', '找一个信任的人复述一次事件，降低情绪浓度', '本周内继续投递 3 个新机会，保持行动节奏'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
  { id: 'g2', title: '入职第一周', tag: '行为习惯', date: '2026-09-10', scene: '拿到 offer 的兴奋之后，第一次走进工位的紧张与无措。', understanding: '允许不完美。前两周的目标不是交付价值，而是建立最小可行的工作节奏与人际关系地图。', actions: ['第一周画一张「关键人物地图」：列出直属负责人、协作方、可请教前辈', '每天结束前用 5 分钟记录「今天学到的 3 件事」', '主动向负责人确认第一个交付物的验收标准'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
  { id: 'g3', title: '从学生思维到职业思维', tag: '身份认知', date: '2026-09-05', scene: '从「老师布置任务」到「主动定义任务」的转换期。', understanding: '学生思维以「完成作业」为目标，职业思维以「交付价值」为目标。差别具体体现在五个行为上。', actions: ['把每周任务按「交付物」而非「过程」重新分类', '每完成一项任务，主动同步结果而非等待被问', '在沟通中区分「请示」与「同步」的使用场景', '尝试在月度复盘中回答「我为团队创造了什么」', '请负责人评价你的「主动性」与「可靠性」'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
  { id: 'g4', title: '职场沟通：如何开口要反馈', tag: '行为习惯', date: '2026-09-01', scene: '内心忐忑地走向负责人的工位，不知道怎么开口。', understanding: '要反馈的成本越低，反馈质量越高。提前准备好具体问题，能让对方给出具体而非笼统的回应。', actions: ['把「想听听您的反馈」改为「这个交付物的 X 部分您觉得哪里可以改进」', '准备 2 个具体问题而非开放式请求', '收到反馈后用一句话复述确认，避免误读', '把反馈结果形成文字备忘，下周回顾'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
  { id: 'g5', title: '角色迷茫：我到底适合什么', tag: '身份认知', date: '2026-08-28', scene: '入职半年，看着同事各有所长，自己仍在原地打转。', understanding: '用行动验证代替空想。空想只会放大不确定性，行动会生成具体数据，让「适合什么」从猜测变成可判断。', actions: ['设定 30 天「探索实验」：选择一个感兴趣的方向投入 10 小时', '在实验结束时回答「我喜欢 / 不喜欢这件事的哪个部分」', '把答案同步到月复盘，作为下一阶段规划的输入', '寻找 1 位该方向的从业者做一次 30 分钟对话'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
  { id: 'g6', title: '过渡期的自我照料', tag: '心理韧性', date: '2026-08-22', scene: '连续加班后失眠、食欲下降、周末也提不起劲。', understanding: '身体是身份过渡期的承重结构。睡眠、运动、求助信号识别是最基础的自我照料，不是奢侈品。', actions: ['固定睡眠节律：23:30 前关灯，使用工具记录入睡与起床时间', '每周 3 次有氧运动，每次不少于 20 分钟', '识别求助信号：连续两周失眠 / 食欲显著变化 / 社交回避，及时联系心理援助通道'], boundary: '如果你连续两周以上情绪持续低落、影响睡眠与食欲，请通过页内通道联系学校心理咨询中心或拨打心理援助热线。本文为科普内容，不构成专业诊疗。' },
];

/* ---------- 4. 资源数据 ---------- */
const RESOURCES = [
  { id: 'r1', title: '作品集通用模板 · 通用版 V1.2', cat: 'template', date: '2026-09-15', source: '原创 · 可商用', desc: '适用于设计、产品、运营岗位，包含项目结构、数据呈现与反思框架。' },
  { id: 'r2', title: 'UI 设计师作品集模板', cat: 'template', date: '2026-09-08', source: '原创 · 可商用', desc: '聚焦 UI 视觉项目，含设计系统截图与流程图呈现规范。' },
  { id: 'r3', title: '互联网行业 · 核心岗位图谱 2026', cat: 'material', date: '2026-09-14', source: '整理自公开资料', desc: '梳理产品、研发、设计、运营四大序列的核心岗位与协作关系。' },
  { id: 'r4', title: '求职信写作素材包 · 9 月新版', cat: 'material', date: '2026-09-12', source: '原创 · 可商用', desc: '按岗位类型分类的开头、过渡、结尾句式素材。' },
  { id: 'r5', title: '面试复盘 · 三轮提问法', cat: 'article', date: '2026-09-13', source: '经验分享 · 标注作者', desc: '从被问到、问到对方、自我追问三个角度做面试复盘。' },
  { id: 'r6', title: '入职 30 天避坑清单', cat: 'article', date: '2026-09-09', source: '经验分享 · 标注作者', desc: '由 5 位入职一年内新人共同整理的真实场景与应对方法。' },
  { id: 'r7', title: '数据分析岗位作品集模板', cat: 'template', date: '2026-09-05', source: '原创 · 可商用', desc: '突出数据清洗、建模、可视化全流程，适合数据方向求职者。' },
  { id: 'r8', title: '行业研究 · 设计工具生态', cat: 'material', date: '2026-09-02', source: '整理自公开资料', desc: 'Figma、Sketch、Adobe 等主流工具的对比与协作场景。' },
];

/* ---------- 5. 工具方法 ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function toast(msg, duration) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration || 1800);
}

/* ---------- 6. 页面导航 ---------- */
const TAB_PAGES = ['home', 'library', 'profile'];

function go(pageId, opts) {
  opts = opts || {};
  // 隐藏所有页面
  $all('.page').forEach(p => p.classList.remove('active'));
  // 显示目标
  const target = $('#page-' + pageId);
  if (!target) { console.warn('page not found:', pageId); return; }
  target.classList.add('active');
  // 滚动到顶
  target.scrollTop = 0;
  // Tab 同步
  if (TAB_PAGES.includes(pageId)) {
    $all('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === pageId));
    state.pageHistory = [pageId];
  } else {
    if (!state.pageHistory.includes(pageId)) {
      state.pageHistory.push(pageId);
    }
  }
  // 触发页面进入回调
  if (PAGE_ENTER[pageId]) PAGE_ENTER[pageId](opts);
}

function back() {
  if (state.pageHistory.length > 1) {
    state.pageHistory.pop();
    const prev = state.pageHistory[state.pageHistory.length - 1];
    go(prev);
  } else {
    go('home');
  }
}

const PAGE_ENTER = {};

/* ---------- 7. 事件绑定：导航 ---------- */
document.addEventListener('click', (e) => {
  const goBtn = e.target.closest('[data-go]');
  if (goBtn) {
    e.preventDefault();
    go(goBtn.dataset.go);
    return;
  }
  const backBtn = e.target.closest('[data-back]');
  if (backBtn) {
    e.preventDefault();
    back();
    return;
  }
  const tabBtn = e.target.closest('[data-tab]');
  if (tabBtn && tabBtn.classList.contains('tab-item')) {
    e.preventDefault();
    go(tabBtn.dataset.tab);
    return;
  }
  // 指南卡片点击 → 打开详情
  const guideCard = e.target.closest('[data-guide]');
  if (guideCard) {
    e.preventDefault();
    openGuide(guideCard.dataset.guide);
    return;
  }
});

/* ---------- 8. 首页渲染 ---------- */
function renderHome() {
  const ring = $('#homeRingFg');
  const valueEl = $('#homeRingValue');
  const deltaEl = $('#homeDelta');
  const stageLabel = $('#homeStageLabel');
  const stageName = $('#homeStageName');
  const stageShort = $('#homeStageShort');
  const todayAction = $('#homeTodayAction');

  const score = state.latestScore || 0;
  const max = 80;
  const circumference = 2 * Math.PI * 60; // ≈377
  const progress = score / max;
  const offset = circumference * (1 - progress);

  // 进度环动画
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    animateNumber(valueEl, 0, score, 700);
  }, 100);

  if (state.hasResult && state.latestStage) {
    stageLabel.textContent = '当前阶段';
    stageName.textContent = state.latestStage.name;
    stageShort.textContent = state.latestStage.name;
    deltaEl.textContent = '本次复盘后 +' + (state.reviewCount * 2) + ' 分';
    deltaEl.style.color = 'var(--forest)';
    todayAction.textContent = state.latestDims ?
      `本周聚焦「${state.latestDims.lowest.dim}」维度：${DIM_ADVICE[state.latestDims.lowest.dim].split('。')[0]}。`
      : '今天完成一次 8 分钟自查，把当前困扰写进本周复盘。';
  } else {
    stageLabel.textContent = '尚未完成自查';
    stageName.textContent = '完成首次自查，开启成长追踪';
    stageShort.textContent = '未定位';
    deltaEl.textContent = '— —';
    deltaEl.style.color = 'var(--ink-sec)';
  }

  // 最新更新列表
  const latest = RESOURCES.slice(0, 3);
  const list = $('#homeLatestList');
  list.innerHTML = latest.map(r => `
    <div class="list-card" data-go="library" style="margin-bottom:10px;">
      <div class="list-card-thumb">
        <svg viewBox="0 0 24 24"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z"/></svg>
      </div>
      <div class="list-card-body">
        <div class="list-card-title">${r.title}</div>
        <div class="list-card-meta">
          <span class="tag tag-green">${catLabel(r.cat)}</span>
          <span>${r.date}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function catLabel(cat) {
  return { template: '作品集模板', material: '行业素材', article: '求职经验' }[cat] || '资源';
}

PAGE_ENTER.home = renderHome;

/* ---------- 9. 资源库渲染 ---------- */
let currentFilter = 'all';

function renderLibrary() {
  const list = $('#libraryList');
  const items = currentFilter === 'all' ? RESOURCES : RESOURCES.filter(r => r.cat === currentFilter);
  if (items.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></div><div class="empty-state-text">该分类暂无内容</div></div>`;
    return;
  }
  list.innerHTML = items.map(r => {
    const fav = state.favorites.includes(r.id);
    return `
    <div class="list-card" style="margin-bottom:10px;" data-resource="${r.id}">
      <div class="list-card-thumb">
        <svg viewBox="0 0 24 24"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z"/></svg>
      </div>
      <div class="list-card-body">
        <div class="list-card-title">${r.title}</div>
        <div class="list-card-meta">
          <span class="tag tag-green">${catLabel(r.cat)}</span>
          <span>${r.date}</span>
        </div>
        <div class="t-mark" style="margin-top:6px;font-size:11px;line-height:1.5;">${r.source}</div>
      </div>
      <button class="fav-btn" data-fav="${r.id}" style="background:none;border:none;padding:8px;color:${fav ? 'var(--brass)' : 'var(--neutral)'};">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${fav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.6"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>
    `;
  }).join('');
  // 重新触发级联
  list.classList.remove('stagger');
  void list.offsetWidth;
  list.classList.add('stagger');
}

PAGE_ENTER.library = renderLibrary;

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.filter-chip');
  if (chip) {
    $all('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.cat;
    renderLibrary();
    return;
  }
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    e.stopPropagation();
    const id = fav.dataset.fav;
    const idx = state.favorites.indexOf(id);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast('已取消收藏');
    } else {
      state.favorites.push(id);
      toast('已收藏');
    }
    renderLibrary();
    renderProfile();
    return;
  }
  const res = e.target.closest('[data-resource]');
  if (res) {
    toast('资源详情页开发中，敬请期待');
    return;
  }
});

/* ---------- 10. 我的页渲染 ---------- */
function renderProfile() {
  $('#profileReviewCount').textContent = state.reviewCount;
  $('#profileFavCount').textContent = state.favorites.length;
  $('#profileAssessCount').textContent = state.assessCount;
  $('#profileReviewSub').textContent = state.reviewCount + ' 条';
  $('#profileFavSub').textContent = state.favorites.length + ' 项';
}
PAGE_ENTER.profile = renderProfile;

/* ---------- 11. 自查流程 ---------- */
function renderQuiz() {
  const q = QUESTIONS[state.currentQuizIndex];
  $('#quizIndex').textContent = `第 ${state.currentQuizIndex + 1} / 20 题`;
  $('#quizDimLabel').textContent = q.dim;
  $('#quizDim').textContent = `${q.code} · ${q.dim}`;
  $('#quizText').textContent = q.text;
  $('#quizProgressBar').style.width = ((state.currentQuizIndex + 1) / 20 * 100) + '%';

  // 渲染选项
  const optsEl = $('#quizOptions');
  const currentAnswer = state.quizAnswers[state.currentQuizIndex];
  optsEl.innerHTML = OPTIONS.map((opt, i) => `
    <button class="quiz-option ${currentAnswer === opt.score ? 'selected' : ''}" data-score="${opt.score}">
      <span class="opt-mark">${i + 1}</span>
      <span class="opt-text">${opt.label}</span>
    </button>
  `).join('');

  // 按钮状态
  $('#quizPrev').disabled = state.currentQuizIndex === 0;
  const nextBtn = $('#quizNext');
  const hasAnswer = currentAnswer !== undefined;
  nextBtn.textContent = state.currentQuizIndex === 19 ? '提交' : '下一题';
  nextBtn.disabled = !hasAnswer;
}

PAGE_ENTER['assessment-quiz'] = renderQuiz;

document.addEventListener('click', (e) => {
  const opt = e.target.closest('.quiz-option');
  if (opt) {
    const score = parseInt(opt.dataset.score, 10);
    state.quizAnswers[state.currentQuizIndex] = score;
    renderQuiz();
    return;
  }
});

$('#quizPrev').addEventListener('click', () => {
  if (state.currentQuizIndex > 0) {
    state.currentQuizIndex--;
    renderQuiz();
  }
});

$('#quizNext').addEventListener('click', () => {
  if (state.currentQuizIndex < 19) {
    state.currentQuizIndex++;
    renderQuiz();
  } else {
    // 提交
    submitAssessment();
  }
});

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-start-quiz]')) {
    state.currentQuizIndex = 0;
    state.quizAnswers = [];
    go('assessment-quiz');
  }
});

function submitAssessment() {
  // 计算各维度得分
  const dims = [
    { dim: '身份认知', scores: state.quizAnswers.slice(0, 5) },
    { dim: '行为习惯', scores: state.quizAnswers.slice(5, 10) },
    { dim: '心理韧性', scores: state.quizAnswers.slice(10, 15) },
    { dim: '成长规划', scores: state.quizAnswers.slice(15, 20) },
  ];
  dims.forEach(d => {
    d.total = d.scores.reduce((a, b) => a + b, 0);
    d.max = 20;
  });
  const total = dims.reduce((a, d) => a + d.total, 0);
  const lowest = dims.reduce((min, d) => d.total < min.total ? d : min, dims[0]);
  const stage = STAGES.find(s => total >= s.min && total <= s.max);

  state.latestScore = total;
  state.latestStage = stage;
  state.latestDims = { dims, lowest };
  state.hasResult = true;
  state.assessCount++;

  // 渲染结果
  renderResult(total, dims, lowest, stage);
  go('assessment-result');
}

function renderResult(total, dims, lowest, stage) {
  $('#resultStage').textContent = stage.name;
  $('#resultStageDesc').textContent = stage.desc;

  // 数字滚动
  const scoreEl = $('#resultScore');
  animateNumber(scoreEl, 0, total, 700);

  // 维度条
  const barsEl = $('#resultDimBars');
  barsEl.innerHTML = dims.map(d => `
    <div class="dim-bar ${d === lowest ? 'lowest' : ''}">
      <div class="dim-bar-head">
        <span class="dim-bar-name">${d.dim}</span>
        <span class="dim-bar-score">${d.total} / ${d.max}</span>
      </div>
      <div class="dim-bar-track">
        <div class="dim-bar-fill" data-width="${(d.total / d.max * 100).toFixed(0)}"></div>
      </div>
    </div>
  `).join('');

  // 触发维度条动画
  setTimeout(() => {
    $all('.dim-bar-fill', barsEl).forEach(el => {
      el.style.width = el.dataset.width + '%';
    });
  }, 100);

  // 核心建议
  const adviceEl = $('#resultAdvice');
  adviceEl.innerHTML = `
    <div class="t-mark" style="color:var(--forest-light);margin-bottom:6px;">最低维度 · ${lowest.dim}</div>
    <p class="t-body" style="font-size:14px;line-height:1.7;">${DIM_ADVICE[lowest.dim]}</p>
    <button class="btn btn-secondary" style="margin-top:12px;padding:8px 16px;font-size:13px;" data-go="guide-list">查看相关指南</button>
  `;
}

PAGE_ENTER['assessment-result'] = function() {
  if (!state.hasResult) {
    go('assessment-welcome');
    return;
  }
  if (state.latestDims) {
    renderResult(state.latestScore, state.latestDims.dims, state.latestDims.lowest, state.latestStage);
  }
};

/* ---------- 12. 周复盘保存 ---------- */
$('#reviewSaveBtn').addEventListener('click', () => {
  const fields = {};
  let hasContent = false;
  $all('[data-review-field]').forEach(el => {
    fields[el.dataset.reviewField] = el.value;
    if (el.value.trim()) hasContent = true;
  });
  if (!hasContent) {
    toast('请至少填写一段内容');
    return;
  }
  state.reviewCount++;
  toast('已保存 · 成长值 +2');
  // 清空输入
  setTimeout(() => {
    $all('[data-review-field]').forEach(el => el.value = '');
    go('home');
  }, 800);
});

PAGE_ENTER['weekly-review'] = function() {
  const d = new Date();
  const weekNum = Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
  $('#reviewDate').textContent = `${d.getFullYear()} 年 · 第 ${weekNum} 周`;
};

/* ---------- 13. 指南列表与详情 ---------- */
function renderGuideList() {
  const list = $('#guideList');
  list.innerHTML = GUIDES.map(g => `
    <div class="list-card" data-guide="${g.id}" style="margin-bottom:10px;">
      <div class="list-card-thumb">
        <svg viewBox="0 0 24 24"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4z"/><path d="M8 8h6M8 12h6"/></svg>
      </div>
      <div class="list-card-body">
        <div class="list-card-title">${g.title}</div>
        <div class="list-card-meta">
          <span class="tag tag-green">${g.tag}</span>
          <span>${g.date}</span>
        </div>
        <div class="t-mark" style="margin-top:4px;font-size:11px;line-height:1.5;">${g.scene}</div>
      </div>
    </div>
  `).join('');
}
PAGE_ENTER['guide-list'] = renderGuideList;

function openGuide(id) {
  const g = GUIDES.find(x => x.id === id);
  if (!g) return;
  const el = $('#guideDetail');
  el.innerHTML = `
    <div style="padding:8px 0 16px;">
      <span class="tag tag-green" style="margin-bottom:8px;display:inline-block;">${g.tag}</span>
      <h1 class="t-title" style="font-size:22px;margin-top:8px;">${g.title}</h1>
      <div class="t-mark" style="margin-top:6px;font-family:var(--font-num);">${g.date}</div>
    </div>

    <div class="section">
      <div class="t-section" style="font-size:15px;margin-bottom:6px;">场景描述</div>
      <p class="t-body" style="font-size:14px;line-height:1.8;">${g.scene}</p>
    </div>

    <div class="section">
      <div class="t-section" style="font-size:15px;margin-bottom:6px;">认知解读</div>
      <p class="t-body" style="font-size:14px;line-height:1.8;">${g.understanding}</p>
    </div>

    <div class="section">
      <div class="t-section" style="font-size:15px;margin-bottom:8px;">三个可执行动作</div>
      <ol style="padding-left:20px;">
        ${g.actions.map(a => `<li class="t-body" style="font-size:14px;line-height:1.8;margin-bottom:6px;">${a}</li>`).join('')}
      </ol>
    </div>

    <div class="section">
      <div class="card" style="background:var(--brass-bg);border-color:var(--brass-bg);">
        <div class="t-section" style="font-size:13px;color:var(--warning);margin-bottom:4px;">边界提示</div>
        <p class="t-mark" style="color:var(--ink);font-size:12px;line-height:1.7;">${g.boundary}</p>
        <button class="btn-text" data-go="support" style="margin-top:8px;display:inline-flex;">查看心理援助通道</button>
      </div>
    </div>
  `;
  go('guide-detail');
}

/* ---------- 14. 设置 ---------- */
$('#reduceMotionToggle').addEventListener('click', () => {
  state.reduceMotion = !state.reduceMotion;
  document.body.classList.toggle('reduce-motion', state.reduceMotion);
  $('#reduceMotionValue').textContent = state.reduceMotion ? '开启' : '关闭';
  toast(state.reduceMotion ? '已减弱动效' : '已恢复动效');
});

$('#clearDataBtn').addEventListener('click', () => {
  if (confirm('确认清除本机所有数据？包括自查记录、复盘记录与收藏。此操作不可撤销。')) {
    state.latestScore = null;
    state.latestStage = null;
    state.latestDims = null;
    state.hasResult = false;
    state.assessCount = 0;
    state.reviewCount = 0;
    state.favorites = [];
    state.quizAnswers = [];
    state.currentQuizIndex = 0;
    toast('本机数据已清除');
    setTimeout(() => go('home'), 800);
  }
});

/* ---------- 15. 数字滚动动画 ---------- */
function animateNumber(el, from, to, duration) {
  if (state.reduceMotion) {
    el.textContent = to;
    return;
  }
  const start = performance.now();
  function frame(t) {
    const p = Math.min((t - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 5); // ease-out quint
    const val = Math.round(from + (to - from) * eased);
    el.textContent = val;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- 16. 状态栏时间 ---------- */
function updateStatusTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  $('#statusTime').textContent = h + ':' + m;
}
updateStatusTime();
setInterval(updateStatusTime, 30000);

/* ---------- 17. 初始化 ---------- */
renderHome();
console.log('职业身份重塑H5成长系统 · 已加载');

})();

<template>
  <div class="oj-recruit-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="nav">
        <h1 class="logo">YTU OJ实验室</h1>
        <div class="nav-links">
          <button @click="scrollTo('intro')">平台介绍</button>
          <button @click="scrollTo('work')">学习内容</button>
          <button @click="scrollTo('faq')">常见问题</button>
          <button @click="scrollTo('plan')">纳新安排</button>
          <button @click="scrollTo('join')">加入我们</button>
        </div>
      </div>
    </header>

    <!-- banner 区域：使用动态 translateX -->
    <section class="banner" id="top">
      <div class="banner-text" :style="{ transform: `translateX(${translateXValue}px)` }">
        <h2>OnlineJudge 实验室 2026 纳新</h2>
        <p>不卷纯算法 · 专注全栈 & AI 应用开发 · 拥抱 Copilot/Codex · Vibe Coding 更高效</p>
      </div>
    </section>

    <!-- 平台介绍 -->
    <section class="section" id="intro">
      <div class="container" :class="visibleSections.intro ? 'show' : ''">
        <h3 class="title">平台介绍</h3>
        <div class="content-card">
          <p>学校的 OnlineJudge 平台目前主要为学生提供在线程序评测和自动化代码批改服务。</p>
          <p>OJ 实验室服务于 YTUOnline Judge 平台，进行日常维护和升级。</p>
          <p>⚡ <strong>2026 全新升级</strong>：全面引入全栈开发实践 + AI 应用开发流程。从大模型 API 调用到智能编程助手，使用 GitHub Copilot、Cursor、Codex 等
            Agent 进行 Vibe Coding，培养具备现代工程能力的开发者。</p>
        </div>
      </div>
    </section>

    <!-- 学习内容 -->
    <section class="section" id="work">
      <div class="container" :class="visibleSections.work ? 'show' : ''">
        <h3 class="title">💻 实验室工作学习内容</h3>
        <div class="content-card">
          <ol>
            <li>
              <strong>平台答疑与维护</strong>
              <p>处理师生日常答疑、学生提交情况处理、考试异常处理（如更换机器、清空答题记录）。</p>
            </li>
            <li>
              <strong>全栈开发 + AI 应用开发（核心）</strong>
              <p>学习内容：可根据个人兴趣自行选择技术栈，前端(Vue/React) + 后端(Node.js/Go/Python/Java) + 数据库设计；掌握大模型 API 调用、构建智能助手、AI 应用落地。<br>
                循序渐进，对新手超级友好，学长学姐手把手带你从零到完整项目！</p>
            </li>
            <li>
              <strong>Linux 系统使用</strong>
              <p>服务器维护必备，日常学习工作以 Linux 为主，熟练掌握命令行操作，为全栈与 AI 应用部署打下坚实基础。</p>
            </li>
            <li>
              <strong>AI 辅助开发 & Vibe Coding 实践</strong>
              <p>学习使用 GitHub Copilot、Cursor、Codex 等智能 Agent 辅助编码、调试与重构，体验“自然语言驱动开发”的前沿范式，大幅提升开发效率与创造力。</p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 常见问题 FAQ -->
    <section class="section" id="faq">
      <div class="container" :class="visibleSections.faq ? 'show' : ''">
        <h3 class="title">💻 常见问题及解答</h3>
        <div class="faq-list">
          <div class="faq-item" v-for="(item, index) in faqs" :key="index">
            <div class="faq-question" @click="toggleFaq(index)">
              <span>{{ item.question }}</span>
              <span class="arrow">{{ item.open ? '−' : '+' }}</span>
            </div>
            <div class="faq-answer" v-show="item.open">
              <p v-html="item.answer"></p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 纳新安排 -->
    <section class="section" id="plan">
      <div class="container" :class="visibleSections.plan ? 'show' : ''">
        <h3 class="title">💻 预计纳新安排</h3>
        <div class="timeline">
          <div class="time-item">
            <h4>2025.9~11月</h4>
            <p>OJ 实验室招新宣传工作</p>
          </div>
          <div class="time-item">
            <h4>2025.11~2026.4月</h4>
            <p>自主学习 C/C++/算法基础；可提前自学 HTML/CSS/JS，鼓励尝试使用 Copilot、Codex 等 AI 工具辅助学习编程。</p>
          </div>
          <div class="time-item">
            <h4>2026.5月</h4>
            <p>成果验收 + 面试（展示期间使用的 AI 工作流、项目作品），确定最终成员</p>
          </div>
          <div class="time-item">
            <h4>2026.5~8月</h4>
            <p>实验室成员初期培训：全栈 + AI 应用开发阶段性任务（前后端对接、AI API 调用等）</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 加入我们 -->
    <section class="section join-section" id="join">
      <div class="container" :class="visibleSections.join ? 'show' : ''">
        <h3 class="title">📩 加入我们</h3>
        <div class="join-card">
          <h2>现在加群，开启纳新考核第一步！</h2>
          <p class="tip">全栈 + AI 开发新体验，胜利在向你们招手！！！</p>
          <div class="qrcode">
            <img src="../../../assets/qqew.jpg" style="width: 280px;">
            <!-- <div class="qrcode-placeholder">
                纳新交流群二维码
              </div> -->
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>如有其他疑问，欢迎在交流群提问 ~</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'OJRecruitPage'
})

// 动态 translateX 控制（初始为0，滚动时向左移动产生视差）
const translateXValue = ref(0)

// 各区域可见性状态（用于入场动画）
const visibleSections = reactive({
  intro: false,
  work: false,
  faq: false,
  plan: false,
  join: false
})

// FAQ 数据
const faqs = reactive([
  {
    question: 'OJ 实验室平时干啥？',
    answer: '在实验室内主要工作是管理与维护 OJ 系统，同时承担学院内程序设计类的测试、考试以及比赛的相关工作。',
    open: false
  },
  {
    question: '选拔考核怎么考？',
    answer: '通过阶段性任务验收进行筛选：安装Linux、配置环境、简单网页、前后端对接、调用AI接口等。<br>提供教程，学长学姐答疑。<br>约3次任务 + 面试 = 最终录取。过程鼓励使用Copilot/Codex辅助编码。',
    open: false
  },
  {
    question: '没有基础，学得来这些开发技术吗？',
    answer: '完全可以！全栈与AI开发更看重工程思维与学习能力，考核主要看投入度和动手意愿。<br>只要踏实肯花时间，借助AI辅助工具学习效率更高，比聪明更重要的是耐心。',
    open: false
  },
  {
    question: 'OJ 实验室跟 ACM 实验室有什么区别？',
    answer: 'OJ：要求算法低，主攻全栈开发、AI应用落地、做网站/项目。<br>ACM：侧重算法学习、刷题、打算法竞赛。',
    open: false
  },
  {
    question: 'OJ 实验室的优势是什么？',
    answer: '独立空调WIFI学习空间 + 高质量学习资源<br>学习前沿全栈技术和AI应用开发，提升项目能力<br>学长学姐规划学习路线，并带领使用Copilot等AI工具加速成长<br>学习时间自主，氛围轻松<br>大厂/985/211学长学姐资源',
    open: false
  },
  {
    question: '加入了 OJ 实验室，是不是学不了算法了？',
    answer: '不是！只是学习重心不同。<br>你依然可以自学算法、参加蓝桥杯等竞赛。<br>精力有限，做好选择即可。',
    open: false
  },
  {
    question: '✨ 实验室会教我们使用AI编程工具吗？具体有哪些？',
    answer: '当然！我们将组织专项分享和实战，带领大家上手 GitHub Copilot、Cursor、Codex 等 AI 编程助手，讲解如何利用LLM改善代码质量、快速原型开发，并鼓励 Vibe Coding 方式合作。让你真正接触工业级 AI 开发流程。',
    open: false
  }
])

// 折叠 FAQ
const toggleFaq = (index) => {
  faqs[index].open = !faqs[index].open
}

// 滚动处理：更新banner视差效果 + 各模块入场动画
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop

  // Banner 视差效果：滚动时文字向左移动，范围 0 到 -200px
  // 滚动 0px -> 偏移 0，滚动 250px 以上 -> 偏移 -200px
  const offset = Math.min(0, -scrollTop * 0.8)
  translateXValue.value = Math.max(offset, -200)

  // 获取所有需要动画的 section（通过 id 定位）
  const sections = ['intro', 'work', 'faq', 'plan', 'join']
  sections.forEach(sectionId => {
    const element = document.getElementById(sectionId)
    if (element) {
      const rect = element.getBoundingClientRect()
      // 当元素顶部进入视口 75% 区域时触发显示（一旦显示就不再隐藏，保持可见状态）
      const isVisible = rect.top < window.innerHeight * 0.75
      if (isVisible && !visibleSections[sectionId]) {
        visibleSections[sectionId] = true
      }
    }
  })
}

// 平滑滚动到指定区域
const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 初始调用一次，确保初始可见区域立即显示动画
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

.oj-recruit-page {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  color: #333;
}

/* 导航 */
.header {
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 99;
}

.nav {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 22px;
  color: #2d8cf0;
}

.nav-links button {
  margin-left: 16px;
  padding: 8px 12px;
  border: none;
  background: none;
  color: #555;
  cursor: pointer;
  border-radius: 4px;
  transition: 0.3s;
}

.nav-links button:hover {
  background: #e8f3ff;
  color: #2d8cf0;
}

/* banner */
.banner {
  height: 320px;
  background: linear-gradient(90deg, #4b6cb7, #182848);
  color: white;
  display: flex;
  align-items: center;
  padding-left: 10%;
  overflow: hidden;
}

.banner-text {
  transition: transform 0.05s linear;
  /* 平滑跟随滚动 */
}

.banner-text h2 {
  font-size: 36px;
  margin-bottom: 12px;
}

.banner-text p {
  font-size: 18px;
  opacity: 0.9;
}

/* 通用区块 */
.section {
  padding: 60px 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateX(60px);
  transition: all 0.8s ease;
}

.container.show {
  opacity: 1;
  transform: translateX(0);
}

.title {
  font-size: 26px;
  margin-bottom: 30px;
  color: #2d8cf0;
  border-left: 6px solid #2d8cf0;
  padding-left: 12px;
}

.content-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  line-height: 1.8;
}

.content-card ol {
  padding-left: 20px;
}

.content-card li {
  margin-bottom: 16px;
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.faq-question {
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  cursor: pointer;
  background: #f9fbfc;
}

.faq-answer {
  padding: 0 24px 18px;
  line-height: 1.7;
  color: #555;
}

.arrow {
  font-size: 20px;
  color: #2d8cf0;
}

/* 时间线 */
.timeline {
  background: white;
  padding: 24px;
  border-radius: 12px;
}

.time-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.time-item:last-child {
  border-bottom: none;
}

.time-item h4 {
  color: #2d8cf0;
  margin-bottom: 6px;
}

/* 加入我们 */
.join-section {
  background: #e8f3ff;
}

.join-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
}

.join-card h2 {
  color: #ff5c33;
  margin-bottom: 16px;
}

.tip {
  color: #666;
  margin-bottom: 24px;
}

.qrcode-placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: #f5f7fa;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 底部 */
.footer {
  text-align: center;
  padding: 30px;
  color: #888;
  background: white;
}
</style>

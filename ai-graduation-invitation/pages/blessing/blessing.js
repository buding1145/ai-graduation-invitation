// pages/blessing/blessing.js
const { formatTime } = require('../../utils/util.js');

const ROLES = ['教师', '毕业生', '校友'];
const STORAGE_KEY = 'blessing_list';

/** 首次打开时的示例祝福 */
const SEEDS = [
  {
    id: 3,
    name: '2027届·小AI',
    init: 'AI',
    role: '毕业生',
    text: '愿我们把论文写在祖国大地上，把代码编译成灿烂的明天！',
    time: '2026/10/22 09:05',
    likes: 233,
    liked: false
  },
  {
    id: 2,
    name: '2023届学长',
    init: '学',
    role: '校友',
    text: '欢迎加入校友大家庭！记得常回学院看看，这里有你们最美的青春记忆。',
    time: '2026/10/21 18:40',
    likes: 96,
    liked: false
  },
  {
    id: 1,
    name: '辅导员李老师',
    init: '李',
    role: '教师',
    text: '四年时光，见证你们从青涩走向卓越。愿你们此去繁花似锦，再相逢依旧如故！',
    time: '2026/10/20 10:12',
    likes: 128,
    liked: false
  }
];

/** AI 祝福语素材库：随机组合生成 */
const AI_PREFIX = ['', '', '毕业快乐！', '青春不散场，'];
const AI_SUBJECTS = [
  '保持热爱',
  '眼里有光',
  '心中有梦',
  '以代码书写人生',
  '用智慧点亮未来',
  '像深度学习一样不断进化'
];
const AI_TAILS = ['奔赴山海', '行稳致远', '未来可期', '前程似锦', '乘风破浪', '光芒万丈'];

Page({
  data: {
    roles: ROLES,
    roleIdx: 1,
    name: '',
    text: '',
    aiText: '',
    total: 0,
    list: []
  },

  onShow() {
    this.loadList();
  },

  onHide() {
    this.stopType();
  },

  onUnload() {
    this.stopType();
  },

  loadList() {
    let list = wx.getStorageSync(STORAGE_KEY);
    if (!list || !list.length) {
      list = SEEDS;
      wx.setStorageSync(STORAGE_KEY, list);
    }
    this.setData({ list: list, total: list.length });
  },

  onName(e) {
    this.setData({ name: e.detail.value });
  },

  onText(e) {
    this.setData({ text: e.detail.value });
  },

  onRoleChange(e) {
    this.setData({ roleIdx: Number(e.detail.value) });
  },

  /** 送出祝福 */
  submit() {
    const name = (this.data.name || '').trim();
    const text = (this.data.text || '').trim();
    if (!text) {
      wx.showToast({ title: '先写下你的祝福吧', icon: 'none' });
      return;
    }
    const msg = {
      id: Date.now(),
      name: name || '神秘嘉宾',
      init: (name || '神').substring(0, 1),
      role: ROLES[this.data.roleIdx],
      text: text,
      time: formatTime(new Date()),
      likes: 0,
      liked: false
    };
    const list = [msg].concat(this.data.list);
    wx.setStorageSync(STORAGE_KEY, list);
    this.setData({ list: list, total: list.length, text: '', aiText: '' });
    wx.showToast({ title: '祝福已送出', icon: 'success' });
  },

  /** 点赞 / 取消点赞 */
  onLike(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.list.map((m) => {
      if (m.id === id) {
        return Object.assign({}, m, { liked: !m.liked, likes: m.likes + (m.liked ? -1 : 1) });
      }
      return m;
    });
    wx.setStorageSync(STORAGE_KEY, list);
    this.setData({ list: list });
  },

  /** AI 生成祝福语：模板随机组合 + 打字机效果 */
  genAI() {
    this.stopType();
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const sentence = pick(AI_PREFIX) + '愿你' + pick(AI_SUBJECTS) + '，' + pick(AI_TAILS) + '。';
    this.setData({ aiText: '' });
    let i = 0;
    this.typeTimer = setInterval(() => {
      i += 1;
      this.setData({ aiText: sentence.slice(0, i) });
      if (i >= sentence.length) this.stopType();
    }, 60);
  },

  stopType() {
    if (this.typeTimer) {
      clearInterval(this.typeTimer);
      this.typeTimer = null;
    }
  },

  /** 将 AI 祝福填入输入框 */
  useAI() {
    if (!this.data.aiText) return;
    this.setData({ text: this.data.aiText, aiText: '' });
  },

  onShareAppMessage() {
    return {
      title: '快来祝福墙送上你的祝福！',
      path: '/pages/blessing/blessing'
    };
  }
});

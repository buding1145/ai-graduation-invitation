// pages/invite/invite.js
const { EVENT } = require('../../config.js');
const { countdown } = require('../../utils/util.js');

/** 不同身份的个性化问候语 */
const GREETINGS = {
  student:
    '亲爱的2027届毕业生：四年前，你们怀揣热爱而来；今天，你们满载星光而行。愿你们带着AI人的智慧与担当，奔赴山海，前程似锦！',
  teacher:
    '尊敬的老师：三尺讲台，四季耕耘。您用智慧点亮了无数梦想。今天，请允许我们向您道一声：老师，您辛苦了！诚邀您共同见证学生们的荣耀时刻。',
  alumni:
    '亲爱的校友：岁月不居，时节如流。学院的星空因一届届学子而更加璀璨。欢迎您回家，与学弟学妹们共享这一荣耀时刻。'
};

Page({
  data: {
    EVENT: EVENT,
    role: 'student',
    greeting: GREETINGS.student,
    cd: { d: '0', h: '00', m: '00', s: '00', passed: false }
  },

  onLoad() {
    const role = wx.getStorageSync('role') || 'student';
    this.setData({ role: role, greeting: GREETINGS[role] || GREETINGS.student });
  },

  onShow() {
    this.startTimer();
  },

  onHide() {
    this.stopTimer();
    this.stopNeuralCanvas();
  },

  onUnload() {
    this.stopTimer();
    this.stopNeuralCanvas();
  },

  onReady() {
    this.initNeuralCanvas();
  },

  /** 切换身份（教师 / 毕业生 / 校友） */
  onRole(e) {
    const role = e.currentTarget.dataset.role;
    wx.setStorageSync('role', role);
    this.setData({ role: role, greeting: GREETINGS[role] });
  },

  startTimer() {
    this.stopTimer();
    const tick = () => this.setData({ cd: countdown(EVENT.startDate) });
    tick();
    this.timer = setInterval(tick, 1000);
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  /** 打开内置地图，导航到典礼地点 */
  openMap() {
    wx.openLocation({
      latitude: EVENT.latitude,
      longitude: EVENT.longitude,
      name: EVENT.location,
      address: EVENT.address,
      scale: 16
    });
  },

  /** 复制详细地址 */
  copyAddress() {
    wx.setClipboardData({ data: EVENT.address });
  },

  /** 添加到手机日历提醒 */
  addCalendar() {
    if (!wx.addPhoneCalendar) {
      wx.showModal({
        title: '温馨提示',
        content: '当前微信版本不支持添加日历，请升级微信后重试',
        showCancel: false
      });
      return;
    }
    wx.addPhoneCalendar({
      title: EVENT.college + EVENT.title,
      startTime: Math.floor(new Date(EVENT.startDate).getTime() / 1000),
      endTime: Math.floor(new Date(EVENT.endDate).getTime() / 1000),
      location: EVENT.address,
      description:
        '诚邀您参加' + EVENT.college + EVENT.title + '，' + EVENT.dateText + '，' + EVENT.location + '。',
      success: () => wx.showToast({ title: '已添加到日历', icon: 'success' }),
      fail: () =>
        wx.showModal({
          title: '温馨提示',
          content: '当前环境暂不支持添加日历，请在手机微信中打开后重试',
          showCancel: false
        })
    });
  },

  goSchedule() {
    wx.switchTab({ url: '/pages/schedule/schedule' });
  },

  goBlessing() {
    wx.switchTab({ url: '/pages/blessing/blessing' });
  },

  goGuide() {
    wx.navigateTo({ url: '/pages/guide/guide' });
  },

  /** 转发给好友 / 群聊 */
  onShareAppMessage() {
    return {
      title: '🎓 诚邀您参加' + EVENT.college + '2027届毕业典礼',
      path: '/pages/invite/invite'
    };
  },

  /** 分享到朋友圈 */
  onShareTimeline() {
    return { title: EVENT.college + '2027届毕业典礼 · 邀请函' };
  },

  /**
   * 封面"神经网络粒子"动画：
   * 深蓝渐变背景上漂浮的粒子互相连线，呼应人工智能学院主题
   */
  initNeuralCanvas() {
    const query = this.createSelectorQuery();
    query
      .select('#neural')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const dpr = win.pixelRatio || 2;
        const width = res[0].width;
        const height = res[0].height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const particles = [];
        for (let i = 0; i < 42; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: 1 + Math.random() * 1.6
          });
        }

        const LINK = 95;
        const render = () => {
          ctx.clearRect(0, 0, width, height);
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x <= 0 || p.x >= width) p.vx *= -1;
            if (p.y <= 0 || p.y >= height) p.vy *= -1;
          }
          ctx.lineWidth = 1;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < LINK) {
                ctx.strokeStyle =
                  'rgba(255,255,255,' + (0.32 * (1 - d / LINK)).toFixed(3) + ')';
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
          ctx.fillStyle = 'rgba(190,215,255,0.85)';
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          this._raf = canvas.requestAnimationFrame(render);
        };
        render();
        this._canvas = canvas;
      });
  },

  stopNeuralCanvas() {
    if (this._raf && this._canvas) {
      this._canvas.cancelAnimationFrame(this._raf);
      this._raf = null;
    }
  }
});

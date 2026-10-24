// pages/schedule/schedule.js
const { EVENT } = require('../../config.js');

/** 典礼当天完整流程 */
const LIST = [
  { time: '08:00', title: '签到入场', desc: '凭邀请函或学生证签到，领取毕业纪念礼包', place: '大礼堂前广场' },
  { time: '08:30', title: '暖场演出', desc: '学院合唱团与机器人社团创意表演', place: '主舞台' },
  { time: '09:00', title: '典礼开始', desc: '全体起立，奏唱国歌、校歌', place: '主会场' },
  { time: '09:20', title: '院长致辞', desc: '回顾学院发展历程，寄语2027届毕业生', place: '主会场' },
  { time: '09:40', title: '教师代表发言', desc: '教师代表分享临别寄语', place: '主会场' },
  { time: '10:00', title: '毕业生代表发言', desc: '毕业生代表讲述成长故事与青春记忆', place: '主会场' },
  {
    time: '10:20',
    title: '学位授予仪式',
    desc: '拨穗礼 · 颁发学位证书 · 全体毕业生上台',
    place: '主会场',
    badge: '高光时刻',
    highlight: true
  },
  { time: '11:40', title: '合影留念', desc: '全体师生大合影，各班级自由合影', place: '礼堂台阶' },
  { time: '12:00', title: '冷餐欢送会', desc: '自助冷餐会，自由交流，互道珍重', place: '学院中庭花园' }
];

Page({
  data: {
    EVENT: EVENT,
    list: LIST
  },

  onShareAppMessage() {
    return {
      title: '2027届毕业典礼日程安排',
      path: '/pages/schedule/schedule'
    };
  }
});

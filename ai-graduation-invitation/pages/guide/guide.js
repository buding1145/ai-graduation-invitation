// pages/guide/guide.js
Page({
  data: {
    faqs: [
      {
        q: '家长和亲友可以入场吗？',
        a: '可以。每位毕业生可邀请 2 名亲友入场，凭本邀请函在签到处领取入场券。',
        open: false
      },
      {
        q: '无法到场怎么办？',
        a: '典礼将在学院视频号同步直播，可在学院公众号获取直播入口，云端同样精彩。',
        open: false
      },
      {
        q: '学士服在哪里领取？',
        a: '6 月 20 日 - 6 月 25 日，凭学生证到学院楼 110 室领取，典礼结束后原址归还。',
        open: false
      },
      {
        q: '毕业纪念品如何领取？',
        a: '典礼当天签到时，凭签到码领取学院定制纪念礼包（含院徽徽章与纪念册）。',
        open: false
      }
    ]
  },

  /** 展开 / 收起常见问题 */
  toggleFaq(e) {
    const i = e.currentTarget.dataset.i;
    const patch = {};
    patch['faqs[' + i + '].open'] = !this.data.faqs[i].open;
    this.setData(patch);
  }
});

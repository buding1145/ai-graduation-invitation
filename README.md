# 🎓 人工智能学院 2027 届毕业典礼邀请函（微信小程序）

> 为人工智能学院 2027 届毕业典礼制作的电子邀请函微信小程序。
> 适用**教师、毕业生、校友**等不同群体，封面采用「神经网络粒子」动画呼应学院特色，界面美观、操作友好。

## ✨ 功能一览

| 模块 | 说明 |
| --- | --- |
| 📨 邀请函（首页） | 身份切换（教师 / 毕业生 / 校友）显示个性化问候语；典礼实时倒计时；典礼时间地点；一键地图导航、复制地址、添加到手机日历；好友 / 朋友圈分享 |
| 🗓️ 日程 | 典礼当天完整流程时间轴（签到、致辞、学位授予、合影、冷餐会……） |
| 💗 祝福墙 | 「AI 生成祝福语」打字机效果；写祝福（名字 + 身份 + 内容）、点赞；数据本地持久化存储 |
| 🧭 参会指南 | 交通方式、着装建议、温馨提示、常见问题（可折叠展开） |

## 📁 项目结构

```
ai-graduation-invitation
├── app.js                    # 小程序入口
├── app.json                  # 全局配置（页面、窗口、tabBar）
├── app.wxss                  # 全局样式
├── config.js                 # ★ 典礼信息配置（时间/地点/坐标，改这里即可）
├── sitemap.json
├── project.config.json
├── assets/icons/             # tabBar 图标（由脚本生成）
├── scripts/
│   └── gen-icons.js          # 图标生成脚本（node scripts/gen-icons.js）
├── utils/
│   └── util.js               # 倒计时、时间格式化等工具函数
└── pages/
    ├── invite/               # 邀请函首页（粒子封面、身份问候、倒计时）
    ├── schedule/             # 日程安排（流程时间轴）
    ├── blessing/             # 祝福墙（AI 祝福、留言、点赞）
    └── guide/                # 参会指南（交通、着装、FAQ）
```

## 🚀 快速开始

1. 下载安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)；
2. 打开开发者工具 →「导入项目」→ 选择本目录（含 `project.config.json`）；
3. AppID 可使用默认的测试号 `touristappid`（或替换为自己的小程序 AppID）；
4. 编译即可预览，真机预览请使用自己的 AppID（测试号不支持真机预览）。

## 🔧 个性化修改

| 内容 | 位置 |
| --- | --- |
| 典礼时间 / 地点 / 学院名称 | `config.js` |
| 典礼当天流程 | `pages/schedule/schedule.js` 中的 `LIST` |
| 三类身份的问候语 | `pages/invite/invite.js` 中的 `GREETINGS` |
| 示例祝福 / AI 祝福语素材 | `pages/blessing/blessing.js` 中的 `SEEDS` / `AI_*` |
| 重新生成 tabBar 图标 | `node scripts/gen-icons.js` |



## 🛠 技术说明

- 原生微信小程序开发，无任何第三方框架与依赖；
- 封面粒子动画使用 Canvas 2D 同层渲染 + `requestAnimationFrame`，页面隐藏时自动暂停，避免耗电；
- 祝福数据通过 `wx.setStorageSync` 本地持久化；tabBar 图标由 `scripts/gen-icons.js` 纯 Node 脚本生成（PNG 手工编码 + 4 倍超采样抗锯齿）。

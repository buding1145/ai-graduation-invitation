// app.js
const { EVENT } = require('./config.js');

App({
  globalData: {
    EVENT: EVENT
  },

  onLaunch() {
    // 初始化身份偏好，默认：毕业生
    if (!wx.getStorageSync('role')) {
      wx.setStorageSync('role', 'student');
    }
  }
});

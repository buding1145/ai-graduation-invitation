/**
 * 通用工具函数
 */

/** 补零：9 -> "09" */
function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

/**
 * 倒计时：距目标时间还有多久
 * @param {string} target 形如 "2027/06/26 09:00:00"
 * @returns {{d:string, h:string, m:string, s:string, passed:boolean}}
 */
function countdown(target) {
  const t = new Date(target).getTime();
  let diff = Math.floor((t - Date.now()) / 1000);
  const passed = diff <= 0;
  if (passed) diff = 0;
  return {
    d: String(Math.floor(diff / 86400)),
    h: pad(Math.floor((diff % 86400) / 3600)),
    m: pad(Math.floor((diff % 3600) / 60)),
    s: pad(diff % 60),
    passed: passed
  };
}

/** 格式化时间，输出形如 "2026/10/24 09:30" */
function formatTime(date) {
  return (
    date.getFullYear() +
    '/' + pad(date.getMonth() + 1) +
    '/' + pad(date.getDate()) +
    ' ' + pad(date.getHours()) +
    ':' + pad(date.getMinutes())
  );
}

module.exports = { pad, countdown, formatTime };

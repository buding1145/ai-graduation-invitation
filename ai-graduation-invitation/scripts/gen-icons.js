/**
 * 小程序 tabBar 图标生成脚本（纯 Node 实现，无需安装任何依赖）
 * 运行：node scripts/gen-icons.js
 * 在 assets/icons 下生成 81x81 的 PNG 图标（普通态 / 选中态）
 * 采用 4 倍超采样 + 均值缩小，得到抗锯齿的平滑边缘
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---------------- PNG 编码 ----------------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ---------------- 绘制 ----------------
const SIZE = 81; // 官方推荐的 tabBar 图标尺寸
const SS = 4; // 超采样倍数
const BIG = SIZE * SS;

/**
 * 按 inside(X, Y)（81 坐标系内的形状判定函数）着色，返回 RGBA 像素
 */
function render(inside, color) {
  const [r, g, b] = color;
  const big = Buffer.alloc(BIG * BIG * 4);
  for (let y = 0; y < BIG; y++) {
    for (let x = 0; x < BIG; x++) {
      if (inside((x + 0.5) / SS, (y + 0.5) / SS)) {
        const o = (y * BIG + x) * 4;
        big[o] = r;
        big[o + 1] = g;
        big[o + 2] = b;
        big[o + 3] = 255;
      }
    }
  }
  const out = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let n = 0, cr = 0, cg = 0, cb = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const o = ((y * SS + dy) * BIG + (x * SS + dx)) * 4;
          if (big[o + 3]) {
            n++;
            cr += big[o];
            cg += big[o + 1];
            cb += big[o + 2];
          }
        }
      }
      const o = (y * SIZE + x) * 4;
      if (n) {
        out[o] = cr / n;
        out[o + 1] = cg / n;
        out[o + 2] = cb / n;
        out[o + 3] = Math.round((n / (SS * SS)) * 255);
      }
    }
  }
  return out;
}

// ---------------- 基础形状 ----------------
const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;

const inRoundRect = (x, y, x0, y0, x1, y1, r) => {
  const nx = Math.min(Math.max(x, x0 + r), x1 - r);
  const ny = Math.min(Math.max(y, y0 + r), y1 - r);
  const dx = x - nx;
  const dy = y - ny;
  return dx * dx + dy * dy <= r * r;
};

// ---------------- 三个图标（81 坐标系） ----------------
const SHAPES = {
  // 信封：圆角矩形信纸 + 裁掉顶部 V 形信封盖
  mail(X, Y) {
    if (!inRoundRect(X, Y, 10, 22, 71, 62, 9)) return false;
    if (Y >= 22 && Y <= 46 && Math.abs(X - 40.5) <= (30.5 * (46 - Y)) / 24) return false;
    return true;
  },

  // 日历：圆角矩形 + 两根装订柱 + 镂空日期点阵
  calendar(X, Y) {
    const body = inRoundRect(X, Y, 12, 20, 69, 68, 10);
    const post1 = inRect(X, Y, 29, 10, 34, 24);
    const post2 = inRect(X, Y, 47, 10, 52, 24);
    if (!(body || post1 || post2)) return false;
    const dots = [
      [26, 38], [40.5, 38], [55, 38],
      [26, 50], [40.5, 50], [55, 50],
      [33, 61], [48, 61]
    ];
    for (let i = 0; i < dots.length; i++) {
      const dx = X - dots[i][0];
      const dy = Y - dots[i][1];
      if (dx * dx + dy * dy <= 3.2 * 3.2) return false;
    }
    return true;
  },

  // 心形：隐式曲线 (x²+y²-1)³ - x²y³ ≤ 0
  heart(X, Y) {
    const dx = (X - 40.5) / 27.5;
    const dy = (43.5 - Y) / 27.5;
    const v = (dx * dx + dy * dy - 1) ** 3 - dx * dx * dy ** 3;
    return v <= 0;
  }
};

// ---------------- 输出 ----------------
const OUT = path.join(__dirname, '..', 'assets', 'icons');
fs.mkdirSync(OUT, { recursive: true });

const INACTIVE = [154, 163, 181]; // #9aa3b5
const ACTIVE = [59, 83, 224]; // #3b53e0

function preview(rgba) {
  const chars = ' .:-=+*#%@';
  let s = '';
  for (let y = 0; y < SIZE; y += 2) {
    for (let x = 0; x < SIZE; x += 2) {
      const a = rgba[(y * SIZE + x) * 4 + 3];
      s += chars[Math.min(9, Math.floor((a / 255) * 9.99))];
    }
    s += '\n';
  }
  return s;
}

for (const name of Object.keys(SHAPES)) {
  const img = render(SHAPES[name], INACTIVE);
  fs.writeFileSync(path.join(OUT, name + '.png'), encodePNG(SIZE, SIZE, img));
  fs.writeFileSync(
    path.join(OUT, name + '-active.png'),
    encodePNG(SIZE, SIZE, render(SHAPES[name], ACTIVE))
  );
  console.log('=== ' + name + ' ===');
  console.log(preview(img));
}
console.log('图标已生成到 assets/icons/');

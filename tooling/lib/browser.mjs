import { chromium } from 'playwright-core';

/**
 * 启动 Chromium。
 *  - VA_CHROMIUM：指定可执行文件路径
 *  - VA_BROWSER_CHANNEL：chrome / msedge 等已安装的浏览器
 *  - 都不设：使用 playwright-core 自带下载的 Chromium（先运行 npx playwright-core install chromium）
 *
 * --disable-gpu 不能去掉：GPU 栅格同一份源两次渲染结果不完全相同，而且和已发版本的软件栅格结果不同。见 tooling/README.md「确定性」。
 */
export async function launchBrowser() {
  const opts = {
    args: ['--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'],
  };
  if (process.env.VA_CHROMIUM) opts.executablePath = process.env.VA_CHROMIUM;
  else if (process.env.VA_BROWSER_CHANNEL) opts.channel = process.env.VA_BROWSER_CHANNEL;
  try {
    return await chromium.launch(opts);
  } catch (e) {
    throw new Error(
      `无法启动浏览器：${e.message.split('\n')[0]}\n` +
      '解决：运行 `npx playwright-core install chromium`，或设置 VA_BROWSER_CHANNEL=chrome（或 msedge）使用已安装的浏览器，或设置 VA_CHROMIUM 指向可执行文件。'
    );
  }
}

/**
 * 等页面画出两帧再截图。setContent 之后马上截图，拿到的可能是还没画完的一帧：
 * 新开的浏览器里第一个页面，视口最下面 87 像素（窗口顶上浏览器界面的高度，视口靠模拟撑大的那一截）有时还留着旧画面。
 * 见 tooling/README.md「确定性」。
 */
export async function nextFrames(page) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

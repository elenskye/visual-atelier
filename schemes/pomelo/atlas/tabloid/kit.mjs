// Tabloid：柚子的脸、模块贴纸、界面小图标和信封。画是方案里画好的 SVG（构建时读进来，见 tooling/atlas/build.mjs 的
// 清单 ASSET_LIST）；同一张能放很多次，所以每放一次给里面的 id 换一个编号。
export const ASSET_LIST = {
  faces: ['wow', 'wink', 'happy', 'normal'],
  icons: ['chevron-left', 'chevron-right', 'play', 'list-checks', 'x'],
};

/** tag：换编号时 id 后面加的字头（同一个文档里有好几套零件时各用各的，比如 Atlas 页上的一排封面）。 */
export function makeKit(assets, tag = 'z') {
  let seq = 0;
  const inline = (src, w, h) => {
    const k = ++seq;
    return String(src).trim()
      .replace(/id="([^"]+)"/g, `id="$1-${tag}${k}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${tag}${k})`).replace(/href="#([^"]+)"/g, `href="#$1-${tag}${k}"`)
      .replace(/ width="[\d.]+" height="[\d.]+"/, ` width="${w}" height="${h}"`)
      .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');
  };
  const face = (name, size) => inline(assets.faces[name] || assets.faces.normal, size, Math.round((size * 108) / 112));
  const mark = (name, size) => `<span style="display:inline-block;flex:none;line-height:0">${inline(assets.marks[name] || assets.marks.star, size, size)}</span>`;
  const icon = (name, size = 20) => `<span style="display:inline-block;flex:none;line-height:0">${inline(assets.icons[name], size, size)}</span>`;
  /** 信封（动效零件 atlas-envelope 的那个按钮）：封口贴纸是柚子，写上年份。 */
  const envelope = (year) => assets.envelope
    .replace(/<!-- @include marks\/pomelo\/pomelo-([a-z]+)\.svg -->/g, (_, n) => face(n, 60))
    .replace('class="pm-env"', 'class="pm-env" data-act="open"')
    .replace(/\d{4} 年度小报/g, `${year} 年度小报`);
  return { face, mark, icon, envelope };
}

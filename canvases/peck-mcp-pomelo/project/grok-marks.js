/* grok 这一版的模块贴纸：构图自己画，画法走 Pomelo.hand.stickerSvg。 */
(function (w) {
  const H = () => w.Pomelo.hand;
  const P = (d) => H().P(d);
  const C = (x, y, r) => H().circle(x, y, r);
  const R = (x, y, ww, hh, r) => H().rrect(x, y, ww, hh, r);
  const E = (x, y, rx, ry, rot) => H().ellipse(x, y, rx, ry, rot || 0);
  const rot = (d, x, y, deg) => H().rotate(d, x, y, deg);

  function col() {
    const v = (r) => 'var(--color-' + r + ')';
    return {
      ink: v('art-ink'),
      white: v('art-white'),
      shadow: v('art-shadow'),
      blush: v('blush'),
      yellow: v('yuzu'),
      leaf: v('leaf'),
      heart: v('heart'),
      wood: v('wood'),
      cats: {
        mint: v('cat-mint'),
        sky: v('cat-sky'),
        pink: v('cat-pink'),
        orange: v('cat-orange'),
        grape: v('cat-grape'),
      },
      catLight: (c) => v('cat-' + c + '-sticker'),
    };
  }

  function shoe(cx, cy, deg, seed) {
    const sole = rot(R(cx - 6.5, cy - 12, 13, 20, 6), cx, cy, deg);
    const heel = rot(E(cx, cy + 12, 6.2, 4.6, 0), cx, cy, deg);
    const t1 = rot(C(cx - 4.2, cy - 14.8, 2.1), cx, cy, deg);
    const t2 = rot(C(cx - 0.6, cy - 16.4, 2.2), cx, cy, deg);
    const t3 = rot(C(cx + 3.2, cy - 15.2, 1.9), cx, cy, deg);
    return [
      { t: 'shape', d: sole, fill: 'cat', seed: seed },
      { t: 'shape', d: heel, fill: 'cat', sw: 0.8, seed: seed + 1 },
      { t: 'shape', d: t1, fill: 'cat', sw: 0.7, amp: 0.4, seed: seed + 2 },
      { t: 'shape', d: t2, fill: 'cat', sw: 0.7, amp: 0.4, seed: seed + 3 },
      { t: 'shape', d: t3, fill: 'cat', sw: 0.7, amp: 0.4, seed: seed + 4 },
    ];
  }

  const ARTS = {
    todo: {
      name: '一步一步', cat: 'mint',
      parts: [...shoe(20, 42, -28, 110), ...shoe(44, 24, 18, 120)],
    },
    notes: {
      name: '念念不忘', cat: 'mint',
      parts: [
        { t: 'shape', d: R(12, 10, 38, 46, 5), fill: 'catLight', seed: 201 },
        { t: 'shape', d: P('M38 10 L50 22 L38 22 Z'), fill: 'cat', seed: 202 },
        { t: 'line', d: P('M20 28 L40 28 M20 36 L36 36 M20 44 L32 44'), sw: 0.7, seed: 203 },
        { t: 'shape', d: C(22, 14, 3.4), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 204 },
        { t: 'line', d: P('M22 11 L22 6'), sw: 0.8, seed: 205 },
      ],
    },
    days: {
      name: '来日方长', cat: 'mint',
      parts: [
        { t: 'shape', d: R(10, 16, 44, 38, 7), fill: 'catLight', seed: 301 },
        { t: 'shape', d: P('M10 16 Q10 10 17 10 L47 10 Q54 10 54 16 L54 24 L10 24 Z'), fill: 'cat', seed: 302 },
        { t: 'line', d: P('M22 8 L22 18 M42 8 L42 18'), sw: 1.15, seed: 303 },
        { t: 'shape', d: C(32, 38, 8.5), fill: 'yellow', sw: 0.85, seed: 304 },
        { t: 'dot', d: C(32, 38, 2.2), seed: 305 },
      ],
    },
    finance: {
      name: '钱来钱往', cat: 'mint',
      parts: [
        { t: 'shape', d: C(20, 22, 9), fill: 'yellow', seed: 401 },
        { t: 'shape', d: C(32, 18, 9.4), fill: 'yellow', seed: 402 },
        { t: 'line', d: P('M29 13.5 L32 18 L35.2 13.8 M32 18 L32 23.4'), sw: 0.65, seed: 403 },
        { t: 'shape', d: P('M10 30 L54 30 L50 54 L14 54 Z'), fill: 'cat', seed: 404 },
        { t: 'shape', d: P('M10 30 L32 42 L54 30'), fill: 'catLight', sw: 0.85, seed: 405 },
        { t: 'line', d: P('M32 42 L32 54'), sw: 0.7, seed: 406 },
      ],
    },
    packing: {
      name: '出门走走', cat: 'mint',
      parts: [
        { t: 'shape', d: P('M16 22 Q12 22 12 28 L12 50 Q12 56 18 56 L46 56 Q52 56 52 50 L52 28 Q52 22 48 22 Z'), fill: 'cat', seed: 501 },
        { t: 'line', d: P('M22 22 L22 16 Q22 11 27 11 L37 11 Q42 11 42 16 L42 22'), sw: 1.25, seed: 502 },
        { t: 'shape', d: R(20, 32, 24, 14, 4), fill: 'catLight', sw: 0.8, seed: 503 },
        { t: 'shape', d: C(44, 36, 4.2), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 504 },
        { t: 'line', d: P('M24 22 L24 50 M40 22 L40 50'), sw: 0.7, seed: 505 },
      ],
    },
    books: {
      name: '摸鱼读读', cat: 'pink',
      parts: [
        { t: 'shape', d: rot(R(10, 28, 44, 10, 2.4), 32, 33, -12), fill: 'cat', seed: 601 },
        { t: 'shape', d: rot(R(12, 36, 42, 10, 2.4), 33, 41, 6), fill: 'catLight', seed: 602 },
        { t: 'shape', d: rot(R(11, 44, 44, 11, 2.4), 33, 50, -4), fill: 'cat', seed: 603 },
        { t: 'shape', d: P('M40 18 C46 12 54 16 52 24 C48 22 42 22 40 18 Z'), fill: 'yellow', seed: 604 },
        { t: 'line', d: P('M44 22 C40 26 38 32 40 38'), sw: 0.7, seed: 605 },
        { t: 'dot', d: C(48, 18.5, 1.4), seed: 606 },
      ],
    },
    films: {
      name: '好奇看看', cat: 'pink',
      parts: [
        { t: 'shape', d: C(28, 32, 18), fill: 'cat', seed: 701 },
        { t: 'shape', d: C(28, 32, 7.5), fill: 'white', sw: 0.8, seed: 702 },
        { t: 'shape', d: C(20, 24, 3.2), fill: 'catLight', sw: 0.7, amp: 0.4, seed: 703 },
        { t: 'shape', d: C(36, 24, 3.2), fill: 'catLight', sw: 0.7, amp: 0.4, seed: 704 },
        { t: 'shape', d: C(20, 40, 3.2), fill: 'catLight', sw: 0.7, amp: 0.4, seed: 705 },
        { t: 'shape', d: C(36, 40, 3.2), fill: 'catLight', sw: 0.7, amp: 0.4, seed: 706 },
        { t: 'shape', d: rot(R(38, 40, 18, 14, 2.5), 47, 47, 18), fill: 'yellow', seed: 707 },
        { t: 'line', d: rot(P('M42 42 L42 52 M48 42 L48 52 M54 42 L54 52'), 47, 47, 18), sw: 0.7, seed: 708 },
      ],
    },
    drawing: {
      name: '随意画画', cat: 'pink',
      parts: [
        { t: 'shape', d: P('M18 48 L26 14 L32 16 L24 50 Z'), fill: 'cat', seed: 801 },
        { t: 'shape', d: P('M26 14 L32 16 L30 8 C28 5 24 6 26 14 Z'), fill: 'yellow', sw: 0.8, amp: 0.4, seed: 802 },
        { t: 'shape', d: C(44, 40, 12), fill: 'catLight', seed: 803 },
        { t: 'shape', d: C(38, 36, 4.4), fill: 'heart', sw: 0.7, amp: 0.4, seed: 804 },
        { t: 'shape', d: C(48, 34, 3.8), fill: 'yellow', sw: 0.7, amp: 0.4, seed: 805 },
        { t: 'shape', d: C(50, 44, 4), fill: 'leaf', sw: 0.7, amp: 0.4, seed: 806 },
      ],
    },
    site: {
      name: '呦呦漫游', cat: 'pink',
      parts: [
        { t: 'shape', d: P('M12 18 L50 12 L54 48 L16 54 Z'), fill: 'catLight', seed: 901 },
        { t: 'shape', d: P('M12 18 L32 22 L16 54 Z'), fill: 'cat', sw: 0.85, seed: 902 },
        { t: 'line', d: P('M22 28 C28 34 36 32 42 26 C46 34 40 42 34 46'), sw: 0.75, seed: 903 },
        { t: 'shape', d: P('M40 22 L44 34 L36 34 Z'), fill: 'heart', sw: 0.75, amp: 0.35, seed: 904 },
        { t: 'dot', d: C(40, 20, 2.2), seed: 905 },
      ],
    },
    canvas: {
      name: '有板有眼', cat: 'pink',
      parts: [
        { t: 'shape', d: R(8, 10, 48, 38, 6), fill: 'cat', seed: 1001 },
        { t: 'shape', d: R(13, 15, 17, 12, 2.5), fill: 'white', sw: 0.75, seed: 1002 },
        { t: 'shape', d: R(34, 15, 17, 12, 2.5), fill: 'catLight', sw: 0.75, seed: 1003 },
        { t: 'shape', d: R(13, 30, 17, 12, 2.5), fill: 'catLight', sw: 0.75, seed: 1004 },
        { t: 'shape', d: R(34, 30, 17, 12, 2.5), fill: 'white', sw: 0.75, seed: 1005 },
        { t: 'shape', d: P('M40 17.5 L42.2 21.6 L46.8 22.2 L43.4 25.4 L44.2 30 L40 27.8 L35.8 30 L36.6 25.4 L33.2 22.2 L37.8 21.6 Z'), fill: 'yellow', sw: 0.65, amp: 0.35, seed: 1006 },
        { t: 'line', d: P('M22 48 L16 58 M32 48 L32 58 M42 48 L48 58'), sw: 1.05, seed: 1007 },
      ],
    },
    jobs: {
      name: '投石问路', cat: 'grape',
      parts: [
        { t: 'line', d: C(32, 40, 16), sw: 0.7, seed: 1101 },
        { t: 'line', d: C(32, 40, 10), sw: 0.65, seed: 1102 },
        { t: 'line', d: C(32, 40, 5), sw: 0.6, seed: 1103 },
        { t: 'shape', d: E(22, 18, 7.5, 5.5, -28), fill: 'cat', seed: 1104 },
        { t: 'shape', d: C(44, 16, 4.2), fill: 'yellow', sw: 0.7, amp: 0.35, seed: 1105 },
      ],
    },
    seeker: {
      name: 'Seeker', cat: 'grape',
      parts: [
        { t: 'shape', d: R(8, 12, 30, 40, 6), fill: 'cat', seed: 1201 },
        { t: 'shape', d: C(23, 26, 6.5), fill: 'yellow', sw: 0.8, seed: 1202 },
        { t: 'shape', d: P('M14 42 C14 36 18 33 23 33 C28 33 32 36 32 42 Z'), fill: 'white', sw: 0.8, amp: 0.45, seed: 1203 },
        { t: 'shape', d: C(44, 40, 11), fill: 'white', seed: 1204 },
        { t: 'shape', d: C(44, 40, 6.2), fill: 'catLight', sw: 0.75, seed: 1205 },
        { t: 'line', d: P('M51 48 L58 56'), sw: 1.45, seed: 1206 },
      ],
    },
    pomelo: {
      name: '柚子', cat: 'orange',
      parts: [
        { t: 'shape', d: P('M32 10 C46 10 54 24 52 38 C50 52 40 58 32 58 C24 58 14 52 12 38 C10 24 18 10 32 10 Z'), fill: 'yellow', seed: 1301 },
        { t: 'shape', d: P('M30 12 C34 4 44 4 46 12 C40 12 34 14 30 12 Z'), fill: 'leaf', seed: 1302 },
        { t: 'line', d: P('M38 8 L42 2'), sw: 0.85, seed: 1303 },
        { t: 'blush', d: C(20, 40, 4.2), seed: 1304 },
        { t: 'blush', d: C(44, 40, 4.2), seed: 1305 },
        { t: 'dot', d: C(24, 34, 2.1), seed: 1306 },
        { t: 'dot', d: C(40, 34, 2.1), seed: 1307 },
        { t: 'line', d: P('M26 44 Q32 48 38 44'), sw: 0.7, seed: 1308 },
      ],
    },
  };

  let seq = 0;
  function sticker(id, size) {
    const art = ARTS[id];
    if (!art) throw new Error('没有贴纸 ' + id);
    seq += 1;
    return H().stickerSvg(art, w.Pomelo.params.sticker, col(), { size: size, idp: 'gk' + seq });
  }

  function fill(root) {
    root.querySelectorAll('[data-mark]').forEach((el) => {
      const id = el.getAttribute('data-mark');
      const size = Number(el.getAttribute('data-size') || 96);
      el.innerHTML = sticker(id, size);
    });
  }

  w.GrokMarks = { ARTS, sticker, fill, col };
})(window);

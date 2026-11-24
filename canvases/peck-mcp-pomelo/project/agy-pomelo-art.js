(function () {
  'use strict';

  function buildArt(H) {
    const { P, circle, ellipse, rrect, rotate } = H;

    function leftFoot(seed) {
      const cx = 19, cy = 42, rot = -16;
      const parts = [
        {
          t: 'shape',
          d: rotate(P('M13.5 35 C12.5 30 15.5 26.5 19.5 26.5 C23.5 26.5 25.5 30.5 24.5 35.5 C23.8 39.5 24.5 44 23.2 48.5 C22 52 19 54 16 53 C13.2 52 13 48 14 43.5 C14.5 40.5 13.8 38 13.5 35 Z'), cx, cy, rot),
          fill: 'cat',
          seed
        }
      ];
      const toes = [[-5.2, -18.2, 2.5], [-1.5, -20.2, 2.3], [2.2, -19.5, 2.0], [5.4, -17.0, 1.7]];
      toes.forEach(([dx, dy, r], i) => {
        parts.push({
          t: 'shape',
          d: rotate(circle(cx + dx, cy + dy, r), cx, cy, rot),
          fill: 'cat',
          sw: 0.76,
          amp: 0.4,
          seed: seed + i + 1
        });
      });
      return parts;
    }

    function rightFoot(seed) {
      const cx = 44, cy = 27, rot = 14;
      const parts = [
        {
          t: 'shape',
          d: rotate(P('M38.5 20 C37.5 15 40.5 11.5 44.5 11.5 C48.5 11.5 50.5 15.5 49.5 20.5 C48.8 24.5 49.5 29 48.2 33.5 C47 37 44 39 41 38 C38.2 37 38 33 39 28.5 C39.5 25.5 38.8 23 38.5 20 Z'), cx, cy, rot),
          fill: 'cat',
          seed
        }
      ];
      const toes = [[-5.0, -17.8, 2.4], [-1.3, -19.8, 2.2], [2.3, -19.2, 1.95], [5.3, -16.8, 1.65]];
      toes.forEach(([dx, dy, r], i) => {
        parts.push({
          t: 'shape',
          d: rotate(circle(cx + dx, cy + dy, r), cx, cy, rot),
          fill: 'cat',
          sw: 0.76,
          amp: 0.4,
          seed: seed + i + 1
        });
      });
      return parts;
    }

    return {
      todo: {
        name: '一步一步',
        cat: 'mint',
        parts: [
          ...leftFoot(110),
          ...rightFoot(120),
          {
            t: 'shape',
            d: P('M35 44 L36.8 48 L41 48.6 L37.9 51.4 L38.7 55.5 L35 53.4 L31.3 55.5 L32.1 51.4 L29 48.6 L33.2 48 Z'),
            fill: 'yellow',
            sw: 0.75,
            amp: 0.35,
            seed: 130
          }
        ]
      },
      notes: {
        name: '念念不忘',
        cat: 'mint',
        parts: [
          { t: 'shape', d: rotate(rrect(8, 25, 27, 28, 5), 21.5, 39, -7), fill: 'catLight', sw: 0.85, seed: 210 },
          { t: 'line', d: P('M13 34 L27 32.5 M14 40.5 L25 39.2 M14.5 47 L22 46'), sw: 0.68, seed: 211 },
          { t: 'shape', d: P('M54 8 C41 10 27 21 22 40 L26 44 C41 40 52 26 54 8 Z'), fill: 'cat', seed: 212 },
          { t: 'line', d: P('M35 27 L29 23 M43 19 L37 15'), sw: 0.68, seed: 213 },
          { t: 'line', d: P('M53 9 C43 21 32 34 15 53'), sw: 0.92, seed: 214 },
          { t: 'shape', d: circle(13.5, 55, 3.1), fill: 'yellow', sw: 0.75, seed: 215 }
        ]
      },
      days: {
        name: '来日方长',
        cat: 'mint',
        parts: [
          { t: 'shape', d: rrect(8, 14, 48, 42, 8.5), fill: 'catLight', seed: 310 },
          { t: 'shape', d: P('M8 22.5 Q8 14 16.5 14 L47.5 14 Q56 14 56 22.5 L56 27.5 L8 27.5 Z'), fill: 'cat', seed: 311 },
          { t: 'shape', d: rrect(17.5, 8.5, 5.2, 10, 2.5), fill: 'yellow', sw: 0.82, seed: 312 },
          { t: 'shape', d: rrect(41.3, 8.5, 5.2, 10, 2.5), fill: 'yellow', sw: 0.82, seed: 313 },
          {
            t: 'shape',
            d: P('M32 50.5 C23.8 45.2 20.5 40.8 20.5 37 C20.5 33.4 23.4 31.2 26.5 31.2 C28.9 31.2 30.8 32.7 32 34.8 C33.2 32.7 35.1 31.2 37.5 31.2 C40.6 31.2 43.5 33.4 43.5 37 C43.5 40.8 40.2 45.2 32 50.5 Z'),
            fill: 'heart',
            seed: 314
          },
          { t: 'dot', d: circle(15, 35, 1.5), seed: 315 },
          { t: 'dot', d: circle(49, 47, 1.5), seed: 316 }
        ]
      },
      finance: {
        name: '钱来钱往',
        cat: 'mint',
        parts: [
          { t: 'shape', d: circle(24, 16.5, 9), fill: 'catLight', sw: 0.85, seed: 410 },
          { t: 'shape', d: circle(41.5, 16.5, 9.8), fill: 'yellow', seed: 411 },
          { t: 'line', d: P('M38.2 12.2 L41.5 16.5 L44.8 12.2 M41.5 16.5 L41.5 21.8 M38.5 18 L44.5 18'), sw: 0.72, seed: 412 },
          { t: 'shape', d: rrect(7, 23, 49, 32, 8.5), fill: 'cat', seed: 413 },
          { t: 'line', d: P('M8.5 31 C21 32.5 34 32.5 43 31'), sw: 0.75, seed: 414 },
          { t: 'shape', d: rrect(40, 33.5, 17.5, 11.5, 5), fill: 'yellow', sw: 0.88, seed: 415 },
          { t: 'dot', d: circle(47.5, 39.2, 2.1), seed: 416 }
        ]
      },
      packing: {
        name: '出门走走',
        cat: 'mint',
        parts: [
          { t: 'line', d: P('M23.5 21.5 L23.5 13.5 Q23.5 9.5 28 9.5 L36 9.5 Q40.5 9.5 40.5 13.5 L40.5 21.5'), sw: 1.45, seed: 510 },
          { t: 'shape', d: circle(17.5, 55.5, 2.7), fill: 'white', sw: 0.8, seed: 511 },
          { t: 'shape', d: circle(46.5, 55.5, 2.7), fill: 'white', sw: 0.8, seed: 512 },
          { t: 'shape', d: rrect(8.5, 20.5, 47, 33.5, 7.5), fill: 'cat', seed: 513 },
          { t: 'shape', d: rrect(17, 20.5, 5, 33.5, 1.8), fill: 'catLight', sw: 0.75, seed: 514 },
          { t: 'shape', d: rrect(42, 20.5, 5, 33.5, 1.8), fill: 'catLight', sw: 0.75, seed: 515 },
          {
            t: 'shape',
            d: P('M32 30.5 L34.3 35.3 L39.5 36.1 L35.7 39.8 L36.6 45 L32 42.5 L27.4 45 L28.3 39.8 L24.5 36.1 L29.7 35.3 Z'),
            fill: 'yellow',
            sw: 0.76,
            amp: 0.35,
            seed: 516
          }
        ]
      },
      books: {
        name: '摸鱼读读',
        cat: 'pink',
        parts: [
          { t: 'shape', d: P('M32 22 C25.5 17.5 16.5 16.5 8.5 19.5 L8.5 51.5 C16.5 48.5 25.5 49.5 32 54 Z'), fill: 'cat', seed: 610 },
          { t: 'shape', d: P('M32 22 C38.5 17.5 47.5 16.5 55.5 19.5 L55.5 51.5 C47.5 48.5 38.5 49.5 32 54 Z'), fill: 'catLight', seed: 611 },
          { t: 'line', d: P('M32 22.5 L32 53.5'), sw: 0.82, seed: 612 },
          { t: 'line', d: P('M13.5 28.5 C18 27.2 22.5 27.5 27 29.2 M13.5 35.5 C18 34.2 22.5 34.5 27 36.2 M37 29.2 C41.5 27.5 46 27.2 50.5 28.5 M37 36.2 C41.5 34.5 46 34.2 50.5 35.5'), sw: 0.68, seed: 613 },
          { t: 'shape', d: P('M35.5 11.8 C40 6.8 48.5 6.5 54.5 11.2 C48.5 16 40 16.2 35.5 11.8 Z'), fill: 'yellow', seed: 614 },
          { t: 'shape', d: P('M36.5 11.8 L29.5 6.5 L30.2 17 Z'), fill: 'yellow', sw: 0.84, seed: 615 },
          { t: 'dot', d: circle(49.5, 10.6, 1.35), seed: 616 }
        ]
      },
      films: {
        name: '好奇看看',
        cat: 'pink',
        parts: [
          { t: 'shape', d: rrect(8.5, 26.5, 47, 29.5, 6.5), fill: 'cat', seed: 710 },
          { t: 'line', d: P('M10 33.2 L54 33.2'), sw: 0.72, seed: 711 },
          { t: 'shape', d: rotate(rrect(8, 14.5, 47.5, 10, 3.2), 9, 24.5, -11), fill: 'yellow', seed: 712 },
          { t: 'line', d: rotate(P('M17.5 15 L21.5 24 M29 15 L33 24 M40.5 15 L44.5 24'), 9, 24.5, -11), sw: 0.82, seed: 713 },
          { t: 'shape', d: P('M26.5 36 L40.5 43 L26.5 50 Z'), fill: 'white', sw: 0.82, amp: 0.4, seed: 714 }
        ]
      },
      drawing: {
        name: '随意画画',
        cat: 'pink',
        parts: [
          {
            t: 'shape',
            d: P('M30.5 8.8 C45.5 8.8 56.5 18.5 56.5 30.8 C56.5 38.5 50.5 40.8 45.5 38.8 C40.5 36.8 36.8 39.8 38.8 45.8 C40.8 51.8 36.8 56 29.8 56 C16.8 56 7.2 45.2 7.2 32.2 C7.2 19.2 16.8 8.8 30.5 8.8 Z'),
            fill: 'cat',
            seed: 810
          },
          { t: 'shape', d: circle(18.5, 25.5, 4.5), fill: 'yellow', sw: 0.75, amp: 0.4, seed: 811 },
          { t: 'shape', d: circle(30.8, 18.2, 4.2), fill: 'heart', sw: 0.75, amp: 0.4, seed: 812 },
          { t: 'shape', d: circle(43.8, 22.2, 4.0), fill: 'white', sw: 0.75, amp: 0.4, seed: 813 },
          { t: 'shape', d: circle(17.5, 39.8, 4.3), fill: 'leaf', sw: 0.75, amp: 0.4, seed: 814 },
          { t: 'shape', d: ellipse(29.5, 46.5, 3.3, 2.5, -12), fill: 'white', sw: 0.75, seed: 815 }
        ]
      },
      site: {
        name: '呦呦漫游',
        cat: 'pink',
        parts: [
          { t: 'line', d: circle(32, 9.2, 3.8), sw: 0.92, seed: 910 },
          { t: 'shape', d: circle(32, 35, 21.2), fill: 'cat', seed: 911 },
          { t: 'shape', d: circle(32, 35, 14.8), fill: 'white', sw: 0.82, seed: 912 },
          { t: 'line', d: P('M32 21 L32 23.2 M32 46.8 L32 49 M18 35 L20.2 35 M43.8 35 L46 35'), sw: 0.65, seed: 913 },
          { t: 'shape', d: rotate(P('M32 21.8 L36.8 35 L27.2 35 Z'), 32, 35, 20), fill: 'heart', sw: 0.75, amp: 0.35, seed: 914 },
          { t: 'shape', d: rotate(P('M32 48.2 L36.8 35 L27.2 35 Z'), 32, 35, 20), fill: 'yellow', sw: 0.75, amp: 0.35, seed: 915 },
          { t: 'dot', d: circle(32, 35, 2.0), seed: 916 }
        ]
      },
      canvas: {
        name: '有板有眼',
        cat: 'pink',
        parts: [
          { t: 'line', d: P('M23.5 42.5 L14.5 58 M40.5 42.5 L49.5 58 M32 44 L32 55.5'), sw: 1.12, seed: 1010 },
          { t: 'shape', d: rrect(7, 7.5, 50, 36.5, 6), fill: 'cat', seed: 1011 },
          { t: 'shape', d: rrect(12.8, 13.2, 38.4, 25, 3), fill: 'white', sw: 0.8, seed: 1012 },
          { t: 'shape', d: P('M14.5 36.2 L24.5 24.5 L31 30.8 L36.8 25.5 L49.5 36.2 Z'), fill: 'catLight', sw: 0.75, amp: 0.42, seed: 1013 },
          { t: 'shape', d: circle(42.5, 19.8, 3.6), fill: 'yellow', sw: 0.72, amp: 0.35, seed: 1014 }
        ]
      },
      jobs: {
        name: '投石问路',
        cat: 'grape',
        parts: [
          { t: 'line', d: P('M23 21 L23 14.5 Q23 10.5 27.5 10.5 L36.5 10.5 Q41 10.5 41 14.5 L41 21'), sw: 1.38, seed: 1110 },
          { t: 'shape', d: rrect(8, 20, 48, 34, 7.5), fill: 'cat', seed: 1111 },
          { t: 'line', d: P('M9 32.5 C22 36.2 42 36.2 55 32.5'), sw: 0.76, seed: 1112 },
          { t: 'shape', d: rrect(27.2, 29.5, 9.6, 8.2, 2.5), fill: 'yellow', sw: 0.82, seed: 1113 }
        ]
      },
      seeker: {
        name: 'Seeker',
        cat: 'grape',
        parts: [
          { t: 'shape', d: rrect(8.5, 7.5, 37, 49, 7), fill: 'cat', seed: 1210 },
          { t: 'shape', d: circle(27, 21.5, 6.8), fill: 'yellow', sw: 0.85, seed: 1211 },
          { t: 'shape', d: P('M16 41.5 C16 34.5 20.8 31.2 27 31.2 C33.2 31.2 38 34.5 38 41.5 Z'), fill: 'white', sw: 0.84, amp: 0.45, seed: 1212 },
          { t: 'line', d: P('M15.5 48.5 L31 48.5'), sw: 0.75, seed: 1213 },
          { t: 'shape', d: circle(44.5, 43.5, 9.2), fill: 'white', seed: 1214 },
          { t: 'line', d: P('M51 50.5 L57 56.8'), sw: 1.45, seed: 1215 }
        ]
      },
      yuzu: {
        name: '柚子',
        cat: 'orange',
        parts: [
          { t: 'line', d: P('M31.5 14.5 L30.8 9'), sw: 1.0, seed: 1310 },
          { t: 'shape', d: P('M33 15 C36 9 43 6 48 6.5 C47.5 12 42 16 33 15 Z'), fill: 'leaf', sw: 0.88, seed: 1311 },
          {
            t: 'shape',
            d: P('M32 14.5 C40 14.5 45 19.5 48.5 25 C53.5 31 56 37.5 55.5 44 C55 51.5 46.5 56.5 32 56.5 C17.5 56.5 9 51.5 8.5 44 C8 37.5 10.5 31 15.5 25 C19 19.5 24 14.5 32 14.5 Z'),
            fill: 'yellow',
            seed: 1312
          },
          { t: 'blush', d: ellipse(20, 44.5, 3.8, 2.3), seed: 1313 },
          { t: 'blush', d: ellipse(44, 44.5, 3.8, 2.3), seed: 1314 },
          { t: 'dot', d: circle(25.2, 39.5, 2.2), seed: 1315 },
          { t: 'dot', d: circle(38.8, 39.5, 2.2), seed: 1316 },
          { t: 'line', d: P('M29 44.8 Q32 47.2 35 44.8'), sw: 0.85, seed: 1317 }
        ]
      }
    };
  }

  function makeCol() {
    return {
      ink: 'var(--color-art-ink)',
      white: 'var(--color-art-white)',
      shadow: 'var(--color-art-shadow)',
      blush: 'var(--color-blush)',
      yellow: 'var(--color-yuzu)',
      heart: 'var(--color-heart)',
      leaf: 'var(--color-leaf)',
      wood: 'var(--color-wood)',
      cats: {
        mint: 'var(--color-cat-mint)',
        sky: 'var(--color-cat-sky)',
        pink: 'var(--color-cat-pink)',
        orange: 'var(--color-cat-orange)',
        grape: 'var(--color-cat-grape)'
      },
      catLight: function (c) {
        return 'var(--color-cat-' + c + '-sticker)';
      }
    };
  }

  function renderStickers(root) {
    if (!window.Pomelo || !window.Pomelo.hand) return;
    const H = window.Pomelo.hand;
    const st = window.Pomelo.params.sticker;
    const col = makeCol();
    const map = buildArt(H);
    const nodes = (root || document).querySelectorAll('[data-pm-sticker]');
    nodes.forEach(function (el, idx) {
      const id = el.getAttribute('data-pm-sticker');
      const size = Number(el.getAttribute('data-pm-size') || 64);
      const art = map[id];
      if (!art) return;
      const sig = id + ':' + size;
      if (el.getAttribute('data-pm-rendered') === sig) return;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.display = 'inline-flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = H.stickerSvg(art, st, col, { size: size, idp: 'pms-' + id + '-' + idx });
      el.setAttribute('data-pm-rendered', sig);
    });
  }

  window.PomeloArt = {
    renderStickers: renderStickers
  };
})();

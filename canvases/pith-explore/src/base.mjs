// R1 的 App 板的底层样式（颜色、字、阴影都走 schemes/pith 的 token，见 scheme.mjs 的 ALIAS_CSS）。原注：EX7（页 id ex8）花园笔记的底层样式：从 EX6 的 A 原样搬过来（配色、字、对话、页边注、交付卡、⌘K），app.mjs 在上面叠这一轮改的。
export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,300..500&amp;family=Noto+Serif+SC:wght@200..900&amp;family=Lato:wght@400;700&amp;family=Noto+Sans+SC:wght@400;500&amp;display=swap">
`;

export const BASE_CSS = `
.dA{--serif:var(--font-serif);--sans:var(--font-sans);--sh-sm:var(--shadow-sm);--sh-lg:var(--shadow-lg);--out:cubic-bezier(.23,1,.32,1);--spring:cubic-bezier(.34,1.36,.64,1);
background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.5}
.dA .stg{width:20px;height:20px;fill:var(--sea);color:var(--sea);flex:none}
/* 顶栏 */
.a-top{position:absolute;left:0;right:0;top:0;height:68px;display:flex;align-items:center;padding:0 28px 0 92px;z-index:20;border-bottom:1px solid var(--line)}
.a-brand{display:flex;align-items:center;gap:8px;font:600 24px/1 var(--serif);letter-spacing:-.01em;color:var(--ink)}
.a-brand svg{width:28px;height:28px}
.a-nav{margin-left:auto;display:flex;gap:28px}
.a-nav button{position:relative;font:400 15px/1 var(--sans);color:var(--ink2);padding:6px 0;transition:color .18s}
.a-nav button:hover{color:var(--ink)}
.a-nav button.is-on{color:var(--ink);font-weight:700}
.a-nav button.is-on::after{content:"";position:absolute;left:50%;bottom:-5px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--sea)}
.a-search{margin-left:28px;display:flex;align-items:center;gap:10px;height:34px;min-width:190px;padding:0 8px 0 12px;border:1px solid var(--line2);border-radius:.4rem;background:var(--bg);color:var(--faint);font-size:13px;transition:background .2s}
.a-search:hover{background:var(--white)}
.a-search kbd{margin-left:auto;padding:2px 6px;border-radius:4px;background:var(--tint);font:700 11px/1.3 var(--sans);color:var(--ink2)}
/* 对话页：左边一列对话 */
.a-side{position:absolute;left:0;top:68px;bottom:0;width:256px;padding:20px 14px 20px 22px;border-right:1px solid var(--line);overflow:hidden}
.a-new{display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 10px;border-radius:.4rem;font:700 14px/1 var(--sans);color:var(--sea-t)}
.a-new:hover{background:var(--tint)}
.a-new kbd{font:400 11px/1 var(--sans);color:var(--faint)}
.a-grp{margin:18px 0 6px 10px;font:700 11.5px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.a-chat{display:grid;grid-template-columns:22px 1fr;column-gap:8px;width:100%;padding:8px 10px;border-radius:.4rem;text-align:left;transition:background .2s}
.a-chat .stg{width:18px;height:18px;margin-top:2px}
.a-chat b{font:400 15px/1.35 var(--serif);color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.a-chat span{grid-column:2;margin-top:3px;font-size:12px;color:var(--faint)}
.a-chat:hover{background:var(--tint)}
.a-chat.is-on{background:var(--card);box-shadow:var(--sh-sm),inset 2px 0 0 var(--sea)}
/* 首页 */
.a-home{position:absolute;left:330px;width:860px;top:150px}
.a-count{font:400 18px/1 var(--serif);color:var(--sea-t);margin-bottom:10px}
.a-h1{font:600 60px/1.08 var(--serif);letter-spacing:-.015em}
.a-sub{margin-top:16px;font:300 24px/1.4 var(--serif);color:var(--muted)}
.a-seeds{position:absolute;left:330px;width:860px;top:560px;display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.a-seeds h3{grid-column:1/-1;display:flex;align-items:center;gap:12px;font:400 13px/1 var(--sans);letter-spacing:.06em;text-transform:uppercase}
.a-seeds h3::after{content:"";width:1.5px;height:13px;background:var(--sea)}
.a-seed{display:grid;grid-template-columns:28px 1fr;column-gap:10px;text-align:left}
.a-seed b{font:400 19px/1.3 var(--serif)}
.a-seed span{grid-column:2;margin-top:6px;font-size:13px;color:var(--faint)}
.a-seed:hover b{color:var(--sea-t)}
/* 输入框 */
.a-comp{position:absolute;z-index:15;display:flex;align-items:center;gap:8px;height:56px;padding:0 10px 0 18px;border:1px solid var(--line2);border-radius:.4rem;background:var(--card);box-shadow:var(--sh-sm);transition:left .6s var(--out),top .6s var(--out),width .6s var(--out),box-shadow .2s}
.a-comp.is-home{left:330px;top:430px;width:860px}
.a-comp.is-thread{left:330px;top:722px;width:620px}
.a-comp:hover{box-shadow:var(--sh-lg)}
.a-field{flex:1;min-width:0;display:flex;align-items:center;gap:8px;height:100%;text-align:left;font:400 17px/1 var(--serif);color:var(--ink);overflow:hidden;white-space:nowrap}
.a-field .ph{color:var(--faint)}
.a-chip{flex:none;padding:4px 10px;border-radius:3rem;background:var(--tint);font:400 13px/1 var(--sans);color:var(--crim)}
.a-sig{display:flex;gap:2px}
.a-sig button{width:30px;height:30px;border-radius:.3rem;font:400 15px/1 var(--sans);color:var(--muted)}
.a-sig button:hover,.a-sig button.is-open{background:var(--tint);color:var(--ink)}
.a-send{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;color:var(--faint);transition:background .2s,color .2s,transform .3s var(--spring)}
.a-send svg{width:17px;height:17px}
.a-comp.is-ready .a-send{background:var(--sea);color:#fff;transform:scale(1.06)}
.a-named{position:absolute;left:0;top:-28px;font:400 13px/1 var(--sans);color:var(--sea-t)}
.a-named button{margin-left:6px;color:var(--faint)}
.a-menu{position:absolute;right:10px;bottom:62px;z-index:25;min-width:250px;padding:6px;border:1px solid var(--line);border-radius:.4rem;background:var(--white);box-shadow:0 4px 14px #0000000f;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .16s ease-out,transform .16s ease-out}
.a-menu.is-open{opacity:1;pointer-events:auto;transform:none}
.a-menu p{padding:6px 10px 8px;font-size:12px;color:var(--faint);border-bottom:1px solid var(--line);margin-bottom:4px}
.a-menu button{width:100%;display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:.2rem;font-size:14px;color:var(--ink2)}
.a-menu button:hover{background:var(--bg)}
.a-menu .k{width:52px;font-size:13px;color:var(--sea-t)}
.a-menu .ck{width:14px;height:14px;border:1px solid var(--line2);border-radius:3px;background:var(--white)}
.a-menu .is-on .ck{background:var(--sea);border-color:var(--sea)}
.a-menu .av{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:600 12px/1 var(--serif);background:var(--tint);color:var(--crim)}
/* 一篇对话：正文 620，右边是页边 */
.a-thread{position:absolute;left:330px;width:930px;top:68px;height:640px}
.a-art{width:620px;padding:28px 0 30px}
.a-kick{display:flex;align-items:center;gap:10px;font:700 12.5px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase}
.a-kick .stg{width:17px;height:17px}
.a-kick .crim{color:var(--crim)}
.a-kick span:last-child{color:var(--ink2)}
.a-title{margin-top:14px;font:600 34px/1.22 var(--serif);letter-spacing:-.01em}
.a-meta{display:flex;align-items:flex-start;justify-content:space-between;margin-top:20px;padding-top:12px;border-top:1px solid var(--line2);font-size:13.5px}
.a-meta .tags{display:flex;gap:12px;color:var(--crim)}
.a-meta p{text-align:right;color:var(--faint);line-height:1.6}
.a-status{display:flex;flex-wrap:wrap;gap:4px 16px;margin:18px 0 4px;font-size:13px;color:var(--faint)}
.a-status span{display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .3s}
.a-status span::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--sea)}
.a-status .is-run{opacity:1;color:var(--ink2)}.a-status .is-run::before{animation:a-pulse 1s ease-in-out infinite}
.a-status .is-done{opacity:1}.a-status .is-done::before{background:var(--line2)}
@keyframes a-pulse{50%{transform:scale(1.7);opacity:.4}}
.a-p{position:relative;margin-top:16px;font:400 17px/1.9 var(--serif)}
.a-p.cap::first-letter{float:left;margin:8px 10px 0 0;font:600 58px/.9 var(--serif)}
.a-ask{margin-top:18px;padding:2px 0 2px 18px;border-left:2px solid var(--crim);font:italic 400 18px/1.75 var(--serif);color:var(--ink2)}
.a-ref{position:relative;top:-.55em;margin-left:2px;padding:0 3px;border-radius:3px;font:700 11.5px/1 var(--sans);color:var(--sea-t);transition:background .15s,color .15s}
.a-ref:hover{background:color-mix(in srgb,var(--sea) 20%,transparent)}
.a-ref.is-on{background:var(--sea);color:#fff}
/* 页边注：跟着段落，写在正文右边 */
.a-sn{position:absolute;left:650px;top:4px;width:270px;padding-left:14px;border-left:1.5px solid var(--sea);opacity:0;pointer-events:none;transform:translateX(-8px);transition:opacity .22s var(--out),transform .3s var(--out)}
.a-sn.is-on{opacity:1;pointer-events:auto;transform:none}
.a-sn .h{display:flex;align-items:center;gap:8px;font:700 11.5px/1 var(--sans);letter-spacing:.06em;color:var(--crim)}
.a-sn .h i{display:grid;place-items:center;width:18px;height:18px;border-radius:3px;background:var(--sea);color:#fff;font-style:normal;letter-spacing:0}
.a-sn b{display:block;margin-top:8px;font:400 17px/1.3 var(--serif)}
.a-sn .loc{display:block;margin-top:2px;font-size:12.5px;color:var(--faint)}
.a-sn q{display:block;margin-top:8px;font:italic 400 15px/1.6 var(--serif);color:var(--ink2);quotes:none}
.a-sn .go{display:flex;gap:14px;margin-top:10px}
.a-sn .go button{font:700 12.5px/1 var(--sans);color:var(--sea-t)}
.a-sn .go button:hover{text-decoration:underline;text-underline-offset:3px}
/* 交付卡 */
.a-card{margin-top:26px;display:grid;grid-template-columns:36px 1fr auto;column-gap:12px;align-items:start;padding:20px 22px;border:1px solid var(--line);border-radius:.4rem;background:var(--card);box-shadow:var(--sh-sm)}
.a-grow{position:relative;width:30px;height:30px}
.a-grow .stg{position:absolute;inset:0;width:30px;height:30px;transition:opacity .4s,transform .6s var(--spring)}
.a-grow .g2{opacity:0;transform:scale(.4) translateY(6px)}
.a-card.is-saved .g1{opacity:0;transform:scale(.6)}
.a-card.is-saved .g2{opacity:1;transform:none}
.a-card b{display:block;font:400 22px/1.25 var(--serif)}
.a-card .d{margin-top:6px;font-size:14px;color:var(--muted);line-height:1.6}
.a-card .m{margin-top:8px;font-size:13px;color:var(--faint)}
.a-card .act{align-self:center;font:700 14px/1 var(--sans);color:var(--sea-t);white-space:nowrap}
.a-card .act:hover{text-decoration:underline;text-underline-offset:3px}
.a-card .ok{align-self:center;font-size:13.5px;color:var(--ink2);text-align:right;line-height:1.5}
/* 审稿人的回应 */
.a-rev{margin-top:32px;padding-top:18px;border-top:1px solid var(--line2)}
.a-rev h4{font:700 12.5px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--faint)}
.a-you{margin-top:12px;font-size:14px;color:var(--faint)}
.a-you b{color:var(--crim);font-weight:400}
.a-who{display:flex;align-items:center;gap:10px;margin-top:14px}
.a-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:600 14px/1 var(--serif);background:color-mix(in srgb,var(--crim) 18%,var(--bg));color:var(--crim)}
.a-who b{font:700 14px/1 var(--sans)}
.a-who span{font-size:13px;color:var(--faint)}
.a-q{margin-top:16px;padding:16px 18px;border-radius:.4rem;background:var(--tint)}
.a-q p{font:400 17px/1.5 var(--serif)}
.a-q .opts{display:flex;gap:8px;margin-top:12px}
.a-q button{height:32px;padding:0 14px;border-radius:3rem;font-size:14px;border:1px solid var(--line2);background:var(--card)}
.a-q button.go{background:var(--sea);border-color:var(--sea);color:#fff}
.a-q .rec{margin-left:6px;font-size:12px;opacity:.85}
.a-done{margin-top:14px;font-size:14px;color:var(--ink2)}
.a-done button{margin-left:8px;color:var(--sea-t);font-weight:700}
/* 知识库：花园的卡片墙 */
.a-gard{position:absolute;left:92px;right:92px;top:92px;bottom:0}
.a-gard .a-h1{font-size:52px}
.a-gard .a-sub{margin-top:8px;font-size:21px}
.a-topics{display:flex;align-items:center;gap:6px;margin-top:24px;font-size:14px}
.a-topics .lab{display:flex;align-items:center;gap:12px;margin-right:10px;letter-spacing:.06em;text-transform:uppercase;font-size:13px}
.a-topics .lab::after{content:"";width:1.5px;height:13px;background:var(--sea)}
.a-topics button{padding:6px 12px;border-radius:3rem;color:var(--ink2);transition:all .4s}
.a-topics button:hover{background:var(--tint);color:var(--ink)}
.a-topics button.is-on{background:var(--sea);color:#fff}
.a-topics .sel{margin-left:auto;display:flex;gap:6px}
.a-topics .sel span{display:flex;align-items:center;justify-content:space-between;min-width:160px;height:32px;padding:0 12px;border:1px solid var(--line2);border-radius:.4rem;font-size:13px;color:var(--ink2)}
.a-wall{margin-top:22px;columns:4;column-gap:20px}
.a-g{break-inside:avoid;display:block;width:100%;margin-bottom:18px;text-align:left;animation:a-up .6s var(--out) both;animation-delay:calc(var(--i) * 60ms);transition:transform .24s var(--out)}
@keyframes a-up{from{opacity:0;transform:translateY(14px)}}
.a-g:hover{transform:translateY(-3px)}
.a-g .cv{display:flex;flex-direction:column;justify-content:space-between;height:150px;padding:16px;border-radius:.4rem .4rem 0 0;color:#fff}
.a-g .cv b{font:500 19px/1.2 var(--serif)}
.a-g .cv span{font:700 10.5px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;opacity:.85}
.a-g .bd{padding:14px 16px 16px;border:1px solid var(--line);border-top:0;border-radius:0 0 .4rem .4rem;background:var(--card)}
.a-g.cover{box-shadow:var(--sh-sm)}
.a-g .row{display:grid;grid-template-columns:26px 1fr;column-gap:8px}
.a-g .t{font:400 18px/1.3 var(--serif);color:var(--ink)}
.a-g .s{grid-column:2;margin-top:5px;font-size:13px;color:var(--muted);line-height:1.5}
.a-g .m{grid-column:2;margin-top:5px;font-size:12.5px;color:var(--faint)}
.a-g.quote{padding:18px 18px 16px;border-radius:.4rem;background:var(--card);border:1px solid var(--line)}
.a-g.quote q{display:block;font:italic 400 16px/1.6 var(--serif);color:var(--ink2);quotes:none}
.a-g.quote q::before{content:"“";display:block;height:26px;font:600 44px/1 var(--serif);color:var(--sea)}
.a-g.quote .m{margin-top:10px;display:block}
.a-g.is-on .t,.a-g.is-on .cv b{text-decoration:underline;text-decoration-color:var(--sea);text-underline-offset:4px}
.a-drawer{position:absolute;right:0;top:68px;bottom:0;width:420px;z-index:18;padding:30px 32px;background:var(--white);box-shadow:var(--sh-lg);animation:a-in .38s var(--out) both}
@keyframes a-in{from{transform:translateX(40px);opacity:0}}
.a-drawer .k{display:flex;align-items:center;gap:8px;font:700 12px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--crim)}
.a-drawer .k .stg{width:18px;height:18px}
.a-drawer .k span:last-child{color:var(--ink2)}
.a-drawer .x{position:absolute;right:18px;top:16px;font-size:20px;color:var(--faint)}
.a-drawer h2{margin-top:14px;font:600 28px/1.2 var(--serif)}
.a-drawer .s{margin-top:8px;font-size:14px;color:var(--faint)}
.a-drawer .t{margin-top:18px;font:400 17px/1.8 var(--serif);color:var(--ink2)}
.a-drawer dl{display:grid;grid-template-columns:110px 1fr;row-gap:10px;margin-top:22px;padding-top:16px;border-top:1px solid var(--line);font-size:14px}
.a-drawer dt{color:var(--faint)}
.a-drawer dd{color:var(--ink2)}
.a-drawer dd.lk{color:var(--sea-t)}
/* 文献库：书封墙 */
.a-lib{position:absolute;left:92px;right:92px;top:92px;bottom:0}
.a-lib .a-h1{font-size:52px}
.a-lib .a-sub{margin-top:8px;font-size:21px}
.a-shelf{margin-top:28px;display:grid;grid-template-columns:repeat(7,1fr);gap:22px}
.a-book{display:flex;flex-direction:column;gap:10px;text-align:left;animation:a-up .6s var(--out) both;animation-delay:calc(var(--i) * 60ms)}
.a-book .cv{aspect-ratio:2/3;display:flex;flex-direction:column;justify-content:space-between;padding:14px 12px;border-radius:2px 5px 5px 2px;color:#fff;box-shadow:inset 4px 0 0 #00000022,var(--sh-sm);transition:transform .3s var(--out),box-shadow .3s}
.a-book .cv b{font:500 15px/1.2 var(--serif)}
.a-book .cv span{font:700 9.5px/1.3 var(--sans);letter-spacing:.1em;text-transform:uppercase;opacity:.85}
.a-book:hover .cv{transform:translateY(-4px)}
.a-book.is-on .cv{box-shadow:inset 4px 0 0 #00000022,0 0 0 2px var(--bg),0 0 0 3.5px var(--ink)}
.a-book .t{font:400 14px/1.3 var(--serif);color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.a-book .y{font-size:12px;color:var(--faint)}
.a-book .new{margin-left:6px;padding:1px 6px;border-radius:3rem;background:var(--sea);color:#fff;font:700 10px/1.4 var(--sans)}
.a-libd{margin-top:30px;display:grid;grid-template-columns:1fr 1fr;column-gap:48px;padding-top:22px;border-top:1px solid var(--line2)}
.a-libd .k{font:700 12px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--crim)}
.a-libd h2{margin-top:10px;font:600 26px/1.2 var(--serif)}
.a-libd .by{margin-top:8px;font-size:15px;color:var(--ink2)}
.a-libd .v{margin-top:4px;font-size:14px;color:var(--faint)}
.a-libd dl{display:grid;grid-template-columns:120px 1fr;row-gap:10px;font-size:14px;align-self:start}
.a-libd dt{color:var(--faint)}
.a-libd dd{color:var(--ink2)}
.a-libd dd.lk{color:var(--sea-t)}
/* 设置 › 角色 */
.a-set{position:absolute;left:0;right:0;top:68px;bottom:0;display:grid;grid-template-columns:256px 1fr}
.a-snav{padding:28px 22px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:4px}
.a-snav h3{margin:0 0 10px 10px;font:600 26px/1 var(--serif)}
.a-snav span{padding:8px 10px;border-radius:.4rem;font-size:14.5px;color:var(--muted)}
.a-snav span.on{background:var(--card);color:var(--ink);font-weight:700;box-shadow:var(--sh-sm),inset 2px 0 0 var(--crim)}
.a-rmain{padding:36px 70px}
.a-people{display:flex;gap:28px}
.a-person{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:14px;color:var(--ink2)}
.a-person i{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font:600 22px/1 var(--serif);font-style:normal;color:var(--ink);transition:box-shadow .25s var(--out),transform .25s var(--out)}
.a-person:nth-child(1) i{background:color-mix(in srgb,var(--sea) 28%,var(--bg))}
.a-person:nth-child(2) i{background:color-mix(in srgb,var(--gold) 70%,var(--bg))}
.a-person:nth-child(3) i{background:color-mix(in srgb,var(--crim) 22%,var(--bg))}
.a-person:nth-child(4) i{background:color-mix(in srgb,var(--coral) 35%,var(--bg))}
.a-person:hover i{transform:translateY(-2px)}
.a-person.is-on i{box-shadow:0 0 0 2px var(--bg),0 0 0 3.5px var(--ink)}
.a-person.is-on{color:var(--ink);font-weight:700}
.a-rp{margin-top:30px;max-width:780px}
.a-rp .k{display:flex;align-items:center;justify-content:space-between;font:700 12.5px/1 var(--sans);letter-spacing:.07em;text-transform:uppercase;color:var(--crim)}
.a-rp .k button{letter-spacing:0;text-transform:none;font-size:14.5px;color:var(--sea-t)}
.a-rp h2{margin-top:12px;font:600 44px/1.1 var(--serif)}
.a-rp .line{margin-top:6px;font:300 21px/1.3 var(--serif);color:var(--muted)}
.a-rp .desc{margin-top:20px;font:400 18px/1.85 var(--serif)}
.a-rp .tw{margin-top:8px;font-size:14px;color:var(--sea-t);font-weight:700}
.a-rp .tw.is-on{color:var(--ink2);font-weight:400}
.a-rp dl{margin-top:22px;padding-top:16px;border-top:1px solid var(--line2);display:grid;grid-template-columns:120px 1fr;row-gap:10px;font-size:14px}
.a-rp dt{color:var(--faint)}
.a-rp dd{color:var(--ink2)}
/* ⌘K */
.a-pal-scrim{position:absolute;inset:0;z-index:40;background:color-mix(in srgb,var(--bg) 55%,transparent);backdrop-filter:blur(2px);animation:a-fade .2s both}
@keyframes a-fade{from{opacity:0}}
.a-pal{position:absolute;left:340px;top:110px;width:600px;z-index:41;border:1px solid var(--line);border-radius:.6rem;background:var(--white);box-shadow:var(--sh-lg);animation:a-rise .24s var(--out) both;overflow:hidden}
@keyframes a-rise{from{opacity:0;transform:translateY(10px) scale(.98)}}
.a-pal-in{display:flex;align-items:center;gap:10px;height:58px;padding:0 18px;border-bottom:1px solid var(--line);font:400 18px/1 var(--serif);color:var(--faint)}
.a-pal-in kbd{margin-left:auto;padding:3px 7px;border-radius:4px;background:var(--tint);font:700 11px/1 var(--sans);color:var(--ink2)}
.a-pal-list{max-height:500px;overflow-y:auto;padding:6px 8px 10px}
.a-pal-g{margin:10px 10px 4px;font:700 11px/1 var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.a-pal-row{width:100%;display:grid;grid-template-columns:64px 1fr auto;column-gap:10px;align-items:baseline;padding:8px 10px;border-radius:.3rem;text-align:left}
.a-pal-row:hover{background:var(--bg)}
.a-pal-k{font-size:12px;color:var(--crim)}
.a-pal-n{font:400 16px/1.3 var(--serif);color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.a-pal-r{font-size:12px;color:var(--faint)}
.a-toast{position:absolute;left:50%;bottom:28px;z-index:45;transform:translateX(-50%);padding:10px 16px;border-radius:.4rem;background:var(--ink);color:var(--bg);font-size:13.5px;animation:a-rise .24s var(--out) both}
`;


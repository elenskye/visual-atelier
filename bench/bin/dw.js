#!/usr/bin/env node
import * as cmd from '../src/cli/commands.js';

const COMMANDS = {
  list: cmd.cmdList,
  new: cmd.cmdNew,
  rename: cmd.cmdRename,
  delete: cmd.cmdDelete,
  trash: cmd.cmdTrash,
  import: cmd.cmdImport,
  target: cmd.cmdTarget,
  pull: cmd.cmdPull,
  verify: cmd.cmdVerify,
  publish: cmd.cmdPublish,
  versions: cmd.cmdVersions,
  snapshot: cmd.cmdSnapshot,
  restore: cmd.cmdRestore,
  ds: cmd.cmdDs,
  scheme: cmd.cmdScheme,
  motion: cmd.cmdMotion,
  db: cmd.cmdDb,
  review: cmd.cmdReview,
  serve: cmd.cmdServe,
  status: cmd.cmdStatus,
  stop: cmd.cmdStop,
  open: cmd.cmdOpen,
  shot: cmd.cmdShot,
  check: cmd.cmdCheck,
  frames: cmd.cmdFrames,
  export: cmd.cmdExport,
  offline: cmd.cmdOffline,
  mcp: cmd.cmdMcp
};

const HELP = `dw：visual-atelier 看画布的命令行（画布在仓库根目录的 canvases/<画布名>/）

  dw list [--json]                              分四类列出：Design System、Motion Deck、Explore Deck、Questionnaire
  dw new <画布名> [--title 标题]                  新建一块画布（canvas.json 加 Main.dc.html）
  dw rename <画布名> <新名字>                     改画布或问卷页的名字（标题；目录名和地址不变）
  dw rename <画布名> --page <页 id> <新页名>       改一页的名字
  dw rename <画布名> --board <文件> <新标题>       改一张画板的标题（文件名不变）
  dw rename --ds <方案> [<新名字>]                 Design System 在 bench 里的名字（只记在 bench/names.json，
  dw rename --motion <方案> [<新名字>]             方案的源和云端不变）；不写新名字就回到方案自己的
  dw delete <画布名> [--page <页 id> | --board <文件>]
                                                 删整块画布、其中一页（连它的画板、便签、批准记录）或一张画板
                                                 （连它的批准记录）；都挪进回收处 canvases/.trash/，能放回
  dw trash [list] | restore <id> | empty --yes   看回收处、放回一样、清空
  dw mcp                                         MCP 服务（stdio，给 Agent 用；配置写 bench/bin/dw-mcp.sh，见 bench/README.md「MCP」）
  dw offline [--all-glyphs]                      把画布运行时的 React、Google Fonts 一次取好存在本机（bench/.cache/），
                                                 之后断网也能看；--all-glyphs 连没用到的字也取
  dw import <导出.html> --name <画布名>           把 Claude 画布导出的单文件 HTML 转成画布
  dw target <画布名>                              列出这块画布的每份云端、各属于哪个账号
  dw target <画布名> <slug> --url <链接> --account <账号> [--home] [--same-ids]
                                                 登记一份云端；--account：建它的 Claude 账号，只有它能拉回、发回；
                                                 --same-ids：云端那份和本地用同一套图片 id（从云端拉下来的画布）

  dw pull <画布名> --listing <list_files.json>    看要从云端拉回哪些文件（按 read_file 分好批）
       --from <下载的文件或目录>                    写进 project/，逐个核对 sha256，存一个版本
       --assets <list_assets.json> [--from ...]     同样的办法拉回图片
  dw verify <画布名> --listing <list_files.json>  本地和云端逐个核对 sha256
  dw publish <画布名> [--listing <list_files.json>] 列出 publish_files 要发的文件（只发改过的）
       --blob-map <file>                            记下上传后图片的新 id
       --record --listing <发完后的 list_files.json> 核对云端和本地一致，存一个版本
  （以上都可加 --target <slug> 指定另一份云端，默认是 home）

  dw versions <画布名>                            列出本地版本
  dw snapshot <画布名> [--label 名字]              存一个版本
  dw restore <画布名> <版本>                       恢复到某个版本（恢复前的样子会先存起来）

  dw db <画布名> [<文档路径>]                       读页面存的数据（db.json；和云端 db 同一套路径，如 survey/answers）
  dw db <画布名> set <文档路径> <JSON 文件>          写一个文档（整份替换）

  dw review <画布名>                              每张画板的批准状态（站主在画布界面里批准、退回，存在 db.json 的 review/<画板>）
  dw review <画布名> --propose [--board 文件名]    标「待批」（不写 --board 就是全部画板）；批准和退回只由站主做
  dw review <画布名> --clear --board 文件名        清掉一张的状态

  dw ds [list]                                   列出 schemes/ 里的 Design System
  dw ds install <画布名> <方案>                    把它挂到画布上：复制到 project/ds/<名字>/，记进 canvas.json

  dw scheme new <方案名> [--title 标题] [--no-check]
                                                 起一套新方案：从 schemes/_template/ 复制、填名字，再跑一遍 token 构建、
                                                 质量检查、Design System 构建（产物在 dist/<方案名>/）

  dw motion list [方案]                          列出动效零件（schemes/<方案>/motion/），带不带导出好的 GIF；
                                                 在画布界面看：/#/motion/<方案>（Motion Deck：实时播放、拖时间轴、导出）
  dw motion export <方案> [零件] [--out 目录]      逐帧导出 GIF 和逐帧总览图，和 npm run build:motion 同一个函数，
                                                 默认写 dist/<方案>/motion/<零件>/

  dw serve [--port 4321] [--json]                本地预览，只听 127.0.0.1；--json：启动好了打一行 {"ready":true,"url":…,"pid":…}
  dw status [--port 4321]                        服务在不在跑（问它的 /api/status）
  dw stop [--port 4321]                          停掉 dw serve 启动的服务
  dw open <画布名> [--page 页] [--board 文件名]    给出这块画布（某一页、某一张）在界面里的地址，不开浏览器
  dw check <画布名> [--board 文件名] [--no-lint]   一条命令自检：每张板截图、零报错、版面（出框、字被裁、图片），
                                                 再跑画布自带的 */lint.mjs；没通过时退出码为 1
  dw frames <画布名> --board 文件名 [--at 0,300,600 | --every 250 --until 2000] [--click 按钮上的字] [--scale 1]
                                                 看动效：不减弱动效，按时间线截几帧（默认每 250ms 到 2000ms，最多 24 帧），
                                                 拼成一张总览 .shots/frames/<画板名>.png；--click 先点这个按钮（可写几次，依次点）；
                                                 只为看，不保证两次一样
  dw export <画布名> [--board 文件名] [--png] [--html] [--scale 2] [--out 目录]
                                                 导出 PNG（默认）或单文件 HTML，默认放 .shots/export/
  dw shot <画布名> [--board 文件名] [--out 路径] [--strict]
                                                 无头截图，查控制台报错和宽高为 0 的容器

  加 --json 输出机器读的结果。`;

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    const key = eq >= 0 ? arg.slice(2, eq) : arg.slice(2);
    let val = true;
    if (eq >= 0) val = arg.slice(eq + 1);
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) val = argv[++i];
    if (key in flags) flags[key] = [].concat(flags[key], val);
    else flags[key] = val;
  }
  return { positional, flags };
}

async function main() {
  const [sub, ...rest] = process.argv.slice(2);
  if (!sub || sub === 'help' || sub === '--help' || sub === '-h') return console.log(HELP);
  const run = COMMANDS[sub];
  if (!run) {
    console.error(`没有这个命令：${sub}\n\n${HELP}`);
    process.exitCode = 1;
    return;
  }
  const { positional, flags } = parseArgs(rest);
  try {
    await run(positional, flags);
  } catch (err) {
    console.error(`[dw ${sub}] ${err.message}`);
    if (process.env.DEBUG) console.error(err.stack);
    process.exitCode = 1;
  }
}

main();

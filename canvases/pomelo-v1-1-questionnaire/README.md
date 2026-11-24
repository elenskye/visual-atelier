# Pomelo 1.1 问卷

定 Pomelo 下一个大版本（1.1.0）做什么：路线图「以后」里的几件怎么排，新模块「文件备份」（U 盘、Google Drive、PikPak）怎么做（2026-11-24，Pomelo 1.0.6 那一轮出的）。照 `skills/questionnaire/template/` 做（Vermilion 朱红）。

- **填**：云端 https://claude.ai/artifact/FFKndGb8zxLCwXoK3TFQF4（现用账号，手机上也能填）
- **读答案**：MCP 的 `db_get`（slug `735fee83-e8b7-4221-b264-df897b499ffb`，路径 `survey/answers`），存一份到本地：`node bench/bin/dw.js db pomelo-v1-1-questionnaire set survey/answers <文件>`

| 页 | 内容 | 题号 |
| --- | --- | --- |
| 1 路线 | 1.1.0 做什么、另外几件怎么排、备份分几个 Phase | next、L1–L4（矩阵）、phases |
| 2 现状 | 多大、什么文件、改多少、U 盘格式、要不要在 Windows 上开、会不会在备份上改、现在怎么传云端、别的目的地 | size、kinds、change、drive、windows、edit_dest、now_cloud、other_dest |
| 3 方式 | 备份方式、每个任务能不能自己选、旧版留多久、怎么判断变没变、改名和挪动、默认排除、什么时候开始 | mode、per_task、keep、compare、rename、exclude、trigger |
| 4 云端 | 云端怎么接（rclone）、U 盘那边、PikPak 放什么、加不加密、后台传的规矩 | engine、usb_engine、pikpak_use、encrypt、net |
| 5 界面 | 想看到什么、提醒、记录留多少、恢复、柚子管到哪、数据怎么存 | show、notify、history、restore、youzi、store |
| 6 名字 | 名字、贴纸簿哪一类、放不放「常用」、贴纸 | name、name_own、cat、pin、sticker |
| 7 核对 | 模板自动加的 | — |

结论写进 Pomelo 的 `docs/requirements.md` 和 `docs/roadmap.md`；写完问站主能不能删这个目录。

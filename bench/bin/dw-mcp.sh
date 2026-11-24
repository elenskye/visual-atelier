#!/bin/bash
# dw 的 MCP 服务（stdio）。三家 Agent 的项目级配置（.mcp.json、.codex/config.toml、.agents/plugins/dw/mcp_config.json）都启动它：
# 它切到自己所在的仓库（或 worktree）根目录，有 nvm 就换成 .nvmrc 写的 Node（22），再跑 dw mcp。stdout 只走 MCP 协议，所以 nvm 的话都扔掉。
cd "$(dirname "$0")/../.." || exit 1
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
  nvm use >/dev/null 2>&1
fi
exec node bench/bin/dw.js mcp "$@"

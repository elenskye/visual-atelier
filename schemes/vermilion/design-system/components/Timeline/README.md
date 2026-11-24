# Timeline

两种时间线，都是「空心圆节点 + 竖线」：月度时间轴（当下页）用虚线，每段内容各自一截；履历时间线（关于页）用实线，把条目串起来。

**节点**：13px 圆，2px `color-accent` 描边，`color-page` 填充（暗色模式也是挖空的效果），贴在条目左上。

**月度时间轴** `section.now-timeline > article.now-entry`：

- 条目之间 `space-8`，左内边距 46px（窄屏 36px）。
- 节点 `span.now-marker`，下方一条 1.5px `color-line` 虚线，从节点下方一直到这个月内容结束，月与月之间留空。
- 月份标题 `h2`：衬线 1.5rem；正文 `.now-entry-body.prose` 用 `type-now-body`（1.3rem、行高 1.85）。

**履历时间线** `ol.about-timeline > li`：

- 左内边距 44px，条目间 `space-6`。节点 `span.about-marker`，除最后一条外，下方一条 1px `color-line` 实线连到下一条。
- 标题 `h3.about-role`：「角色 · 机构」，衬线 1.32rem，机构名 `span.about-org` 用 `color-accent-strong`。
- 时间段 `p.about-period`：`type-caps`（大写、字距 0.07em、`color-muted`）；说明 `p.about-desc`：衬线 1rem、行高 1.7。

**使用方提供**：条目列表（月份与正文；或角色、机构、时间段、说明）。节点都加 `aria-hidden="true"`。

**不要**：把节点填实或改成朱红；把两种竖线混用；在节点里放数字或图标。

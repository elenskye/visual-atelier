// 第 4 步 · Design System 的标准写法：组件预览、README 的例子、S4 画板都用这一份，类名不会写岔。
// 都返回 HTML 字符串；cls 加在最外层（状态类 is-hover、is-focus、is-press、is-on、is-off 也从这里加）。

const c = (...a) => a.filter(Boolean).join(' ');
export const icon = (name, size) => `<i class="${c('pk-i', `pk-i--${name}`, size && size !== 16 && `pk-i--${size}`)}"></i>`;

/** 按钮。v：primary / danger / fill / warn / ghost；sm：小按钮；off：不能用。 */
export const btn = (label, { v, sm, ic, icEnd, cls, off, square, aria } = {}) =>
  `<button type="button" class="${c('pk-btn', v && `pk-btn--${v}`, sm && 'pk-btn--sm', square && 'pk-btn--square', cls)}"${off ? ' disabled=""' : ''}${aria ? ` aria-label="${aria}"` : ''}>${ic ? icon(ic, sm ? 12 : 16) : ''}${label}${icEnd ? icon(icEnd, sm ? 12 : 16) : ''}</button>`;
export const chip = (label, { on, sm, ic, cls, off } = {}) =>
  `<button type="button" class="${c('pk-chip', sm && 'pk-chip--sm', on && 'is-on', cls)}"${off ? ' disabled=""' : ''}>${ic ? icon(ic, sm ? 12 : 16) : ''}${label}</button>`;
/** 分段。items：[名字, 类]；on 是选中的序号。 */
export const seg = (items, { on = 0, full, sm, cls } = {}) =>
  `<div class="${c('pk-seg', full && 'pk-seg--full', sm && 'pk-seg--sm', cls)}" role="group">${items.map((it, i) => { const [label, k, off] = [].concat(it); return `<button type="button" class="${c(i === on && 'is-on', k)}"${off ? ' disabled=""' : ''}>${label}</button>`; }).join('')}</div>`;
/** 右栏的页签。tabs：[名字, 额外的内容]。 */
export const tabs = (items, on = 0) =>
  `<div class="pk-seg pk-seg--full pk-tabs" role="tablist">${items.map(([label, extra = ''], i) => `<button type="button" role="tab" aria-selected="${i === on}" class="${i === on ? 'is-on' : ''}">${label}${extra}</button>`).join('')}</div>`;
export const sw = (label, { on = true, cls, off } = {}) =>
  `<button type="button" class="${c('pk-switch', cls)}" role="switch" aria-checked="${on}"${off ? ' disabled=""' : ''}><span class="pk-switch-track"><i></i></span>${label}</button>`;
/** 单选（kind radio）或多选（check）的一行。 */
export const opt = (name, { kind = 'radio', on, desc, key, cls, off, tag } = {}) =>
  `<button type="button" class="${c('pk-opt', cls)}" role="${kind === 'radio' ? 'radio' : 'checkbox'}" aria-checked="${!!on}"${off ? ' disabled=""' : ''}>${kind === 'radio' ? '<span class="pk-radio"></span>' : `<span class="pk-check">${icon('check', 12)}</span>`}<span><b class="pk-opt-name">${name}${tag || ''}</b>${desc ? `<span class="pk-opt-desc">${desc}</span>` : ''}</span><span class="pk-opt-key">${key || ''}</span></button>`;
export const field = ({ ph = '', value = '', caret, cls, off } = {}) =>
  `<label class="${c('pk-field', off && 'is-off', cls)}"><span class="pk-prompt">›</span>${value ? `<span class="pk-field-value">${value}</span>` : `<span>${ph}</span>`}${caret ? '<i class="pk-caret"></i>' : ''}</label>`;
export const input = (text, { ph, caret = true, cls } = {}) =>
  `<div class="${c('pk-input', cls)}"><span class="pk-prompt">›</span>${text ? `<span class="pk-input-text">${text}</span>` : `<span>${ph || ''}</span>`}${caret ? '<i class="pk-caret"></i>' : ''}</div>`;
export const dot = (who) => `<i class="pk-dot pk-dot--${who}"></i>`;
export const menuItem = (who, name, note, { on, cls, off } = {}) =>
  `<button type="button" class="${c('pk-menu-item', on && 'is-on', cls)}"${off ? ' disabled=""' : ''}>${dot(who)}<b>${name}</b><span>${note}</span></button>`;
/** 文件行。k：file / dir / del；tag：NEW / DEL…；add、del：行数。 */
export const row = (name, { k = 'file', on, tag, add, del, cls, off, ic } = {}) =>
  `<button type="button" class="${c('pk-row', k === 'dir' && 'pk-row--dir', k === 'del' && 'pk-row--del', on && 'is-on', cls)}"${off ? ' disabled=""' : ''}>${icon(ic || (k === 'dir' ? 'folder' : 'file'), 12)}<span class="pk-row-name">${name}</span>${tag ? `<em class="pk-tag pk-tag--${tag.toLowerCase() === 'new' ? 'new' : 'del'}">${tag}</em>` : '<span></span>'}${add != null ? `<span class="pk-add">+${add}</span>` : '<span></span>'}${del != null ? `<span class="pk-del">−${del}</span>` : '<span></span>'}</button>`;
export const tag = (label, v) => `<em class="${c('pk-tag', v && `pk-tag--${v}`)}">${label}</em>`;
/** n 格方块进度：前 f 格亮，第 f 格是头（wait：头那一格变琥珀）。 */
export const blocks = (n, f, { wait, still, sm, cls, head = true } = {}) =>
  `<div class="${c('pk-blocks', still && 'pk-blocks--still', sm && 'pk-blocks--sm', cls)}" style="--pk-n:${n}">${Array.from({ length: n }, (_, i) => `<i class="${i < f ? 'is-on' : i === f && f < n && head ? (wait ? 'is-wait' : 'is-head') : ''}"${i < f && !still ? ` style="animation-delay:${(i * 0.07).toFixed(2)}s"` : ''}></i>`).join('')}</div>`;
export const twinkle = () => `<span class="pk-twinkle" aria-hidden="true">${'<i></i>'.repeat(9)}</span>`;
const CHECK7 = ['0000000', '0000001', '0000010', '1000100', '0101000', '0010000', '0000000'];
export const dotcheck = () => `<span class="pk-dotcheck" aria-hidden="true">${CHECK7.join('').split('').map((k) => (k === '1' ? '<i class="is-on"></i>' : '<i></i>')).join('')}</span>`;
export const modHead = (label, note = '', count = '') =>
  `<p class="pk-mod-head"><span class="pk-mod-label">${label}</span>${note ? `<span class="pk-mod-note">${note}</span>` : ''}${count !== '' ? `<span class="pk-mod-count"${note ? '' : ' style="margin-left:auto"'}>${count}</span>` : ''}</p>`;
/** 步骤。st：ok / run / wait / todo / fail。 */
export const step = (st, name, { time = '', desc = '' } = {}) => {
  const node = st === 'run' ? '<span class="pk-run"></span>' : st === 'ok' ? icon('check', 12) : st === 'wait' ? icon('ask', 12) : st === 'fail' ? icon('x', 12) : '';
  return `<li class="pk-step pk-step--${st}"><span class="pk-step-node">${node}</span><div><p class="pk-step-head"><b class="pk-step-name">${name}</b>${time ? `<span class="pk-step-time">${time}</span>` : ''}</p>${desc ? `<p class="pk-step-desc">${desc}</p>` : ''}</div></li>`;
};
export const toast = (text, ic = 'bang') => `<div class="pk-toast">${icon(ic, 12)}<span>${text}</span></div>`;
export const bar = (text, { v, ic = 'ask', action } = {}) => `<div class="${c('pk-bar', v && `pk-bar--${v}`)}">${icon(ic)}<span class="pk-bar-text">${text}</span>${action || ''}</div>`;
export const edge = () => '<span class="pk-card-edge" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';

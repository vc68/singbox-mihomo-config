// ============================================================
// 通用 sing-box 节点注入脚本
//
// 功能（跟原版 template.js 一致）：
//   读模板 JSON → 把机场节点按地区填进对应的空组 → 输出
//
// 不做什么：
//   ❌ 不改 clash_api / external_ui（面板完全由模板 JSON 决定）
//   ❌ 不改 dns / route / inbounds（同上）
//
// 模板从哪来：
//   组合的 url 指向的 JSON（Sub-Store 会作为 $content / $files[0] 传进来）
//   所以这个组合的 url 必须指向你自己的模板，比如 01-router-empty.json
// ============================================================

log(`🚀 开始`)

// ---------- 1. 取模板 ----------
const _files = typeof $files !== 'undefined' ? $files : []
const SRC = $content || _files[0] || ''

if (!SRC || !String(SRC).trim()) {
  throw new Error(
    '拿不到模板内容。这个脚本需要组合的 url 指向你的 JSON 模板（如 01-router-empty.json），' +
    'Sub-Store 会把该 url 的内容作为 $content 传入。如果 url 为空或是非 JSON 内容，脚本无法工作。'
  )
}

let config
try {
  config = (ProxyUtils.JSON5 || JSON).parse(SRC)
} catch (e) {
  throw new Error(`模板不是合法 JSON：${e.message ?? e}`)
}
log(`模板解析成功，现有 outbounds ${(config.outbounds || []).length} 个`)

// ---------- 2. 取节点 ----------
const SUB_NAME = '组合'
let nodes = []
try {
  const raw = await produceArtifact({
    name: SUB_NAME,
    type: 'collection',
    platform: 'sing-box',
    produceOpts: { 'include-unsupported-proxy': false },
  })
  const d = JSON.parse(raw)
  nodes = [...(d.outbounds ?? []), ...(d.endpoints ?? [])]
  log(`读取「${SUB_NAME}」成功：${nodes.length} 个节点`)
} catch (e) {
  throw new Error(`读取「${SUB_NAME}」失败：${e.message ?? e}`)
}
if (!nodes.length) {
  throw new Error(`「${SUB_NAME}」里没有节点，请检查这个组合订阅`)
}

// ---------- 3. 组名 → 节点筛选正则 ----------
const R_ALL = String.raw`^(?!.*(?:官网|剩余|流量|套餐|免费|订阅|到期时间|直连|GB|Expire Date|Traffic|ExpireDate)).*`
const R_SG  = String.raw`^(?!.*(?:ZJ|zijian|自建)).*(新加坡|坡|狮城|SG|Singapore)`
const R_JP  = String.raw`^(?!.*(?:ZJ|zijian|自建)).*(🇯🇵|JP|jp|日本|日|Japan)`
const R_US  = String.raw`^(?!.*(?:ZJ|zijian|自建|AUS|RUS)).*(🇺🇸|US|us|美国|美|United States)`

const RULES = [
  ['自动选择',   new RegExp(R_ALL, 'i')],
  ['新加坡自动', new RegExp(R_SG, 'i')],
  ['日本自动',   new RegExp(R_JP, 'i')],
  ['美国自动',   new RegExp(R_US, 'i')],
  ['手动选择',   new RegExp(R_ALL, 'i')],
]

// ---------- 4. 注入 ----------
for (const ob of config.outbounds || []) {
  const hit = RULES.find(([name]) => name === ob.tag)
  if (!hit) continue
  const tags = nodes.filter(n => hit[1].test(n.tag)).map(n => n.tag)
  ob.outbounds = tags
  log(`🕳 ${ob.tag} 注入 ${tags.length} 个节点`)
}

// 空组兜底：用全部节点
for (const ob of config.outbounds || []) {
  if (!RULES.some(([name]) => name === ob.tag)) continue
  if (!Array.isArray(ob.outbounds) || ob.outbounds.length === 0) {
    ob.outbounds = nodes.map(n => n.tag)
    log(`⚠️ ${ob.tag} 为空，回退为全部节点`)
  }
}

// ---------- 5. 节点追加到 outbounds ----------
config.outbounds = [...(config.outbounds || []), ...nodes]

// ---------- 6. 输出 ----------
$content = JSON.stringify(config, null, 2)
log(`🔚 完成：${config.outbounds.length} 个 outbound（含 ${nodes.length} 个节点）`)

function log(v) {
  console.log(`[📦 sing-box 注入脚本] ${v}`)
}

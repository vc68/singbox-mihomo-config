# sing-box / mihomo 配置模板

个人使用的代理内核配置模板，配合 Sub-Store 使用。

**所有链接都可以直接一键复制。**

---

## 一、sing-box 模板（JSON）

### 1. 软路由模板（OpenWrt / momo）

用于软路由，API 监听 `0.0.0.0:9090`，面板目录 `/etc/sing-box/panel`。

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/01-router-empty.json
```

不带加速的原始地址：

```
https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/01-router-empty.json
```

---

### 2. 手机模板（sing-box app）

用于手机，API 只监听 `127.0.0.1:9090`，不带面板（app 自带 UI）。

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/02-mobile.json
```

不带加速的原始地址：

```
https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/02-mobile.json
```

---

### 3. 桌面模板（Windows / macOS）

用于电脑，API 只监听 `127.0.0.1:9090`，面板目录 `panel`（工作目录下）。

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/03-desktop.json
```

不带加速的原始地址：

```
https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/03-desktop.json
```

---

## 二、注入脚本

把机场节点填进模板的空策略组。**不修改** `clash_api` / `dns` / `route` / `inbounds`，这些全部由模板 JSON 决定。

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/singbox-template.js
```

不带加速的原始地址：

```
https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/singbox-template.js
```

---

## 三、mihomo 合并模板

给 mihomo 内核用（Sub-Store 的 `mihomoConfig` 类型），包含 DNS 防泄露、TUN、分流规则。

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/mihomo-merge.yaml
```

不带加速的原始地址：

```
https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/mihomo-merge.yaml
```

---

## 四、怎么用（Sub-Store）

### 步骤 1：组合的 url 指向模板

在 Sub-Store 里，把组合的 `url` 改成上面「一、sing-box 模板」里对应的链接：

| 组合名 | 填哪个链接 |
|---|---|
| `momo singbox` | 01-router-empty.json |
| `singbox iphone` | 02-mobile.json |
| `singbox Windows` | 03-desktop.json |

### 步骤 2：处理步骤用「链接」模式

在组合的「处理步骤」里，第一个步骤选 **链接（link）** 模式，填注入脚本的链接：

```
https://gh-proxy.com/https://raw.githubusercontent.com/vc68/singbox-mihomo-config/main/singbox-template.js
```

脚本会自动读取步骤 1 里那个模板，把节点填进去。

---

## 五、策略组结构

三份模板都是「空壳」，策略组里没有节点，节点由注入脚本填。

```
默认代理    selector → 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 谷歌相册 / 手动选择 / 直连
漏网之鱼    selector → 默认代理 / 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 谷歌相册 / 手动选择 / 直连
自动选择    urltest  全部节点
新加坡自动  urltest  名称含 新加坡 / 狮城 / SG / Singapore
日本自动    urltest  名称含 日本 / 东京 / 大阪 / JP / Japan
美国自动    urltest  名称含 美国 / 洛杉矶 / US / United States
谷歌相册    selector 全部节点（手动选，不自动测速）
手动选择    selector 全部节点
GLOBAL      selector 全部
直连        direct
```

> 谷歌相册组是 **手动选择**（sing-box `selector` / mihomo `select`），不是自动测速。原因：相册上传对节点很挑，测速结果和实际上传成功率经常不一致，交给内核自动挑反而更难用。mihomo 侧配合 `profile.store-selected` 会记住你选的节点。

---

## 六、注意事项

1. **模板必须配合注入脚本使用**。单独用模板，策略组是空的，sing-box 启动会报 `missing tags`。

2. **机场域名规则**：`liangxin.xyz` / `pqjc.site` / `xn--cp3a08l.com` 走「自动选择」，DNS 走国内 DoH。
   这样拉订阅时不会因为某个节点挂掉而失败。

3. **面板文件不包含在本仓库**。需要自己放置：
   - 软路由：`/etc/sing-box/panel`（zashboard 在根，官方面板在 `dashboard/` 子目录）
   - 桌面：sing-box 工作目录下的 `panel/`

4. **本仓库不包含任何节点信息**（地址、密码、uuid 都没有）。节点是运行时由脚本从你的机场订阅里读出来注入的，所以公开仓库是安全的。

---

## 七、文件清单

| 文件 | 说明 |
|---|---|
| `01-router-empty.json` | 软路由模板 |
| `02-mobile.json` | 手机模板 |
| `03-desktop.json` | 桌面模板 |
| `singbox-template.js` | 节点注入脚本 |
| `mihomo-merge.yaml` | mihomo 合并模板 |
| `README.md` | 本文件 |

---

## 八、IPv6 已关闭（2026-10-27 更新）

三份 sing-box 模板统一改为 **IPv4-only**。原因：原先 `dns.strategy` 是 `prefer_ipv4`，它只是「优先」用 IPv4，**AAAA 记录照样会解析并返回给应用**，应用拿到 IPv6 地址后自行发起连接，进 TUN 后按规则走「直连」出口，于是出现「解析成功但 IPv6 直连失败 / 卡住等超时」。

| 位置 | 改前 | 改后 |
|---|---|---|
| `dns.strategy` | `prefer_ipv4` | `ipv4_only` |
| `inbounds[tun].address` | `172.19.0.1/30` + `fdfe:dcba:9876::1/126` | 仅 `172.19.0.1/30` |
| `outbounds[直连].domain_resolver` | `"dns-cn"` | `{"server":"dns-cn","strategy":"ipv4_only"}` |
| `route.default_domain_resolver` | `{"server":"dns-cn"}` | 追加 `"strategy": "ipv4_only"` |

效果：

- DNS 不再返回 AAAA，应用拿不到 IPv6 地址，从根上不再发起 IPv6 连接；
- 代理不再接管 IPv6 流量（TUN 无 IPv6 地址），日志里不会再有 IPv6 直连失败的报错；
- 节点域名解析同样只取 IPv4，避免连节点时踩 IPv6 的坑；
- `route_exclude_address` 里的 `fc00::/7`、`fe80::/10` **保留**，局域网 IPv6 设备仍可直连访问。

需要恢复 IPv6 时反向改回即可：`dns.strategy` 改 `prefer_ipv4`，并把 `fdfe:dcba:9876::1/126` 加回 tun 的 `address`。

改动已用 `sing-box check`（v1.14.3）校验通过。

---

## 九、显式标注 action（2026-10-30 更新）

三份模板的 DNS 规则和路由规则统一补上了 `action: "route"` 显式声明（每份 5 条 DNS + 9 条路由，共 14 处）。

**原因**：`dns.rules[].server`、`dns.rules[].rewrite_ttl`、`route.rules[].outbound` 自 **sing-box 1.11.0 起均已弃用**，官方迁移方向是把这些字段放进 Rule Action（`action: "route"` + 对应字段）。不写 `action` 时内核默认按 `route` 处理，因此**本次改动语义完全等价、零功能变更**（已验证：去掉显式 `action` 后与原文件逐字节相同）。

**版本约束**：本套配置要求 **sing-box ≥ 1.14.0**，因为用到 `action: "evaluate"`、`match_response`、`dns.timeout`、`dns_mode`（均为 1.14.0 引入）。低于该版本会直接报 `unknown DNS rule action` 启动失败。

**校验**：三份模板均已用 `sing-box check`（v1.14.4）通过。注意校验前必须先填入节点，否则会报 `initialize outbound[N]: missing tags`，这是空模板的固有行为，不是配置错误。

---

## 十、国内视频/直播 CDN 直连 + 拦截虎牙 PCDN（2026-11-16 更新）

### 实测数据（不是推测）

在 Windows PC（192.168.2.115）+ 软路由（192.168.2.100，sing-box 1.14.4）上抓的真实连接：

| 观测项 | 实测值 |
|---|---|
| 虎牙所有连接的分流结果 | `rule_set=geoip-cn => route(直连)`，**无一条走代理** |
| 播放器日志 | `use_p2p:1 use_xp2p:0 use_pcdn:1 has_used_pcdn:1` |
| 拉流地址 | `flvurl: http://hs.flv.huya.com/...`（官方 CDN）<br>`p2purl: http://hs.p2p.huya.com/huyalive`（PCDN，优先使用） |
| P2P 节省率 | **99.3%**（即 99.3% 的流量走 PCDN） |
| 当前 P2P 节点数 | 46 ~ 55 个 |
| PCDN 实时速率 | **116 KB/s**（0.93 Mbps） |
| 官方 CDN 实时速率 | 156 KB/s（1.25 Mbps，实时码率） |
| 实测 PCDN 数据端口 | `3093 / 7701 / 4481 / 1461 / 20006 / 20100 / 20103 / 20469 / 22067 / 2481 / 3444` |
| `hs.p2p.huya.com` 解析 | CNAME → `volcfcdndvs.com` → `volclivedvs.com`（**火山引擎 CDN**）→ `116.153.42.191` 等 |

结论：**代理配置与直播卡顿无关**。真正的原因是 PCDN 供流不足，以及（在弱机上）解码积压。

### 根因一：直播 CDN 域名被「从代理出口」解析

`dns.rules` 里不在 `geosite-cn` 的域名会走 `evaluate → dns-remote`，而 `dns-remote` 的 `detour` 是「默认代理」，即**经代理问 1.1.1.1**。直播 CDN 域名（`*.szbdyd.com`、`*.mcdn.bilivideo.cn`、`*.hycdn.cn`、`*.huyacdn.com`）都不在 `geosite-cn` 里，CDN 会按查询来源就近调度，从海外出口查回来的是**海外节点 IP**，`match_response geoip-cn` 判定失败，客户端拿着海外 IP 去连，绕一圈回国。

> 注意：TUN 是三层入站，应用先解析再发连接，目标地址本来就是 IP，`geoip-cn` 规则是生效的。问题不在「规则没匹配上」，而在「IP 本身被判成了境外」。

### 根因二：虎牙 PCDN（不是传统 P2P）

播放器优先用 `http://hs.p2p.huya.com/huyalive` 拉流，实测 **99.3% 的流量走 PCDN 边缘节点**（火山引擎 / PPIO / 星域那类）。日志里 `P2P 卡比`、`补片有效率 92.86%` 说明约 7% 的补片失败。

**关键：PCDN 端口是动态的**（实测 3093、7701、4481、20006、20100、20469……），所以**按固定端口拦截（比如 7784）无效**，必须从**调度域名**下手。

### 改动清单

| 文件 | 位置 | 改动 |
|---|---|---|
| 三份模板 | `dns.rules`，在 `clash_mode` 规则之前 | 新增：国内视频/直播 CDN 域名 → `dns-cn` |
| 三份模板 | `dns.rules`，紧跟上面那条之后 | 新增：`p2p.huya.com` → `predefined` + `NXDOMAIN` |
| 三份模板 | `route.rules`，`protocol: dns` 之后 | 新增：`p2p.huya.com` → `reject`（L7 兜底，靠 sniff 认域名） |
| 三份模板 | `route.rules`，在 `geosite-cn` 之前 | 新增：同一份 CDN 域名 → `直连` |
| `02-mobile.json` | `inbounds[tun].route_exclude_address` | 补 `100.64.0.0/10`（运营商 CGNAT 段） |

新增的 CDN 域名列表（三份模板一致）：

```
bilibili.com  bilivideo.com  bilivideo.cn  hdslb.com  acgvideo.com  szbdyd.com
biliapi.net   biliapi.com    douyu.com     douyucdn.cn  douyucdn.com
huya.com      huyacdn.com    hycdn.cn      msstatic.com  huya.biz
douyinvod.com douyincdn.com  pstatp.com    byteimg.com  snssdk.com
kuaishou.com  ks-cdn.com
```

### 三个必须注意的顺序 / 范围问题

1. **`p2p.huya.com` 的 NXDOMAIN 必须排在 `huya.com → dns-cn` 之前**，否则会被 `huya.com` 的 suffix 先命中，拦截失效。
2. **`p2p.huya.com` 的 `reject` 必须排在 `sniff` 之后**，否则目标还是裸 IP、认不出域名，规则匹配不到。
3. **绝对不要拦 `va.huya.com`**。它是 WebSocket 信令域名（`Config\netconfig.json` 里的 `*-ws.va.huya.com`），拦掉会断弹幕和 IM。

### 为什么没有放开 `resolve` 规则

`route.rules` 里 `{ "inbound": "mixed-in", "action": "resolve" }` 的限制是**正确且必要**的：TUN 是三层入站，应用先解析域名再发连接，进到 sing-box 时目标已经是 IP，`geoip-cn` 直接可匹配；只有 `mixed-in`（HTTP/SOCKS 的 CONNECT 带主机名）才需要先解析。放开到所有入站会让不在 `geosite` 里的被墙域名被 `dns-cn` 解析成污染 IP，再以 IP 形式交给代理，反而连不上。

### 影响面与回滚

- 三份模板的改动**全部是新增**规则，没有修改或删除任何原有规则；
- 新增域名都是国内 CDN，直连语义与原 `geosite-cn` 一致；
- `p2p.huya.com` 只影响虎牙的 PCDN 调度，不影响官方 CDN 拉流、弹幕、登录；
- 如果拦截后虎牙放不出来（客户端强依赖 PCDN、不肯回落），删掉 `route.rules` 里 `p2p.huya.com` 那条 `reject` 和 `dns.rules` 里的 `NXDOMAIN` 即可，其它改动不受影响。

### 校验

三份模板均通过 `sing-box check`（v1.14.3）。校验方法：先给空策略组填入任一节点，并临时移除仅 Linux 支持的 `auto_redirect`（Windows 上无法校验），否则会报 `missing tags` / `auto_redirect is only supported on Linux`。

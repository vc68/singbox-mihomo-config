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
默认代理    selector → 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 手动选择
漏网之鱼    selector → 默认代理 / 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 手动选择 / 直连
自动选择    urltest  全部节点
新加坡自动  urltest  名称含 新加坡 / 狮城 / SG / Singapore
日本自动    urltest  名称含 日本 / 东京 / 大阪 / JP / Japan
美国自动    urltest  名称含 美国 / 洛杉矶 / US / United States
手动选择    selector 全部节点
GLOBAL      selector 全部
直连        direct
```

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

# sing-box / mihomo 配置模板

个人使用的代理内核配置模板，配合 Sub-Store 使用。

## 文件说明

### sing-box 模板（JSON）

| 文件 | 用途 | clash_api |
|---|---|---|
| `01-router-empty.json` | 软路由（OpenWrt / momo） | `0.0.0.0:9090`，面板 `/etc/sing-box/panel` |
| `02-mobile.json` | 手机（sing-box app） | `127.0.0.1:9090`，不带面板 |
| `03-desktop.json` | 桌面（Windows / macOS） | `127.0.0.1:9090`，面板 `panel` |

三份模板都是「空壳」：策略组里没有节点，节点由脚本注入。

**策略组结构**（8 个）：

```
默认代理    selector → 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 手动选择
漏网之鱼    selector → 默认代理 / 自动选择 / 新加坡自动 / 日本自动 / 美国自动 / 手动选择 / 直连
自动选择    urltest  全部节点
新加坡自动  urltest  名称含 新加坡/狮城/SG/Singapore
日本自动    urltest  名称含 日本/东京/大阪/JP/Japan
美国自动    urltest  名称含 美国/洛杉矶/US/United States
手动选择    selector 全部节点
GLOBAL      selector 全部
直连        direct
```

### 注入脚本

`singbox-template.js` — 把机场节点填进模板的空组。

职责只有三件事：

1. 读模板（`$content` / `$files[0]`，即组合 url 指向的 JSON）
2. 读节点（`produceArtifact` 读名为「组合」的订阅）
3. 按组名正则把节点填进对应的组，输出

**不改** `clash_api`、`dns`、`route`、`inbounds` —— 这些全部由模板 JSON 决定。

### mihomo 模板

`mihomo-merge.yaml` — mihomo 内核用的合并模板（Sub-Store 的 `mihomoConfig` 类型）。

包含 DNS 防泄露配置（境外 DoH + `respect-rules`）、TUN、分流规则。

## 用法（Sub-Store）

### 1. 建模板文件

在 Sub-Store 里新建文件，粘贴对应 JSON 的内容：

```
router模板   ← 01-router-empty.json
mobile模板   ← 02-mobile.json
desktop模板  ← 03-desktop.json
```

### 2. 组合的 url 指向模板

```
http://<你的IP>:3001/SUBS/api/file/router模板
```

### 3. 处理步骤用注入脚本

把 `singbox-template.js` 的内容贴进组合的「处理步骤」里（脚本模式）。

## 注意

- 模板里的策略组是空的，**必须**配合注入脚本使用，否则 sing-box 启动会报 `missing tags`
- 机场域名规则：`liangxin.xyz` / `pqjc.site` / `xn--cp3a08l.com` → 自动选择（DNS 走国内）
- 面板文件不包含在本仓库内，需自行放置（zashboard / sing-box dashboard）

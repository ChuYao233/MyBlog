# Umami 分析配置说明

本博客使用 Umami 来统计和显示真实的访客数据。本配置使用 Umami 的**游客链接（Share URL）**方式，适用于自托管的 Umami 实例（无需 API 功能）。

## 配置步骤

### 1. 获取 Umami Share URL（游客链接）

1. 登录你的 Umami 管理后台（例如：`https://umami.2o.nz`）
2. 进入 **Settings**（设置）页面
3. 选择 **Websites**（网站）选项卡
4. 找到你要统计的网站，点击 **Edit**（编辑）按钮
5. 勾选 **Enable share URL**（启用共享 URL）选项
6. 保存后，Umami 会生成一个 Share URL，格式类似：
   ```
   https://umami.example.com/share/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
7. 复制这个 Share URL

**注意：**
- Share URL 是公开的，任何人都可以通过此链接查看统计数据
- 如果不需要公开分享，可以设置访问限制（取决于你的 Umami 配置）
- Share URL 通常以 `.json` 结尾可以获取 JSON 格式数据

### 2. 配置环境变量

#### 本地开发环境

在项目根目录创建 `.env` 文件（如果不存在），添加以下内容：

```env
UMAMI_SHARE_URL=https://umami.example.com/share/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**注意：** `.env` 文件不应该提交到 Git 仓库（已在 `.gitignore` 中排除）

#### 生产环境（Cloudflare Pages / EdgeOne / ESAA 等平台）

在部署平台的环境变量设置中添加 `UMAMI_SHARE_URL`：

##### Cloudflare Pages
1. 登录 Cloudflare Dashboard
2. 进入你的 Pages 项目
3. 点击 **Settings** → **Environment variables**
4. 添加环境变量：
   - **Variable name**: `UMAMI_SHARE_URL`
   - **Value**: 你的 Share URL（完整 URL，例如：`https://umami.example.com/share/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）
   - **Environment**: Production（或根据需要选择 Preview/Production）

##### EdgeOne
1. 登录 EdgeOne 控制台
2. 进入你的站点设置
3. 找到 **环境变量** 或 **Environment Variables** 设置
4. 添加环境变量：
   - **变量名**: `UMAMI_SHARE_URL`
   - **变量值**: 你的 Share URL（完整 URL）

##### ESAA
1. 登录 ESAA 平台
2. 进入项目设置
3. 找到 **环境变量** 配置页面
4. 添加环境变量：
   - **变量名**: `UMAMI_SHARE_URL`
   - **变量值**: 你的 Share URL（完整 URL）

##### 其他平台（Vercel、Netlify 等）
- **Vercel**: Settings → Environment Variables → 添加 `UMAMI_SHARE_URL`
- **Netlify**: Site settings → Environment variables → 添加 `UMAMI_SHARE_URL`

### 3. 验证配置

配置完成后，重新启动开发服务器：

```bash
pnpm dev
```

访问网站后，检查：
- 网站总访问量和访客数是否正确显示在侧边栏的 Profile 组件中
- 文章列表中的每篇文章是否显示了正确的访问量和访客数

## 工作原理

1. **自动跟踪**：Umami 脚本会自动跟踪所有页面访问（包括 SPA 导航）
2. **数据获取**：客户端直接通过 Umami Share URL 获取统计数据（无需认证，无需后端 API）
3. **数据展示**：前端组件直接调用 Umami API 并显示在页面上

## 客户端工具函数

- `src/utils/visitor-stats.ts` - 获取网站总访问量和访客数
- `src/utils/post-stats.ts` - 批量获取多篇文章的统计数据

这些工具函数直接在客户端调用 Umami Share URL，无需通过 Astro API 路由中转。

## 注意事项

### Share URL 的限制

1. **页面级别统计**：某些 Umami 实例的 Share URL 可能不支持按页面过滤，这种情况下所有文章会显示网站总统计。这是 Umami Share URL 功能的限制。
2. **数据格式**：代码会自动适配不同的数据格式（`pageviews`/`views`、`uniques`/`visitors` 等）
3. **公开访问**：Share URL 是公开的，确保你的 Umami 实例配置了适当的访问控制

### 与 API Token 方式的区别

- **Share URL 方式**（当前使用）：
  - ✅ 适用于自托管 Umami，无需启用 API
  - ✅ 无需认证，配置简单
  - ⚠️ 可能不支持页面级别的统计过滤
  - ⚠️ Share URL 是公开的

- **API Token 方式**（已弃用）：
  - ✅ 支持页面级别的统计
  - ✅ 需要认证，更安全
  - ❌ 需要 Umami 实例启用 API 功能

## 故障排除

如果统计数据没有显示：

1. **检查环境变量**：
   - 本地开发：确认 `.env` 文件中的 `UMAMI_SHARE_URL` 已正确配置
   - 生产环境：确认部署平台的环境变量设置中已添加 `UMAMI_SHARE_URL`
   - 确认 Share URL 完整且有效（可以手动访问 Share URL 验证）
   - **重要**：修改环境变量后需要重新部署项目才能生效

2. **验证 Share URL**：
   - 在浏览器中直接访问 Share URL（添加 `.json` 后缀），应该能看到 JSON 格式的统计数据
   - 如果返回 404 或错误，检查 Share URL 是否正确

3. **检查控制台**：打开浏览器开发者工具，查看是否有错误信息

4. **检查 Umami 后台**：确认 Umami 正在正常收集数据

5. **检查构建日志**：确认构建过程中环境变量已正确加载

## 回退机制

如果 Umami Share URL 不可用或未配置，系统会自动回退到本地存储的统计数据（如果之前有使用过）。

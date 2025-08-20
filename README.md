# Privy 登录应用

这是一个使用 Privy 实现用户认证和钱包功能的 React 应用。

## 功能特性

- 🔐 **多种登录方式**: 支持邮箱验证码登录和快速登录
- 💳 **嵌入式钱包**: 自动为用户创建以太坊钱包
- 🎨 **现代化UI**: 美观的渐变背景和响应式设计
- ⚡ **快速集成**: 基于 Privy React SDK 的简单集成

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Privy

1. 访问 [Privy Dashboard](https://console.privy.io/) 创建应用
2. 获取你的 App ID
3. 创建 `.env` 文件并添加配置：

```env
VITE_PRIVY_APP_ID=your-privy-app-id-here
```

### 3. 启动开发服务器

```bash
npm run dev
```

## 使用方法

### 快速登录
点击 "Quick Login with Privy" 按钮，将打开 Privy 的登录界面，支持：
- 邮箱登录
- 社交媒体登录
- 钱包连接
- 其他认证方式

### 邮箱验证码登录
1. 输入邮箱地址
2. 点击 "Send Code" 发送验证码
3. 输入收到的验证码
4. 点击 "Verify & Login" 完成登录

## 配置选项

在 `App.jsx` 中的 `PrivyProvider` 配置：

```javascript
config={{
  // 嵌入式钱包配置
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets'
    }
  },
  // 登录方法
  loginMethods: ['email', 'wallet'],
  // 外观配置
  appearance: {
    theme: 'light',
    accentColor: '#676FFF',
    showWalletLoginFirst: false,
  },
  // 支持的区块链网络
  defaultChain: 1, // Ethereum mainnet
  supportedChains: [1, 137, 10], // Ethereum, Polygon, Optimism
}}
```

## 主要组件

### LoginComponent
主要的登录组件，包含：
- 加载状态处理
- 用户认证状态检查
- 登录表单
- 用户信息显示

### PrivyProvider
Privy SDK 的根组件，提供：
- 用户认证状态管理
- 钱包功能
- 登录方法配置

## 技术栈

- **React 19**: 前端框架
- **Privy React SDK**: 用户认证和钱包管理
- **Vite**: 构建工具
- **CSS3**: 样式和动画

## 部署

### 构建生产版本

```bash
npm run build
```

### 环境变量

确保在生产环境中设置正确的环境变量：

```env
VITE_PRIVY_APP_ID=your-production-app-id
```

## 故障排除

### 常见问题

1. **"App ID not found" 错误**
   - 检查 `.env` 文件中的 `VITE_PRIVY_APP_ID` 是否正确
   - 确保在 Privy Dashboard 中创建了应用

2. **登录失败**
   - 检查网络连接
   - 确认邮箱地址格式正确
   - 查看浏览器控制台的错误信息

3. **钱包创建失败**
   - 检查 Privy 配置中的 `embeddedWallets` 设置
   - 确认支持的网络配置

### 调试

启用详细日志：

```javascript
config={{
  // ... 其他配置
  debug: true
}}
```

## 相关链接

- [Privy 官方文档](https://docs.privy.io/)
- [Privy React SDK](https://docs.privy.io/basics/react/setup)
- [Privy Dashboard](https://console.privy.io/)

## 许可证

MIT License

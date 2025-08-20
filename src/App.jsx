import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import {base, berachain, polygon, arbitrum, story, mantle} from 'viem/chains';
import './App.css';

// 登录组件
function LoginComponent() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // 等待 Privy 初始化完成
  if (!ready) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Privy...</p>
      </div>
    );
  }

  // 如果用户已认证，显示用户信息和登出按钮
  if (authenticated && user) {
    return (
      <div className="user-info">
        <h2>Welcome!</h2>
        <p>Email: {user.email?.address || 'No email'}</p>
        <p>User ID: {user.id}</p>
        <p>Wallet: {user.wallet?.address}</p>
        <button
          onClick={logout}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    );
  }

  // 未认证状态，显示登录按钮
  return (
    <div className="login-container">
      <button
        onClick={login}
        className="login-btn primary"
      >
        Login with Privy
      </button>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <PrivyProvider
      appId={"cmeirr4lg0030jo0b5ryxk7yc"}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#069478',
          landingHeader: 'a2zx',
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        // 钱包列表
      }}
    >
      <div className="App">
        <LoginComponent />
      </div>
    </PrivyProvider>
  );
}

export default App;


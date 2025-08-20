import React from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { base, berachain, polygon, arbitrum, story, mantle } from 'viem/chains';
import './App.css';
import WalletConnectIcon from './assets/wc.png';
import CoinbaseWalletIcon from './assets/cb.png';
import OKXWalletIcon from './assets/okx.png';
import OuroWalletIcon from './assets/ouro.png';
import { 
  A2ZXLogo, 
  BackIcon, 
  CloseIcon, 
  EmailIconLarge, 
  EmailIcon
} from './icons';



// 验证码确认模态框组件
function CodeVerificationModal({ isOpen, onClose, onBack, email }) {
  const [codes, setCodes] = React.useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef([]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // 只允许一个字符

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // 自动跳到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // 退格键跳到上一个输入框
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = () => {
    console.log('Resending code to:', email);
    // 这里实现重新发送验证码的逻辑
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal code-verification-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Back Button and Close Button */}
        <div className="modal-header">
          <button className="back-btn" onClick={onBack}>
            <BackIcon />
          </button>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Email Icon */}
        <div className="verification-icon">
          <EmailIconLarge />
        </div>

        {/* Title */}
        <h2 className="verification-title">Enter confirmation code</h2>

        {/* Description */}
        <p className="verification-description">
          Please check {email} for an email from privy.io enter your code below
        </p>

        {/* Code Input Fields */}
        <div className="code-inputs">
          {codes.map((code, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              className={`code-input-field ${code ? 'filled' : ''} ${index === 0 ? 'active' : ''}`}
              value={code}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
            />
          ))}
        </div>

        {/* Resend Code */}
        <div className="resend-section">
          <span className="resend-text">Didn't get an email? </span>
          <button className="resend-btn" onClick={handleResendCode}>
            Resend Code
          </button>
        </div>

        {/* Footer */}
        <div className="wallet-modal-footer">
          <span>Protected by</span>
          <strong> Privy</strong>
        </div>
      </div>
    </div>
  );
}

// 钱包选择模态框组件
function WalletModal({ isOpen, onClose }) {
  const [showCodeVerification, setShowCodeVerification] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const wallets = [
    {
      name: 'WalletConnect',
      icon: <img src={WalletConnectIcon} alt="WalletConnect" />,
      color: '#3b82f6'
    },
    {
      name: 'Coinbase Wallet',
      icon: <img src={CoinbaseWalletIcon} alt="Coinbase Wallet" />,
      color: '#0052ff'
    },
    {
      name: 'OKX Wallet',
      icon: <img src={OKXWalletIcon} alt="OKX Wallet" />,
      color: '#000000'
    },
    {
      name: 'Ouro Wallet',
      icon: <img src={OuroWalletIcon} alt="Ouro Wallet" />,
      color: '#059669'
    }
  ];

  const handleWalletClick = (walletName) => {
    console.log(`Connecting to ${walletName}`);
    // 这里可以实现具体的钱包连接逻辑
    onClose();
  };

  const handleSubmitEmail = () => {
    console.log('Sending code to:', email);
    setShowCodeVerification(true);
  };

  const handleBackToWallet = () => {
    setShowCodeVerification(false);
  };

  const handleCloseAll = () => {
    setShowCodeVerification(false);
    onClose();
  };

  if (!isOpen) return null;

  // 显示验证码确认页面
  if (showCodeVerification) {
    return (
      <CodeVerificationModal
        isOpen={true}
        onClose={handleCloseAll}
        onBack={handleBackToWallet}
        email={email}
      />
    );
  }

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Logo */}
        <div className="wallet-modal-header">
          <A2ZXLogo />
        </div>

        {/* Email Section */}
        <div className="wallet-modal-email">
          <div className="email-input-container">
            <span className="email-icon">
              <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.13974 11.8554C0.13974 7.93503 0.13974 5.97484 0.902694 4.47746C1.57381 3.16033 2.64467 2.08946 3.96181 1.41835C5.45919 0.655396 7.41937 0.655396 11.3397 0.655396H16.9397C20.8601 0.655396 22.8203 0.655396 24.3177 1.41835C25.6348 2.08946 26.7057 3.16033 27.3768 4.47746C28.1397 5.97484 28.1397 7.93503 28.1397 11.8554V17.4554C28.1397 21.3758 28.1397 23.3359 27.3768 24.8333C26.7057 26.1505 25.6348 27.2213 24.3177 27.8924C22.8203 28.6554 20.8601 28.6554 16.9397 28.6554H11.3397C7.41937 28.6554 5.45919 28.6554 3.96181 27.8924C2.64467 27.2213 1.57381 26.1505 0.902694 24.8333C0.13974 23.3359 0.13974 21.3758 0.13974 17.4554V11.8554Z" fill="#2D2D33" />
                <rect x="4.23849" y="7.86505" width="19.6995" height="13.5804" rx="2.61333" fill="#6542AB" />
                <path d="M21.4454 7.86523L6.84632 7.86523C6.21154 7.86523 5.89414 7.86523 5.75062 7.89548C4.63695 8.1302 4.24816 9.52116 5.07872 10.2993C5.18576 10.3996 5.45715 10.5642 5.99993 10.8933L5.99994 10.8933L13.4076 15.3853C13.522 15.4547 13.5792 15.4894 13.635 15.5168C14.0323 15.7121 14.4984 15.709 14.8931 15.5085C14.9485 15.4804 15.0053 15.4449 15.1188 15.374L22.3101 10.882C22.8367 10.5531 23.1 10.3886 23.2053 10.2875C24.0212 9.50426 23.6265 8.12725 22.5195 7.89518C22.3767 7.86523 22.0663 7.86523 21.4454 7.86523Z" fill="#8D65DB" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="yuqi@gmail.com"
              className="email-input-modal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {
              email && (
                <div className="submit-btn" onClick={handleSubmitEmail}>Submit</div>
              )
            }
          </div>
        </div>

        {/* Divider */}
        <div className="modal-divider">
          <span>or</span>
        </div>

        {/* Wallet Options */}
        <div className="wallet-options">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              className="wallet-option"
              onClick={() => handleWalletClick(wallet.name)}
            >
              <div className="wallet-icon">
                {wallet.icon}
              </div>
              <span className="wallet-name">{wallet.name}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="wallet-modal-footer">
          <span>Protected by</span>
          <strong> Privy</strong>
        </div>
      </div>
    </div>
  );
}

// 登录组件
function LoginComponent() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [showWalletModal, setShowWalletModal] = React.useState(false);

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
    <>
      <div className="login-container">
        <button
          onClick={login}
          className="login-btn primary"
        >
          Login with Privy
        </button>

        <button
          onClick={() => setShowWalletModal(true)}
          className="login-btn secondary"
        >
          Connect Wallet
        </button>
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
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


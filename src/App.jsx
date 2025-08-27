import React from 'react';
import { PrivyProvider, usePrivy, useSignMessage, useWallets } from '@privy-io/react-auth';
import { base, berachain, polygon, arbitrum, story, mantle } from 'viem/chains';
import './App.css';
import WalletModal from './components/WalletModal';
import Header from './components/Header';
import './utils/eip6963-test';

// Buffer polyfill for browser environment
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}


// 登录组件
function LoginComponent() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const [selectedNetwork, setSelectedNetwork] = React.useState('ethereum');
  const [walletUser, setWalletUser] = React.useState(null);
  const [signatureResult, setSignatureResult] = React.useState(null);
  const [isSigning, setIsSigning] = React.useState(false);

  // 使用 Privy 的签名功能
  const { signMessage } = useSignMessage({
    onSuccess: ({ signature }) => {
      console.log('Message signed successfully:', signature);
      setSignatureResult(signature);
      setIsSigning(false);
    },
    onError: (error) => {
      console.error('Signature failed:', error);
      setIsSigning(false);
    }
  });

  // 处理邮箱用户的签名
  const handleSignMessage = React.useCallback(async () => {
    if (!user?.wallet?.address) {
      console.error('No wallet address available');
      return;
    }

    setIsSigning(true);
    setSignatureResult(null);

    try {
      console.log(user.wallet.address)
      const message = `Sign to connect to A2ZX Login at ${new Date().toISOString()}`;
      
      await signMessage(
        { message },
        {
          uiOptions: {
            title: 'Sign Message for A2ZX Login',
            description: 'Please sign this message to verify your wallet ownership'
          },
          address: user.wallet.address
        }
      );
    } catch (error) {
      console.error('Failed to sign message:', error);
      setIsSigning(false);
    }
  }, [user, signMessage]);

  // 处理钱包登录成功
  const handleWalletLoginSuccess = (walletInfo, signatureData) => {
    setWalletUser({
      address: walletInfo.address,
      networkType: walletInfo.networkType,
      walletName: walletInfo.name,
      signature: signatureData.signature,
      eddsaKeyPair: signatureData.eddsaKeyPair
    });
    setShowWalletModal(false);
  };

  // 等待 Privy 初始化完成
  if (!ready) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading Privy...</p>
      </div>
    );
  }

  // 如果用户已认证（Privy或钱包），显示用户信息和登出按钮
  if ((authenticated && user) || walletUser) {
    const currentUser = user || walletUser;
    const isWalletUser = !!walletUser;
    
    return (
      <>
        <Header
          selectedNetwork={selectedNetwork}
          onNetworkChange={setSelectedNetwork}
        />
        <div className="main-content">
          <div className="user-info">
            <h2>Welcome!</h2>
            {isWalletUser ? (
              <>
                <p>Wallet: {currentUser.address}</p>
                <p>Network: {currentUser.networkType}</p>
                <p>Wallet: {currentUser.walletName}</p>
              </>
            ) : (
              <>
                <p>Email: {currentUser.email?.address || 'No email'}</p>
                <p>User ID: {currentUser.id}</p>
                <p>Wallet: {currentUser.wallet?.address}</p>
                
                {/* 签名按钮和结果显示 */}
                <div className="signature-section">
                  <button
                    onClick={handleSignMessage}
                    disabled={isSigning}
                    className="sign-btn"
                  >
                    {isSigning ? (
                      <>
                        <div className="spinner-small"></div>
                        Signing...
                      </>
                    ) : (
                      'Sign Message'
                    )}
                  </button>
                  
                  {signatureResult && (
                    <div className="signature-result">
                      <h4>Signature Result:</h4>
                      <p className="signature-text">
                        {signatureResult.length > 50 
                          ? `${signatureResult.slice(0, 25)}...${signatureResult.slice(-25)}`
                          : signatureResult
                        }
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => {
                if (isWalletUser) {
                  setWalletUser(null);
                } else {
                  logout();
                }
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }

  // 未认证状态，显示登录按钮
  return (
    <>
      <Header
        selectedNetwork={selectedNetwork}
        onNetworkChange={setSelectedNetwork}
      />
      <div className="main-content">
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
      </div>

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        selectedNetwork={selectedNetwork}
        onWalletLoginSuccess={handleWalletLoginSuccess}
      />
    </>
  );
}

// 主应用组件
function App() {
  return (
    <PrivyProvider
      appId={"cmeirr4lg0030jo0b5ryxk7yc"}
    >
      <div className="App">
        <LoginComponent />
      </div>
    </PrivyProvider>
  );
}

export default App;


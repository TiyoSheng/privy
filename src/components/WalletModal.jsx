import React from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';
import {
  A2ZXLogo,
  BackIcon,
  CloseIcon,
  EmailIconLarge,
  EmailIcon
} from '../icons';
import { useWalletDetection } from '../hooks/useWalletDetection';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha2';
import { connectWalletConnect } from '../utils/walletConnect';
import { connectSolanaWalletConnect } from '../utils/walletConnectSolana';
import { connectTronWalletConnect } from '../utils/walletConnectTron';
import { connectTronWallet } from '../utils/tron-wallets';
import LoginSuccessModal from './LoginSuccessModal';

// 从签名生成 EdDSA 密钥对的函数
const generateEdDSAFromSignature = (signature, address, networkType) => {
  try {
    // 确保签名是字符串格式
    const signatureStr = typeof signature === 'string' ? signature : JSON.stringify(signature);

    // 使用签名和地址作为种子生成确定性密钥
    const seedData = `${signatureStr}${address}${networkType}`;
    const seed = sha256(new TextEncoder().encode(seedData));

    // 使用种子作为私钥（确定性生成）
    const privateKey = new Uint8Array(seed.slice(0, 32));
    const publicKey = ed25519.getPublicKey(privateKey);

    // 使用签名数据派生确定性私钥
    const signatureHash = sha256(new TextEncoder().encode(signatureStr));
    const derivedPrivateKey = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      derivedPrivateKey[i] = privateKey[i] ^ signatureHash[i];
    }
    const derivedPublicKey = ed25519.getPublicKey(derivedPrivateKey);

    // 将 Uint8Array 转换为十六进制字符串
    const toHex = (bytes) => {
      return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    return {
      privateKey: toHex(derivedPrivateKey),
      publicKey: toHex(derivedPublicKey),
      address: address,
      networkType: networkType,
      signature: signatureStr,
      seed: toHex(seed)
    };
  } catch (error) {
    console.error('Failed to generate EdDSA key pair:', error);
    throw error;
  }
};

// 验证码确认模态框组件
function CodeVerificationModal({ isOpen, onClose, onBack, email }) {
  const [codes, setCodes] = React.useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const inputRefs = React.useRef([]);
  const { sendCode, loginWithCode } = useLoginWithEmail();

  const handleCodeChange = (index, value) => {
    // 检查是否是粘贴操作（粘贴的文本长度大于1）
    if (value.length > 1) {
      // 处理粘贴操作
      const pastedValue = value.slice(0, 6); // 只取前6位
      const newCodes = [...codes];

      // 将粘贴的验证码分配到各个输入框
      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < 6) {
          newCodes[index + i] = pastedValue[i];
        }
      }

      setCodes(newCodes);

      // 如果粘贴的验证码长度是6位，自动登录
      if (pastedValue.length === 6) {
        handleLogin(pastedValue);
      } else {
        // 将焦点移到下一个空输入框
        const nextIndex = Math.min(index + pastedValue.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    // 处理单个字符输入
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // 自动跳到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // 当所有6位验证码都输入完成时，自动登录
    if (index === 5 && value) {
      const fullCode = newCodes.join('');
      if (fullCode.length === 6) {
        handleLogin(fullCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // 退格键跳到上一个输入框
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const cleanPastedData = pastedData.replace(/\D/g, '').slice(0, 6); // 只保留数字，最多6位

    if (cleanPastedData.length > 0) {
      const newCodes = [...codes];

      // 将粘贴的验证码分配到各个输入框
      for (let i = 0; i < cleanPastedData.length; i++) {
        newCodes[i] = cleanPastedData[i];
      }

      setCodes(newCodes);

      // 如果粘贴的验证码长度是6位，自动登录
      if (cleanPastedData.length === 6) {
        handleLogin(cleanPastedData);
      } else {
        // 将焦点移到下一个空输入框
        const nextIndex = Math.min(cleanPastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const handleLogin = async (code) => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithCode({ code });
      onClose(); // 登录成功后关闭模态框
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      await sendCode({ email });
      console.log('Code resent to:', email);
    } catch (error) {
      console.error('Failed to resend code:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
              onPaste={index === 0 ? handlePaste : undefined} // 只在第一个输入框处理粘贴
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

// 等待连接弹窗组件
function ConnectingModal({ isOpen, onClose, onBack, walletInfo }) {
  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal connecting-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Back and Close Button */}
        <div className="modal-header">
          <button className="back-btn" onClick={onBack}>
            <BackIcon />
          </button>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Wallet Icon with Animation Ring */}
        <div className="connecting-wallet-icon">
          <div className="wallet-icon-ring">
            <div className="wallet-icon-inner">
              {walletInfo.icon ? (
                typeof walletInfo.icon === 'string' ? (
                  <img src={walletInfo.icon} alt={walletInfo.name} />
                ) : (
                  walletInfo.icon
                )
              ) : (
                <span className="wallet-emoji">💳</span>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="connecting-title">
          <h2>Waiting for {walletInfo.name}</h2>
        </div>

        {/* Description */}
        <div className="connecting-description">
          <p>For the best experience, connect only one wallet at a time.</p>
        </div>

        {/* Connecting Button */}
        <div className="connecting-actions">
          <button className="connecting-btn" disabled>
            Connecting
          </button>
        </div>
      </div>
    </div>
  );
}

// 签名页面组件
function SignatureModal({ isOpen, onClose, onBack, walletInfo, onSignatureComplete, onSignatureSuccess }) {
  const [isSigning, setIsSigning] = React.useState(false);
  const [signature, setSignature] = React.useState('');
  const [error, setError] = React.useState('');

  const handleStartSignature = async () => {
    setIsSigning(true);
    setError('');
    try {
      // 这里会调用实际的签名逻辑
      const result = await onSignatureComplete();
      setSignature(result.signature);
      
      // 签名成功后调用回调函数显示登录成功页面
      if (onSignatureSuccess) {
        onSignatureSuccess(result);
      }
    } catch (error) {
      console.error('Signature failed:', error);
      setError('Signature failed. Please try again.');
    } finally {
      setIsSigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal signature-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Close Button */}
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Title */}
        <div className="signature-title">
          <h2>Connect a Wallet</h2>
        </div>

        {/* Introduction Text */}
        <div className="signature-intro">
          <p>You will receive 2 signature requests. Signing is free and will not trigger any transaction(s).</p>
        </div>

        {/* Steps */}
        <div className="signature-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Verify ownership</h3>
              <p>Confirm you are the owner of this wallet</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Enable trading</h3>
              <p>Enable secure access to our API for lightning quick trading</p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="signature-actions">
          <button
            className="confirm-btn"
            onClick={handleStartSignature}
            disabled={isSigning}
          >
            {isSigning ? (
              <>
                <div className="spinner-small"></div>
                Signing...
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

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
function WalletModal({ isOpen, onClose, selectedNetwork, onWalletLoginSuccess }) {
  const [showCodeVerification, setShowCodeVerification] = React.useState(false);
  const [showConnectingModal, setShowConnectingModal] = React.useState(false);
  const [showSignatureModal, setShowSignatureModal] = React.useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [walletInfo, setWalletInfo] = React.useState(null);
  const [signatureData, setSignatureData] = React.useState(null);
  const { sendCode } = useLoginWithEmail();

  // 使用钱包检测hook
  const getNetworkCategory = (networkId) => {
    const evmNetworks = ['ethereum', 'arbitrum', 'bnb', 'base'];
    if (evmNetworks.includes(networkId)) return 'evm';
    if (networkId === 'solana') return 'solana';
    if (networkId === 'tron') return 'tron';
    return 'evm'; // default to evm
  };

  const networkCategory = getNetworkCategory(selectedNetwork);
  const { wallets: detectedWallets, isLoading: walletsLoading, error: walletsError } = useWalletDetection(networkCategory);
  console.log(detectedWallets)
  const handleWalletClick = async (wallet) => {
    try {
      console.log(`Connecting to ${wallet.name} on ${selectedNetwork} network`);

      // 立即显示等待连接弹窗
      setWalletInfo({
        name: wallet.name,
        address: '',
        icon: wallet.icon,
        provider: wallet.provider,
        networkType: null,
        features: wallet.features,
        account: null
      });
      setShowConnectingModal(true);

      // Map specific network IDs to categories for wallet connection
      const getNetworkCategory = (networkId) => {
        const evmNetworks = ['ethereum', 'arbitrum', 'bnb', 'base'];
        if (evmNetworks.includes(networkId)) return 'evm';
        if (networkId === 'solana') return 'solana';
        if (networkId === 'tron') return 'tron';
        return 'evm'; // default to evm
      };

      const networkCategory = getNetworkCategory(selectedNetwork);
      let address = '';
      let account = null;
      let provider = wallet.provider;

      // 处理 WalletConnect 特殊逻辑
      if (wallet.isWalletConnect) {
        let result;
        switch (networkCategory) {
          case 'evm':
            result = await connectWalletConnect();
            break;
          case 'solana':
            result = await connectSolanaWalletConnect();
            break;
          case 'tron':
            result = await connectTronWalletConnect();
            break;
          default:
            throw new Error(`WalletConnect not supported for ${networkCategory} network`);
        }
        address = result.address;
        provider = result.provider;
        console.log(`Connected address (WalletConnect-${networkCategory}):`, address);
      } else {
        // 根据网络类型处理不同的连接逻辑
        switch (networkCategory) {
          case 'evm':
            if (wallet.provider) {
              // 请求连接账户
              const accounts = await wallet.provider.request({
                method: 'eth_requestAccounts'
              });
              address = accounts && accounts[0];
              if (!address) throw new Error('No EVM account returned');
              console.log('Connected address (EVM):', address);
            }
            break;

          case 'solana':
            if (wallet.provider) {
              // 使用 Wallet Standard 连接方式
              const response = await wallet.features['standard:connect'].connect();
              console.log('response', response);
              address = response.accounts[0].address;
              account = response.accounts[0];
            }
            break;

          case 'tron':
            if (wallet.isWalletConnect) {
              // WalletConnect Tron
              const result = await connectTronWalletConnect();
              address = result.address;
              provider = result.provider;
              console.log(`Connected address (WalletConnect-Tron):`, address);
            } else if (wallet.adapter) {
              // 使用新的 Tron 钱包适配器
              try {
                const result = await connectTronWallet(wallet.adapter.id);
                address = result.address.base58;
                provider = result;
                console.log(`Connected address (${wallet.name}):`, address);
              } catch (error) {
                console.error(`Failed to connect ${wallet.name}:`, error);
                throw error;
              }
            } else if (wallet.provider) {
              // 兼容旧的连接方式
              try {
                const res = await wallet.provider.request({ method: 'tron_requestAccounts' });
                if (res.code === 200) {
                  address = window.tronWeb.defaultAddress.base58;
                  console.log('address', address);
                } else {
                  throw new Error("用户拒绝连接钱包");
                }
              } catch (e) {
                console.log('e', e);
              }

              if (!address) throw new Error('No TRON address available');
              console.log('Connected TRON account:', address);
            }
            break;

          default:
            console.log('Unsupported network type');
        }
      }

      // 更新钱包信息并显示签名页面
      setWalletInfo(prev => ({
        ...prev,
        address: address,
        provider: provider,
        networkType: networkCategory,
        detectionMethod: wallet.detectionMethod,
        features: wallet.features,
        account: account
      }));

      // 连接成功后显示签名页面
      setShowConnectingModal(false);
      setShowSignatureModal(true);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError(`Failed to connect to ${wallet.name}: ${error.message}`);
      // 连接失败时关闭等待连接弹窗
      setShowConnectingModal(false);
      setWalletInfo(null);
    }
  };

  // 处理签名完成
  const handleSignatureComplete = async () => {
    if (!walletInfo) return;

    const message = `Sign to connect to A2ZX Login at ${new Date().toISOString()}`;
    let signature = '';

    try {
      switch (walletInfo.networkType) {
        case 'evm':
          // 检查是否为 WalletConnect EVM
          if (walletInfo.provider.isWalletConnect || walletInfo.provider.connector) {
            try {
              signature = await walletInfo.provider.request({
                method: 'personal_sign',
                params: [message, walletInfo.address],
              });
            } catch (e) {
              signature = await walletInfo.provider.request({
                method: 'eth_sign',
                params: [walletInfo.address, message],
              });
            }
          } else {
            // 常规 EVM 钱包
            try {
              signature = await walletInfo.provider.request({
                method: 'personal_sign',
                params: [message, walletInfo.address],
              });
            } catch (e) {
              signature = await walletInfo.provider.request({
                method: 'eth_sign',
                params: [walletInfo.address, message],
              });
            }
          }
          break;

        case 'solana':
          // 检查是否为 WalletConnect Solana
          if (walletInfo.provider.name === 'WalletConnect' || walletInfo.provider.adapter) {
            const encodedMessage = new TextEncoder().encode(message);
            const signed = await walletInfo.provider.signMessage(encodedMessage);
            signature = signed;
          } else if (walletInfo.features && "solana:signMessage" in walletInfo.features) {
            // 使用新的 Solana 签名方案
            console.log('walletInfo.features', walletInfo);
            const { signMessage } = walletInfo.features["solana:signMessage"];
            const msg = new TextEncoder().encode(message);
            const signed = await signMessage({ message: msg, account: walletInfo.account });
            console.log("Solana 签名结果:", signed);
            signature = signed.signature || signed;
          }
          break;

        case 'tron':
          // 检查是否为 WalletConnect Tron
          if (walletInfo.provider.signMessage && walletInfo.provider.connect) {
            signature = await walletInfo.provider.signMessage(message);
          } else if (walletInfo.provider.signMessage && typeof walletInfo.provider.signMessage === 'function') {
            // 使用新的适配器签名方法
            signature = await walletInfo.provider.signMessage(message);
          } else {
            // 常规 Tron 钱包
            try {
              signature = await walletInfo.provider.request({
                method: 'tron_signMessage',
                params: [message, walletInfo.address]
              });
            } catch (e1) {
              try {
                signature = await walletInfo.provider.request({
                  method: 'tron_signMessageV2',
                  params: [message, walletInfo.address]
                });
              } catch (e2) {
                if (window?.tronWeb?.trx?.sign) {
                  signature = await window.tronWeb.trx.sign(message, walletInfo.address);
                } else {
                  throw e2;
                }
              }
            }
          }
          break;
      }

      // 生成 EdDSA 密钥对
      const eddsaKeyPair = generateEdDSAFromSignature(signature, walletInfo.address, walletInfo.networkType);
      console.log('Generated EdDSA key pair:', eddsaKeyPair);

      return { signature, eddsaKeyPair };
    } catch (error) {
      console.error('Signature failed:', error);
      throw error;
    }
  };

  const handleSubmitEmail = async () => {
    setIsLoading(true);
    setError('');
    try {
      await sendCode({ email });
      console.log('Code sent to:', email);
      setShowCodeVerification(true);
    } catch (error) {
      console.error('Failed to send code:', error);
      setError('Failed to send code. Please check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToWallet = () => {
    setShowCodeVerification(false);
  };

  const handleBackToWalletFromSignature = () => {
    setShowSignatureModal(false);
    setWalletInfo(null);
  };

  const handleCloseConnecting = () => {
    setShowConnectingModal(false);
    setWalletInfo(null);
  };

  const handleSignatureSuccess = (result) => {
    setSignatureData(result);
    setShowSignatureModal(false);
    setShowLoginSuccess(true);
    
    // 调用钱包登录成功的回调
    if (onWalletLoginSuccess && walletInfo) {
      onWalletLoginSuccess(walletInfo, result);
    }
  };

  const handleCloseAll = () => {
    setShowCodeVerification(false);
    setShowConnectingModal(false);
    setShowSignatureModal(false);
    setShowLoginSuccess(false);
    setWalletInfo(null);
    setSignatureData(null);
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

  // 显示等待连接弹窗
  if (showConnectingModal && walletInfo) {
    return (
      <ConnectingModal
        isOpen={true}
        onClose={handleCloseConnecting}
        onBack={handleCloseConnecting}
        walletInfo={walletInfo}
      />
    );
  }

  // 显示签名页面
  if (showSignatureModal && walletInfo) {
    return (
      <SignatureModal
        isOpen={true}
        onClose={handleCloseAll}
        onBack={handleBackToWalletFromSignature}
        walletInfo={walletInfo}
        onSignatureComplete={handleSignatureComplete}
        onSignatureSuccess={handleSignatureSuccess}
      />
    );
  }

  // 显示登录成功页面
  if (showLoginSuccess && walletInfo) {
    return (
      <LoginSuccessModal
        isOpen={true}
        onClose={handleCloseAll}
        walletInfo={walletInfo}
        signatureData={signatureData}
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
                <div className="submit-btn" onClick={handleSubmitEmail}>
                  {isLoading ? 'Sending...' : 'Submit'}
                </div>
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
          {walletsLoading ? (
            <div className="wallet-loading">
              <div className="spinner"></div>
              <span>Detecting wallets...</span>
            </div>
          ) : walletsError ? (
            <div className="wallet-error">
              <span>{walletsError}</span>
            </div>
          ) : detectedWallets.length > 0 ? (
            detectedWallets.map((wallet, index) => (
              <button
                key={wallet.id || index}
                className="wallet-option"
                onClick={() => handleWalletClick(wallet)}
              >
                <div className="wallet-icon">
                  {wallet.icon ? (
                    typeof wallet.icon === 'string' ? (
                      <img src={wallet.icon} alt={wallet.name} />
                    ) : (
                      wallet.icon
                    )
                  ) : (
                    <span className="wallet-emoji">💳</span>
                  )}
                </div>
                <span className="wallet-name">{wallet.name}</span>
              </button>
            ))
          ) : (
            <div className="no-wallets">
              <span>No {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} wallets detected</span>
              <p>Please install a compatible wallet extension</p>
            </div>
          )}
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

export default WalletModal; 
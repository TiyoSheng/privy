import { WalletConnectWallet, WalletConnectChainID } from '@tronweb3/walletconnect-tron';

// Tron WalletConnect 配置
const WALLETCONNECT_PROJECT_ID = 'a71c3dd4833c962689f02c222bc6a112';

// WalletConnect Tron wallet 实例
let walletConnectTronWallet = null;

// 初始化 Tron WalletConnect
export const initTronWalletConnect = async () => {
  try {
    if (walletConnectTronWallet) {
      return walletConnectTronWallet;
    }

    walletConnectTronWallet = new WalletConnectWallet({
      network: WalletConnectChainID.Mainnet,
      options: {
        relayUrl: 'wss://relay.walletconnect.com',
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'A2ZX Login',
          description: 'A2ZX Login Application',
          url: window.location.origin,
          icons: ['https://walletconnect.com/walletconnect-logo.svg']
        }
      },
      web3ModalConfig: {
        themeMode: 'dark',
        themeVariables: {
          '--w3m-z-index': 1000
        }
      }
    });

    console.log('Tron WalletConnect initialized successfully');
    return walletConnectTronWallet;
  } catch (error) {
    console.error('Failed to initialize Tron WalletConnect:', error);
    throw error;
  }
};

// 连接 Tron WalletConnect
export const connectTronWalletConnect = async () => {
  try {
    const wallet = await initTronWalletConnect();
    
    // 连接钱包
    const result = await wallet.connect();
    
    if (!result.address) {
      throw new Error('No address returned from Tron WalletConnect');
    }

    console.log('Tron WalletConnect connected:', result.address);
    
    return {
      provider: wallet,
      address: result.address
    };
  } catch (error) {
    console.error('Failed to connect Tron WalletConnect:', error);
    throw error;
  }
};

// 断开 Tron WalletConnect
export const disconnectTronWalletConnect = async () => {
  try {
    if (walletConnectTronWallet) {
      await walletConnectTronWallet.disconnect();
      walletConnectTronWallet = null;
      console.log('Tron WalletConnect disconnected');
    }
  } catch (error) {
    console.error('Failed to disconnect Tron WalletConnect:', error);
    throw error;
  }
};

// 获取 Tron WalletConnect wallet
export const getTronWalletConnectWallet = () => {
  return walletConnectTronWallet;
};

// 检查是否已连接
export const isTronWalletConnectConnected = () => {
  return walletConnectTronWallet && walletConnectTronWallet.connected;
}; 
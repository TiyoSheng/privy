import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Solana WalletConnect 配置
const WALLETCONNECT_PROJECT_ID = 'a71c3dd4833c962689f02c222bc6a112';

// WalletConnect Solana adapter 实例
let walletConnectSolanaAdapter = null;

// 初始化 Solana WalletConnect
export const initSolanaWalletConnect = async () => {
  try {
    if (walletConnectSolanaAdapter) {
      return walletConnectSolanaAdapter;
    }

    walletConnectSolanaAdapter = new WalletConnectWalletAdapter({
      network: WalletAdapterNetwork.Mainnet,
      options: {
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'A2ZX Login',
          description: 'A2ZX Login Application',
          url: window.location.origin,
          icons: ['https://walletconnect.com/walletconnect-logo.svg']
        }
      }
    });

    console.log('Solana WalletConnect initialized successfully');
    return walletConnectSolanaAdapter;
  } catch (error) {
    console.error('Failed to initialize Solana WalletConnect:', error);
    throw error;
  }
};

// 连接 Solana WalletConnect
export const connectSolanaWalletConnect = async () => {
  try {
    const adapter = await initSolanaWalletConnect();
    
    // 连接钱包
    await adapter.connect();
    
    if (!adapter.publicKey) {
      throw new Error('No public key returned from Solana WalletConnect');
    }

    const address = adapter.publicKey.toString();
    console.log('Solana WalletConnect connected:', address);
    
    return {
      provider: adapter,
      address: address,
      publicKey: adapter.publicKey
    };
  } catch (error) {
    console.error('Failed to connect Solana WalletConnect:', error);
    throw error;
  }
};

// 断开 Solana WalletConnect
export const disconnectSolanaWalletConnect = async () => {
  try {
    if (walletConnectSolanaAdapter) {
      await walletConnectSolanaAdapter.disconnect();
      walletConnectSolanaAdapter = null;
      console.log('Solana WalletConnect disconnected');
    }
  } catch (error) {
    console.error('Failed to disconnect Solana WalletConnect:', error);
    throw error;
  }
};

// 获取 Solana WalletConnect adapter
export const getSolanaWalletConnectAdapter = () => {
  return walletConnectSolanaAdapter;
};

// 检查是否已连接
export const isSolanaWalletConnectConnected = () => {
  return walletConnectSolanaAdapter && walletConnectSolanaAdapter.connected;
}; 
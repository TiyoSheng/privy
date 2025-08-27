import EthereumProvider from '@walletconnect/ethereum-provider';

// WalletConnect 配置
const WALLETCONNECT_PROJECT_ID = 'a71c3dd4833c962689f02c222bc6a112';

// WalletConnect provider 实例
let walletConnectProvider = null;

// 初始化 WalletConnect
export const initWalletConnect = async () => {
  try {
    if (walletConnectProvider) {
      return walletConnectProvider;
    }

    walletConnectProvider = await EthereumProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [1], // Ethereum mainnet
      optionalChains: [42161, 56, 8453, 137], // Arbitrum, BSC, Base, Polygon
      showQrModal: true,
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v4',
        'eth_requestAccounts',
        'eth_accounts',
        'eth_chainId',
        'wallet_switchEthereumChain',
        'wallet_addEthereumChain'
      ],
      events: [
        'chainChanged',
        'accountsChanged',
        'disconnect'
      ],
      metadata: {
        name: 'A2ZX Login',
        description: 'A2ZX Login Application',
        url: window.location.origin,
        icons: ['https://walletconnect.com/walletconnect-logo.svg']
      }
    });

    console.log('WalletConnect initialized successfully');
    return walletConnectProvider;
  } catch (error) {
    console.error('Failed to initialize WalletConnect:', error);
    throw error;
  }
};

// 连接 WalletConnect
export const connectWalletConnect = async () => {
  try {
    const provider = await initWalletConnect();
    
    // 启用连接
    const accounts = await provider.enable();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from WalletConnect');
    }

    console.log('WalletConnect connected:', accounts[0]);
    return {
      provider,
      address: accounts[0],
      chainId: provider.chainId
    };
  } catch (error) {
    console.error('Failed to connect WalletConnect:', error);
    throw error;
  }
};

// 断开 WalletConnect
export const disconnectWalletConnect = async () => {
  try {
    if (walletConnectProvider) {
      await walletConnectProvider.disconnect();
      walletConnectProvider = null;
      console.log('WalletConnect disconnected');
    }
  } catch (error) {
    console.error('Failed to disconnect WalletConnect:', error);
    throw error;
  }
};

// 获取 WalletConnect provider
export const getWalletConnectProvider = () => {
  return walletConnectProvider;
};

// 检查是否已连接
export const isWalletConnectConnected = () => {
  return walletConnectProvider && walletConnectProvider.connected;
}; 
// EIP-6963 测试工具
export const testEIP6963 = () => {
  console.log('Testing EIP-6963 wallet detection...');
  
  // 监听钱包发现事件
  const handleProviderFound = (event) => {
    const { detail } = event;
    console.log('EIP-6963 Wallet Found:', {
      uuid: detail.info.uuid,
      name: detail.info.name,
      icon: detail.info.icon,
      provider: detail.provider
    });
  };

  // 添加事件监听器
  window.addEventListener('eip6963:announceProvider', handleProviderFound);
  
  // 请求钱包信息
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  
  console.log('EIP-6963 request sent. Waiting for wallet responses...');
  
  // 5秒后移除监听器
  setTimeout(() => {
    window.removeEventListener('eip6963:announceProvider', handleProviderFound);
    console.log('EIP-6963 test completed.');
  }, 5000);
};

// 测试常见钱包检测
export const testCommonWallets = () => {
  console.log('Testing common wallet detection...');
  
  const wallets = {
    metamask: window.ethereum && window.ethereum.isMetaMask,
    coinbase: window.ethereum && window.ethereum.isCoinbaseWallet,
    walletconnect: !!window.WalletConnect,
    okx: !!window.okxwallet,
    ouro: !!window.ouro,
    phantom: window.solana && window.solana.isPhantom,
    solflare: !!window.solflare,
    backpack: !!window.backpack,
    tronlink: !!window.tronWeb,
    tokenpocket: !!(window.tokenpocket && window.tokenpocket.tron)
  };
  
  console.log('Detected wallets:', wallets);
  return wallets;
};

// 在开发环境中自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保页面加载完成
  setTimeout(() => {
    testEIP6963();
    testCommonWallets();
  }, 2000);
} 
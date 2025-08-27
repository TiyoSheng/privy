import { useState, useEffect } from 'react';
import { initWalletConnect } from '../utils/walletConnect';
import { initSolanaWalletConnect } from '../utils/walletConnectSolana';
import { initTronWalletConnect } from '../utils/walletConnectTron';
import { detectTronWallets } from '../utils/tron-wallets';
import { getWallets } from '@wallet-standard/app';

import WallerConnectIcon from '../assets/wc.png';
import OkxIcon from '../assets/okx.png';
// 钱包检测缓存，避免重复检测
let walletCache = new Map();
let cacheTime = 0;
const CACHE_DURATION = 30000; // 30秒缓存

// EIP-6963 钱包检测
const detectEVMWallets = () => {
  return new Promise((resolve) => {
    const wallets = [];

    // 监听 EIP-6963 事件
    const handleProviderFound = (event) => {
      const { detail } = event;
      // 标准化钱包名称用于去重
      const normalizedName = detail.info.name.toLowerCase().replace(/\s+/g, '');

      wallets.push({
        id: detail.info.uuid,
        name: detail.info.name,
        icon: detail.info.icon,
        type: 'evm',
        provider: detail.provider,
        normalizedName,
        detectionMethod: 'eip6963'
      });
    };

    // 监听钱包发现事件
    window.addEventListener('eip6963:announceProvider', handleProviderFound);

    // 请求钱包信息
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // 延迟返回结果，给钱包一些时间响应
    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', handleProviderFound);
      resolve(wallets);
    }, 500); // 减少等待时间
  });
};

const dedupeWallets = (wallets) => {
  const seen = new Set();
  return wallets.filter((w) => {
    if (seen.has(w.url)) return false; // 或者用 w.name
    seen.add(w.url);
    return true;
  });
};

// 检测Solana钱包
const detectSolanaWallets = async () => {
  const wallets = [];

  // 1. 检测 Solana Wallet Standard 钱包 (最高优先级)
  try {
    const walletsAPI = getWallets();
    const standardWallets = dedupeWallets(walletsAPI.get());
    console.log("standardWallets", standardWallets);
    standardWallets.forEach((wallet) => {
      const walletInfo = {
        id: wallet.name.toLowerCase().replace(/\s+/g, ''),
        name: wallet.name,
        features: wallet.features,
        chains: wallet.chains,
        accounts: wallet.accounts,
        icon: wallet.icon,
        type: 'solana',
        provider: wallet,
        normalizedName: wallet.name.toLowerCase().replace(/\s+/g, ''),
        detectionMethod: 'wallet-standard'
      }
      wallets.push(walletInfo);
    });
  } catch (error) {
    console.warn('Wallet Standard detection failed:', error);
  }

  // WalletConnect Solana - 总是添加（作为连接选项）
  try {
    const adapter = await initSolanaWalletConnect();
    wallets.push({
      id: 'walletconnect-solana',
      name: 'WalletConnect',
      icon: WallerConnectIcon,
      type: 'solana',
      provider: adapter,
      normalizedName: 'walletconnect',
      detectionMethod: 'walletconnect',
      isWalletConnect: true
    });
  } catch (error) {
    console.warn('Failed to initialize Solana WalletConnect:', error);
    // 仍然添加 WalletConnect 选项，但标记为不可用
    wallets.push({
      id: 'walletconnect-solana',
      name: 'WalletConnect',
      icon: WallerConnectIcon,
      type: 'solana',
      provider: null,
      normalizedName: 'walletconnect',
      detectionMethod: 'walletconnect',
      isWalletConnect: true,
      disabled: true
    });
  }

  return wallets;
};

// 检测TRON钱包
const detectTRONWallets = async () => {
  const wallets = [];

  // 使用新的 Tron 钱包适配器进行检测
  const detectedAdapters = detectTronWallets();
  
  // 将适配器转换为钱包对象
  detectedAdapters.forEach(adapter => {
    wallets.push({
      id: adapter.id,
      name: adapter.name,
      icon: getTronWalletIcon(adapter.id),
      type: 'tron',
      provider: adapter,
      normalizedName: adapter.id,
      detectionMethod: 'adapter',
      ready: true,
      adapter: adapter // 保存适配器实例
    });
  });

  // WalletConnect Tron - 总是添加（作为连接选项）
  try {
    const wallet = await initTronWalletConnect();
    wallets.push({
      id: 'walletconnect-tron',
      name: 'WalletConnect',
      icon: WallerConnectIcon,
      type: 'tron',
      provider: wallet,
      normalizedName: 'walletconnect',
      detectionMethod: 'walletconnect',
      isWalletConnect: true
    });
  } catch (error) {
    console.warn('Failed to initialize Tron WalletConnect:', error);
    // 仍然添加 WalletConnect 选项，但标记为不可用
    wallets.push({
      id: 'walletconnect-tron',
      name: 'WalletConnect',
      icon: WallerConnectIcon,
      type: 'tron',
      provider: null,
      normalizedName: 'walletconnect',
      detectionMethod: 'walletconnect',
      isWalletConnect: true,
      disabled: true
    });
  }

  return wallets;
};

// 获取 Tron 钱包图标
const getTronWalletIcon = (walletId) => {
  const iconMap = {
    'tronlink': 'https://www.tronlink.org/static/media/logo.bec4d75f.png',
    'okx': OkxIcon,
    'bitget': 'https://www.bitget.com/favicon.ico',
    'mathwallet': 'https://mathwallet.org/images/logo.png'
  };
  return iconMap[walletId] || 'https://tron.network/favicon.ico';
};

// 智能去重函数
const deduplicateWallets = (wallets) => {
  const seen = new Set();
  const result = [];

  // 按优先级排序：wallet-standard > EIP-6963 > direct detection
  const sortedWallets = wallets.sort((a, b) => {
    if (a.detectionMethod === 'wallet-standard' && b.detectionMethod !== 'wallet-standard') return -1;
    if (a.detectionMethod !== 'wallet-standard' && b.detectionMethod === 'wallet-standard') return 1;
    if (a.detectionMethod === 'eip6963' && b.detectionMethod !== 'eip6963') return -1;
    if (a.detectionMethod !== 'eip6963' && b.detectionMethod === 'eip6963') return 1;
    return 0;
  });

  for (const wallet of sortedWallets) {
    const key = wallet.normalizedName || wallet.name.toLowerCase().replace(/\s+/g, '');

    if (!seen.has(key)) {
      seen.add(key);
      result.push({
        ...wallet,
        // 确保有规范化的名称
        normalizedName: key
      });
    }
  }

  return result;
};

export const useWalletDetection = (networkType) => {
  const [wallets, setWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectWallets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 检查缓存
        const now = Date.now();
        const cacheKey = `${networkType}_wallets`;

        if (walletCache.has(cacheKey) && (now - cacheTime) < CACHE_DURATION) {
          setWallets(walletCache.get(cacheKey));
          setIsLoading(false);
          return;
        }

        let detectedWallets = [];

        switch (networkType) {
          case 'evm':
            // 并行检测EIP-6963和常见钱包
            const [eip6963Wallets] = await Promise.all([
              detectEVMWallets()
            ]);

            // 合并并智能去重
            const allEVMWallets = [...eip6963Wallets];
            detectedWallets = deduplicateWallets(allEVMWallets);
            break;

          case 'solana':
            detectedWallets = await detectSolanaWallets();
            break;

          case 'tron':
            detectedWallets = await detectTRONWallets();
            break;

          default:
            detectedWallets = [];
        }

        // 过滤无效钱包
        detectedWallets = detectedWallets.filter(wallet =>
          wallet.provider &&
          wallet.name &&
          wallet.id
        );

        // 缓存结果
        walletCache.set(cacheKey, detectedWallets);
        cacheTime = now;

        // 调试信息
        console.log(`[WalletDetection] ${networkType.toUpperCase()} wallets detected:`, detectedWallets.map(w => ({
          id: w.id,
          name: w.name,
          method: w.detectionMethod,
          hasProvider: !!w.provider
        })));

        setWallets(detectedWallets);
      } catch (err) {
        console.error('Error detecting wallets:', err);
        setError('Failed to detect wallets');
      } finally {
        setIsLoading(false);
      }
    };

    detectWallets();
  }, [networkType]);

  // 清除缓存的函数（用于测试）
  const clearCache = () => {
    walletCache.clear();
    cacheTime = 0;
  };

  return { wallets, isLoading, error, clearCache };
}; 
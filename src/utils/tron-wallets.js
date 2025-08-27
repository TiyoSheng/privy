// tron-wallets.js
// 统一探测 + 连接 + 签名（TronLink / OKX Wallet / Bitget / MathWallet）

/**
 * @typedef {'tronlink' | 'okx' | 'bitget' | 'mathwallet'} TronWalletId
 */

/**
 * @typedef {Object} TronWalletAdapter
 * @property {TronWalletId} id - 钱包ID
 * @property {string} name - 钱包名称
 * @property {function(): boolean} detect - 检测钱包是否可用
 * @property {function(): Promise<void>} connect - 连接钱包
 * @property {function(): any} getTronWeb - 获取 tronWeb 实例
 * @property {function(): Promise<{base58?: string, hex?: string}>} getAddress - 获取地址
 * @property {function(string): Promise<string>} signMessage - 签名消息，返回 hex 编码的签名
 */

function isHex(str) {
  return /^0x[0-9a-fA-F]+$/.test(str);
}

// 确保 window 对象存在（SSR 兼容）
const getWindow = () => {
  if (typeof window !== 'undefined') {
    return window;
  }
  return {};
};

// —— 各钱包适配器 ——

// TronLink（官方）
const tronLinkAdapter = {
  id: 'tronlink',
  name: 'TronLink',
  detect() {
    const w = getWindow();
    // TronLink 注入 window.tronLink + tronWeb
    // 可能和 Bitget 共用 tronLink，对 Bitget 专门用 window.isBitKeep 区分
    return typeof w.tronLink !== 'undefined'
      && !w.isBitKeep; // 防止和 Bitget 冲突
  },
  async connect() {
    const w = getWindow();
    const { tronLink } = w;
    if (!tronLink?.request) throw new Error('TronLink not available');
    // 新版推荐：tron_requestAccounts
    const res = await tronLink.request({ method: 'tron_requestAccounts' });
    // TronLink 文档约定 code===200 代表成功
    if (res?.code !== 200) throw new Error(`TronLink connect failed: ${JSON.stringify(res)}`);
  },
  getTronWeb() {
    const w = getWindow();
    const { tronLink } = w;
    return tronLink?.tronWeb ?? w.tronWeb;
  },
  async getAddress() {
    const tronWeb = this.getTronWeb();
    const base58 = tronWeb?.defaultAddress?.base58;
    const hex = tronWeb?.defaultAddress?.hex;
    return { base58, hex };
  },
  async signMessage(msg) {
    const tronWeb = this.getTronWeb();
    if (!tronWeb?.trx?.sign) throw new Error('tronWeb.trx.sign not available');
    const hexMsg = isHex(msg) ? msg : tronWeb.toHex(msg);
    return await tronWeb.trx.sign(hexMsg);
  },
};

// Bitget (BitKeep) —— 复用 tronLink API，并通过 isBitKeep 标识
const bitgetAdapter = {
  id: 'bitget',
  name: 'Bitget Wallet',
  detect() {
    const w = getWindow();
    // 官方建议：window.tronLink && window.isBitKeep === true
    return !!w.tronLink && w.isBitKeep === true;
  },
  async connect() {
    const w = getWindow();
    const { tronLink } = w;
    if (!tronLink?.request) throw new Error('Bitget tronLink provider not available');
    const res = await tronLink.request({ method: 'tron_requestAccounts' });
    if (res?.code !== 200) throw new Error(`Bitget connect failed: ${JSON.stringify(res)}`);
  },
  getTronWeb() {
    const w = getWindow();
    const { tronLink } = w;
    return tronLink?.tronWeb ?? w.tronWeb;
  },
  async getAddress() {
    const tronWeb = this.getTronWeb();
    return {
      base58: tronWeb?.defaultAddress?.base58,
      hex: tronWeb?.defaultAddress?.hex,
    };
  },
  async signMessage(msg) {
    const tronWeb = this.getTronWeb();
    if (!tronWeb?.trx?.sign) throw new Error('tronWeb.trx.sign not available');
    const hexMsg = isHex(msg) ? msg : tronWeb.toHex(msg);
    return await tronWeb.trx.sign(hexMsg);
  },
};

// OKX Wallet —— 专有命名空间：window.okxwallet.tronLink.*
const okxAdapter = {
  id: 'okx',
  name: 'OKX Wallet',
  detect() {
    const w = getWindow();
    return !!w.okxwallet?.tronLink;
  },
  async connect() {
    const w = getWindow();
    const okx = w.okxwallet?.tronLink;
    if (!okx?.request) throw new Error('OKX tron provider not available');
    // 与 TronLink 对齐的方法名
    const res = await okx.request({ method: 'tron_requestAccounts' });
    // OKX 文档：对齐 TronLink 行为
    if (res?.code !== 200) throw new Error(`OKX connect failed: ${JSON.stringify(res)}`);
  },
  getTronWeb() {
    const w = getWindow();
    return w.okxwallet?.tronLink?.tronWeb;
  },
  async getAddress() {
    const tronWeb = this.getTronWeb();
    return {
      base58: tronWeb?.defaultAddress?.base58,
      hex: tronWeb?.defaultAddress?.hex,
    };
  },
  async signMessage(msg) {
    const tronWeb = this.getTronWeb();
    if (!tronWeb?.trx?.sign) throw new Error('tronWeb.trx.sign not available');
    const hexMsg = isHex(msg) ? msg : tronWeb.toHex(msg);
    return await tronWeb.trx.sign(hexMsg);
  },
};

// MathWallet —— 注入 window.tronWeb，可能也有 window.mathwallet 标识
const mathAdapter = {
  id: 'mathwallet',
  name: 'MathWallet',
  detect() {
    const w = getWindow();
    // MathWallet 支持 Tron，通常会有 window.tronWeb；用 window.mathwallet 提高置信度
    return !!w.tronWeb && (!!w.mathwallet || !!w.solana?.isMathWallet || !!w.ethereum?.isMathWallet);
  },
  async connect() {
    // MathWallet 的 Tron 场景一般不需要显式 request；若未来支持，可在这里补充
    // 直接读取 tronWeb 即可
    const tronWeb = this.getTronWeb();
    if (!tronWeb) throw new Error('MathWallet tronWeb not available');
  },
  getTronWeb() {
    const w = getWindow();
    return w.tronWeb;
  },
  async getAddress() {
    const tronWeb = this.getTronWeb();
    return {
      base58: tronWeb?.defaultAddress?.base58,
      hex: tronWeb?.defaultAddress?.hex,
    };
  },
  async signMessage(msg) {
    const tronWeb = this.getTronWeb();
    if (!tronWeb?.trx?.sign) throw new Error('tronWeb.trx.sign not available');
    const hexMsg = isHex(msg) ? msg : tronWeb.toHex(msg);
    return await tronWeb.trx.sign(hexMsg);
  },
};

// —— 管理器 ——

// 探测顺序可按你期望的优先级调整
const ALL_ADAPTERS = [
  okxAdapter,
  bitgetAdapter,
  tronLinkAdapter,
  mathAdapter,
];

/**
 * 检测可用的 Tron 钱包
 * @returns {TronWalletAdapter[]} 可用的钱包适配器列表
 */
export function detectTronWallets() {
  // 只返回"确实注入"的，并用 id 去重
  const found = {};
  for (const a of ALL_ADAPTERS) {
    try {
      if (a.detect() && !found[a.id]) found[a.id] = a;
    } catch {}
  }
  return Object.values(found);
}

/**
 * 连接 Tron 钱包
 * @param {TronWalletId} preferred - 优先连接的钱包ID
 * @returns {Promise<Object>} 连接结果，包含钱包信息和签名方法
 */
export async function connectTronWallet(preferred) {
  const wallets = detectTronWallets();
  if (!wallets.length) throw new Error('未检测到 Tron 浏览器钱包');

  let target = preferred ? wallets.find(w => w.id === preferred) : wallets[0];
  if (!target) target = wallets[0];

  await target.connect();

  const tronWeb = target.getTronWeb();
  if (!tronWeb) throw new Error('连接成功但未拿到 tronWeb 实例');

  const { base58, hex } = await target.getAddress();
  if (!base58 && !hex) {
    // 可能需要等待钱包完成地址注入
    await new Promise(res => setTimeout(res, 300));
  }

  const addrBase58 = tronWeb?.defaultAddress?.base58;
  const addrHex = tronWeb?.defaultAddress?.hex;

  return {
    id: target.id,
    name: target.name,
    tronWeb,
    address: { base58: addrBase58, hex: addrHex },
    // 统一签名方法（自动转 hex）
    async signMessage(message) {
      const hexMsg = isHex(message) ? message : tronWeb.toHex(message);
      return await tronWeb.trx.sign(hexMsg);
    },
    // 事件监听（账号/网络变更），TronLink & OKX & Bitget 都走 postMessage 协议
    on(event, handler) {
      const w = getWindow();
      const listener = (e) => {
        const m = e?.data?.message;
        if (!m?.action) return;
        if (event === 'accountsChanged' && m.action === 'accountsChanged') {
          // 可能返回 { address: string } 或 false
          const addr = m?.data?.address;
          if (addr && typeof addr === 'string') handler({ address: addr });
          else handler({ address: null });
        } else if (event === 'setNode' && m.action === 'setNode') {
          handler(m?.data ?? {});
        }
      };
      w.addEventListener('message', listener);
      return () => w.removeEventListener('message', listener);
    },
  };
}

// 导出适配器供单独使用
export {
  tronLinkAdapter,
  bitgetAdapter,
  okxAdapter,
  mathAdapter,
  ALL_ADAPTERS
}; 
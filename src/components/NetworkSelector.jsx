import React, { useState } from 'react';

// Import network icons from Figma assets
import EthereumIcon from '../assets/images/ic-outlined.svg';
import ArrowIcon from '../assets/images/arrow.svg';
import SolanaIcon from '../assets/images/ic-outlined-4.svg';
import TronIcon from '../assets/images/ic-outlined-5.svg';
import CheckIcon from '../assets/images/chack.svg';
import ArbitrumIcon from '../assets/images/ic-outlined-1.svg';
import BnbIcon from '../assets/images/ic-outlined-2.svg';
import BaseIcon from '../assets/images/ic-outlined-3.svg';
import HyMatrixIcon from '../assets/images/ic-outlined-6.svg';


const networks = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: EthereumIcon,
    category: 'evm',
    description: 'Ethereum Mainnet',
    color: '#627EEA'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    icon: ArbitrumIcon, // Placeholder - could be replaced with actual Arbitrum icon
    category: 'evm',
    description: 'Arbitrum One',
    color: '#28A0F0'
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    icon: BnbIcon, // Placeholder - could be replaced with actual BNB icon
    category: 'evm',
    description: 'BNB Smart Chain',
    color: '#F3BA2F'
  },
  {
    id: 'base',
    name: 'Base',
    icon: BaseIcon, // Placeholder - could be replaced with actual Base icon
    category: 'evm',
    description: 'Base Network',
    color: '#0052FF'
  },
  {
    id: 'solana',
    name: 'Solana',
    icon: SolanaIcon,
    category: 'solana',
    description: 'Solana Mainnet',
    color: '#9945FF'
  },
  {
    id: 'tron',
    name: 'Tron',
    icon: TronIcon,
    category: 'tron',
    description: 'TRON Network',
    color: '#FF060A'
  },
  {
    id: 'hymatrix',
    name: 'HyMatrix',
    icon: HyMatrixIcon, // Placeholder - could be replaced with actual HyMatrix icon
    category: 'custom',
    description: 'HyMatrix Network',
    color: '#7C3AED'
  }
];

function NetworkSelector({ selectedNetwork = 'ethereum', onNetworkChange, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedNetworkData = networks.find(network => network.id === selectedNetwork) || networks[0];

  const handleNetworkSelect = (networkId) => {
    onNetworkChange?.(networkId);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (compact) {
    return (
      <div className="network-selector-compact">
        <div className="network-dropdown" onClick={toggleDropdown}>
          <button className="network-dropdown-trigger">
            <div className="network-icon">
              {typeof selectedNetworkData.icon === 'string' ? (
                selectedNetworkData.icon.startsWith('/') || selectedNetworkData.icon.endsWith('.svg') ? (
                  <img src={selectedNetworkData.icon} alt={selectedNetworkData.name} className="network-icon-img" />
                ) : (
                  <img src={selectedNetworkData.icon} alt={selectedNetworkData.name} className="network-icon-img" />
                )
              ) : (
                <img src={selectedNetworkData.icon} alt={selectedNetworkData.name} className="network-icon-img" />
              )}
            </div>
            <span className="network-name">{selectedNetworkData.name}</span>
            <div className="dropdown-arrow">
              <img src={ArrowIcon} alt="dropdown arrow" />
            </div>
          </button>
          
          {isOpen && (
            <div className="network-dropdown-menu">
              <div className="network-category-title">EVM Compatible Networks</div>
              {networks.filter(network => network.category === 'evm').map((network) => (
                <button
                  key={network.id}
                  className={`network-dropdown-item ${selectedNetwork === network.id ? 'selected' : ''}`}
                  onClick={() => handleNetworkSelect(network.id)}
                >
                  <div className="network-icon">
                    {typeof network.icon === 'string' ? (
                      network.icon.startsWith('/') || network.icon.endsWith('.svg') ? (
                        <img src={network.icon} alt={network.name} className="network-icon-img" />
                      ) : (
                        <img src={network.icon} alt={network.name} className="network-icon-img" />
                      )
                    ) : (
                      <img src={network.icon} alt={network.name} className="network-icon-img" />
                    )}
                  </div>
                  <div className="network-info">
                    <div className="network-name">{network.name}</div>
                  </div>
                  {selectedNetwork === network.id && (
                    <div className="network-check">
                      <img src={CheckIcon} alt="selected" />
                    </div>
                  )}
                </button>
              ))}
              
              {/* Add divider for non-EVM networks */}
              <div className="network-divider"></div>
              
              {networks.filter(network => network.category !== 'evm').map((network) => (
                <button
                  key={network.id}
                  className={`network-dropdown-item ${selectedNetwork === network.id ? 'selected' : ''}`}
                  onClick={() => handleNetworkSelect(network.id)}
                >
                  <div className="network-icon">
                    {typeof network.icon === 'string' ? (
                      network.icon.startsWith('/') || network.icon.endsWith('.svg') ? (
                        <img src={network.icon} alt={network.name} className="network-icon-img" />
                      ) : (
                        <img src={network.icon} alt={network.name} className="network-icon-img" />
                      )
                    ) : (
                      <img src={network.icon} alt={network.name} className="network-icon-img" />
                    )}
                  </div>
                  <div className="network-info">
                    <div className="network-name">{network.name}</div>
                  </div>
                  {selectedNetwork === network.id && (
                    <div className="network-check">
                      <img src={CheckIcon} alt="selected" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Overlay to close dropdown when clicking outside */}
        {isOpen && (
          <div 
            className="network-dropdown-overlay" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  // Full network selector (non-compact mode)
  return (
    <div className="network-selector">
      <h3 className="network-title">Select Network</h3>
      <div className="network-options">
        {networks.map((network) => (
          <button
            key={network.id}
            className={`network-option ${selectedNetwork === network.id ? 'selected' : ''}`}
            onClick={() => handleNetworkSelect(network.id)}
          >
            <div className="network-icon">
              {typeof network.icon === 'string' ? (
                network.icon.startsWith('/') || network.icon.endsWith('.svg') ? (
                  <img src={network.icon} alt={network.name} className="network-icon-img" />
                ) : (
                  <span className="network-emoji">{network.icon}</span>
                )
              ) : (
                <img src={network.icon} alt={network.name} className="network-icon-img" />
              )}
            </div>
            <div className="network-info">
              <div className="network-name">{network.name}</div>
              <div className="network-description">{network.description}</div>
            </div>
            {selectedNetwork === network.id && (
              <div className="network-check">
                <img src={CheckIcon} alt="selected" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default NetworkSelector; 
import React from 'react';
import { CloseIcon } from '../icons';

// 登录成功页面组件
function LoginSuccessModal({ isOpen, onClose, walletInfo, signatureData }) {
  if (!isOpen) return null;

  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getNetworkDisplayName = (networkType) => {
    const networkNames = {
      'evm': 'Ethereum',
      'solana': 'Solana',
      'tron': 'TRON'
    };
    return networkNames[networkType] || networkType;
  };

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal login-success-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Close Button */}
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Success Icon */}
        <div className="success-icon-container">
          <div className="success-checkmark">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#10b981"/>
              <path d="M20 30.5L14 24.5L15.4 23.1L20 27.7L32.6 15.1L34 16.5L20 30.5Z" fill="white"/>
            </svg>
          </div>
        </div>

        {/* Success Title */}
        <div className="success-title">
          <h2>Successfully Connected!</h2>
        </div>

        {/* Success Description */}
        <div className="success-description">
          <p>Your wallet has been successfully connected and verified.</p>
        </div>

        {/* Wallet Information */}
        <div className="wallet-info-section">
          <div className="wallet-info-card">
            <div className="wallet-info-header">
              <div className="wallet-icon-small">
                {walletInfo?.icon ? (
                  typeof walletInfo.icon === 'string' ? (
                    <img src={walletInfo.icon} alt={walletInfo.name} />
                  ) : (
                    walletInfo.icon
                  )
                ) : (
                  <span className="wallet-emoji">💳</span>
                )}
              </div>
              <div className="wallet-details">
                <h3>{walletInfo?.name || 'Wallet'}</h3>
                <span className="network-badge">{getNetworkDisplayName(walletInfo?.networkType)}</span>
              </div>
            </div>
            
            <div className="address-info">
              <span className="address-label">Address:</span>
              <span className="address-value">{formatAddress(walletInfo?.address)}</span>
            </div>
          </div>
        </div>

        {/* Signature Preview */}
        {signatureData && (
          <div className="signature-preview">
            <div className="signature-label">Signature:</div>
            <div className="signature-text">
              {signatureData.signature && signatureData.signature.length > 20 
                ? `${signatureData.signature.slice(0, 10)}...${signatureData.signature.slice(-10)}`
                : signatureData.signature
              }
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="success-actions">
          <button className="primary-action-btn" onClick={onClose}>
            Continue to Dashboard
          </button>
          <button className="secondary-action-btn" onClick={onClose}>
            Close
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

export default LoginSuccessModal; 
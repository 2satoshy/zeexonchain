import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Wallet, 
  Sparkles, 
  Mail, 
  Smartphone, 
  Key, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  LogOut, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useConnect, useDisconnect, useAccount } from 'wagmi';
import { 
  useCurrentUser, 
  useEvmAddress, 
  useSignInWithEmail, 
  useVerifyEmailOTP, 
  useSignInWithSms, 
  useVerifySmsOTP, 
  useSignOut 
} from '@coinbase/cdp-hooks';
import { 
  SignInModal, 
  SignInModalTrigger, 
  AuthButton, 
  SignOutButton 
} from '@coinbase/cdp-react';
import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { baseAccountSDK } from '../services/baseAccount';
import { UNISWAP_V3_ADDRESSES } from '../data/tokenData';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'base' | 'metamask' | 'coinbase';
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'base'
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'metamask' | 'coinbase'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);
  
  // Wagmi state
  const { connectors, connect, isPending: isWagmiPending, error: wagmiError } = useConnect();
  const { address: wagmiAddress, isConnected: isWagmiConnected, connector: activeConnector } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();

  // Coinbase CDP state
  const { currentUser } = useCurrentUser();
  const { evmAddress: cdpAddress } = useEvmAddress();
  const { signOut: signOutCdp } = useSignOut();

  // Coinbase Email OTP flow state
  const [email, setEmail] = useState('');
  const [emailFlowId, setEmailFlowId] = useState<string | null>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();

  // Coinbase SMS OTP flow state
  const [phone, setPhone] = useState('+1');
  const [smsFlowId, setSmsFlowId] = useState<string | null>(null);
  const [smsOtp, setSmsOtp] = useState('');
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [isSmsVerifying, setIsSmsVerifying] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [smsSuccess, setSmsSuccess] = useState(false);

  const { signInWithSms } = useSignInWithSms();
  const { verifySmsOTP } = useVerifySmsOTP();

  // General state
  const [copied, setCopied] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [coinbaseSubMode, setCoinbaseSubMode] = useState<'modal' | 'email' | 'sms' | 'wallet'>('modal');

  if (!isOpen) return null;

  // Active address resolution
  const activeAddress = wagmiAddress || cdpAddress || currentUser?.evmAccountObjects?.[0]?.address;
  const isAnyConnected = Boolean(isWagmiConnected || cdpAddress || currentUser?.evmAccountObjects?.length);

  // Determine current connected provider name
  const currentProviderName = (() => {
    if (isWagmiConnected && activeConnector) {
      const id = activeConnector.id?.toLowerCase() || '';
      const name = activeConnector.name?.toLowerCase() || '';
      if (id.includes('base') || name.includes('base')) return 'Base Account (Passkey)';
      if (id.includes('metamask') || name.includes('metamask')) return 'MetaMask';
      if (id.includes('coinbase') || name.includes('coinbase')) return 'Coinbase Smart Wallet';
      return activeConnector.name || 'Web3 Injected Wallet';
    }
    if (cdpAddress || currentUser) {
      if (currentUser?.authenticationMethods?.email?.email) return `Coinbase Email (${currentUser.authenticationMethods.email.email})`;
      if (currentUser?.authenticationMethods?.sms?.phoneNumber) return `Coinbase SMS (${currentUser.authenticationMethods.sms.phoneNumber})`;
      return 'Coinbase CDP Embedded Wallet';
    }
    return null;
  })();

  // Handlers for Base Account
  const handleConnectBase = async () => {
    try {
      setConnectionMessage('Opening Base Account passkey authorization...');
      // 1. First find Wagmi's baseAccount connector
      const baseConnector = connectors.find(
        (c) => c.id === 'baseAccount' || c.name.toLowerCase().includes('base')
      );

      if (baseConnector) {
        connect({ connector: baseConnector });
        setConnectionMessage('Connected with Base Account!');
        setTimeout(() => setConnectionMessage(null), 2500);
      } else {
        // Fallback to baseAccountSDK directly
        const provider = baseAccountSDK.getProvider();
        await provider.request({ method: 'wallet_connect' });
        setConnectionMessage('Base Account connected via SDK!');
        setTimeout(() => setConnectionMessage(null), 2500);
      }
    } catch (err: any) {
      console.warn('Base Account connection error:', err);
      setConnectionMessage(`Base authorization: ${err.message || 'Cancelled'}`);
      setTimeout(() => setConnectionMessage(null), 4000);
    }
  };

  // Handlers for MetaMask
  const handleConnectMetaMask = async () => {
    try {
      setConnectionMessage('Connecting to MetaMask...');
      const mmConnector = connectors.find(
        (c) => c.id === 'metaMaskSDK' || c.name.toLowerCase().includes('metamask')
      ) || connectors.find((c) => c.id === 'injected');

      if (mmConnector) {
        connect({ connector: mmConnector });
        setConnectionMessage('MetaMask connection approved!');
        setTimeout(() => setConnectionMessage(null), 2500);
      } else {
        setConnectionMessage('No MetaMask extension detected. Please install MetaMask or use another wallet.');
        setTimeout(() => setConnectionMessage(null), 4000);
      }
    } catch (err: any) {
      console.warn('MetaMask connect error:', err);
      setConnectionMessage(`MetaMask: ${err.message || 'Cancelled'}`);
      setTimeout(() => setConnectionMessage(null), 4000);
    }
  };

  // Handlers for Coinbase Wallet SDK (Extension/App)
  const handleConnectCoinbaseWalletSDK = async () => {
    try {
      setConnectionMessage('Opening Coinbase Wallet...');
      const cbConnector = connectors.find(
        (c) => c.id === 'coinbaseWalletSDK' || c.name.toLowerCase().includes('coinbase')
      );

      if (cbConnector) {
        connect({ connector: cbConnector });
        setConnectionMessage('Coinbase Wallet connected!');
        setTimeout(() => setConnectionMessage(null), 2500);
      }
    } catch (err: any) {
      setConnectionMessage(`Coinbase Wallet: ${err.message || 'Cancelled'}`);
      setTimeout(() => setConnectionMessage(null), 4000);
    }
  };

  // Handlers for Email OTP
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    try {
      setIsEmailSending(true);
      setEmailError(null);
      const res = await signInWithEmail({ email });
      setEmailFlowId(res.flowId);
      setEmailSuccess(true);
    } catch (err: any) {
      setEmailError(err?.message || 'Failed to send verification email. Try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFlowId || !emailOtp || emailOtp.length < 6) {
      setEmailError('Please enter the 6-digit OTP from your email.');
      return;
    }
    try {
      setIsEmailVerifying(true);
      setEmailError(null);
      await verifyEmailOTP({ flowId: emailFlowId, otp: emailOtp });
      setConnectionMessage('Successfully authenticated with Coinbase via Email!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setEmailError(err?.message || 'Invalid or expired OTP code. Please retry.');
    } finally {
      setIsEmailVerifying(false);
    }
  };

  // Handlers for SMS OTP
  const handleSendSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 7) {
      setSmsError('Please enter a valid phone number with country code (e.g. +12025550143 or +263771234567).');
      return;
    }
    try {
      setIsSmsSending(true);
      setSmsError(null);
      const res = await signInWithSms({ phoneNumber: phone });
      setSmsFlowId(res.flowId);
      setSmsSuccess(true);
    } catch (err: any) {
      setSmsError(err?.message || 'Failed to send SMS code. Please verify the phone number format.');
    } finally {
      setIsSmsSending(false);
    }
  };

  const handleVerifySmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsFlowId || !smsOtp || smsOtp.length < 6) {
      setSmsError('Please enter the 6-digit OTP received via SMS.');
      return;
    }
    try {
      setIsSmsVerifying(true);
      setSmsError(null);
      await verifySmsOTP({ flowId: smsFlowId, otp: smsOtp });
      setConnectionMessage('Successfully authenticated with Coinbase via SMS!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setSmsError(err?.message || 'Invalid or expired SMS OTP code. Please retry.');
    } finally {
      setIsSmsVerifying(false);
    }
  };

  // Global Disconnect / Sign Out
  const handleDisconnectAll = async () => {
    try {
      if (isWagmiConnected) {
        disconnectWagmi();
      }
      if (cdpAddress || currentUser) {
        try {
          await signOutCdp();
        } catch {
          // ignore signout errors
        }
      }
      setConnectionMessage('Disconnected successfully.');
      setTimeout(() => setConnectionMessage(null), 2000);
    } catch (err: any) {
      console.warn('Disconnect error:', err);
    }
  };

  const handleCopy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Sign In & Connect Wallet
              </h2>
              <p className="text-xs text-slate-500">
                Choose Base Account, MetaMask, or Coinbase (Email / SMS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Connected Banner if an account is already linked */}
        {isAnyConnected && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-emerald-950 truncate">
                    {currentProviderName || 'Wallet Connected'}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full">
                    Base L2
                  </span>
                </div>
                {activeAddress && (
                  <div className="text-[11px] font-mono text-emerald-700 truncate">
                    {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {activeAddress && (
                <button
                  onClick={handleCopy}
                  title="Copy address"
                  className="p-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px] font-medium">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                onClick={handleDisconnectAll}
                className="p-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                title="Disconnect from app"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}

        {/* Status Message / Notification */}
        {connectionMessage && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 bg-blue-50 text-blue-900 text-xs rounded-xl border border-blue-200 flex items-center space-x-2 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{connectionMessage}</span>
          </div>
        )}

        {wagmiError && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Connection Note: </strong>
              <span>{wagmiError.message}</span>
            </div>
          </div>
        )}

        {/* Provider Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('base')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'base'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">🔵</span>
              <span className="truncate">Base Account</span>
            </button>
            <button
              onClick={() => setActiveTab('metamask')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'metamask'
                  ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">🦊</span>
              <span className="truncate">MetaMask</span>
            </button>
            <button
              onClick={() => setActiveTab('coinbase')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'coinbase'
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">🔷</span>
              <span className="truncate">Coinbase (Email/SMS)</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: Base Account */}
          {activeTab === 'base' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔵</span>
                  <h3 className="font-bold text-sm text-slate-900">Sign in with Base Account</h3>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Passkey 1-Tap
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Base Account uses smart contract accounts powered by device FaceID / TouchID passkeys. No seed phrases, gasless micro-settlements, and instant access to Base Sepolia.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Official Base UI Sign In button */}
                <div className="flex justify-center p-2">
                  <SignInWithBaseButton
                    align="center"
                    variant="solid"
                    colorScheme="light"
                    size="large"
                    onClick={handleConnectBase}
                  />
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-slate-400">or connect using Wagmi connector</span>
                </div>

                <button
                  onClick={handleConnectBase}
                  disabled={isWagmiPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {isWagmiPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Requesting Passkey...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Sign in with Base Passkey</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Base Account Security Highlights</span>
                </div>
                <ul className="list-disc pl-5 text-[11px] space-y-1 text-slate-500">
                  <li>Built on ERC-4337 smart accounts and FIDO2 passkeys</li>
                  <li>Sponsors gas on Base L2 via Paymaster</li>
                  <li>Native compatibility with ZEEX stock token settlements</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: MetaMask */}
          {activeTab === 'metamask' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🦊</span>
                  <h3 className="font-bold text-sm text-slate-900">Connect with MetaMask</h3>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    Web3 Injected
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect your MetaMask browser extension or mobile app to trade ZEEX tokenized African equities on Base Sepolia.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isWagmiPending}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  {isWagmiPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Connecting to MetaMask...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🦊</span>
                      <span>Connect MetaMask</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Network Auto-Switch</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  ZEEX automatically requests MetaMask to switch to <strong>Base Sepolia (Chain ID 84532)</strong> or Base Mainnet for trading and minting.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Coinbase (Email, SMS, Embedded CDP, Wallet) */}
          {activeTab === 'coinbase' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 relative overflow-hidden">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔷</span>
                  <h3 className="font-bold text-sm text-white">Coinbase Smart Wallet & Multi-Auth</h3>
                  <span className="text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                    CDP Embedded
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in instantly using your <strong>Email</strong> or <strong>SMS phone number</strong> with 6-digit OTP, or connect your Coinbase Wallet app.
                </p>
              </div>

              {/* Sub-modes navigation */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCoinbaseSubMode('modal')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    coinbaseSubMode === 'modal' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coinbase Popup
                </button>
                <button
                  type="button"
                  onClick={() => setCoinbaseSubMode('email')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    coinbaseSubMode === 'email' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => setCoinbaseSubMode('sms')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    coinbaseSubMode === 'sms' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SMS OTP
                </button>
                <button
                  type="button"
                  onClick={() => setCoinbaseSubMode('wallet')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                    coinbaseSubMode === 'wallet' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Coinbase App
                </button>
              </div>

              {/* SUBMODE 1: Official CDP Modal Trigger */}
              {coinbaseSubMode === 'modal' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-slate-500">
                    Opens the secure Coinbase Developer Platform dialog supporting Email, Phone, Apple, Google, and Passkey logins:
                  </p>

                  <div className="flex justify-center">
                    <SignInModal
                      onSuccess={() => {
                        setConnectionMessage('Coinbase authentication complete!');
                        setTimeout(() => onClose(), 1500);
                      }}
                    >
                      <SignInModalTrigger>
                        <button
                          type="button"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Launch Coinbase Sign-In Dialog</span>
                        </button>
                      </SignInModalTrigger>
                    </SignInModal>
                  </div>
                </div>
              )}

              {/* SUBMODE 2: Direct Email OTP */}
              {coinbaseSubMode === 'email' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Sign in with Email OTP</span>
                  </div>

                  {!emailFlowId ? (
                    <form onSubmit={handleSendEmailOtp} className="space-y-2.5">
                      <p className="text-[11px] text-slate-500">
                        Enter your email address to receive a secure one-time verification code from Coinbase.
                      </p>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {emailError && (
                        <p className="text-[11px] text-rose-600 font-medium">{emailError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isEmailSending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isEmailSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Email OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} className="space-y-2.5 animate-fade-in">
                      <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg border border-emerald-200">
                        Code sent to <strong>{email}</strong>! Check your inbox.
                      </div>
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.trim())}
                        placeholder="Enter 6-digit OTP code"
                        maxLength={6}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono tracking-widest text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {emailError && (
                        <p className="text-[11px] text-rose-600 font-medium">{emailError}</p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setEmailFlowId(null)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-xl font-medium cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isEmailVerifying}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isEmailVerifying ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify & Sign In</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* SUBMODE 3: Direct SMS OTP */}
              {coinbaseSubMode === 'sms' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Sign in with SMS (Phone Number)</span>
                  </div>

                  {!smsFlowId ? (
                    <form onSubmit={handleSendSmsOtp} className="space-y-2.5">
                      <p className="text-[11px] text-slate-500">
                        Enter your mobile phone number with country code (+1, +263, +44, +27, etc.) for an SMS code.
                      </p>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+263 77 123 4567"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {smsError && (
                        <p className="text-[11px] text-rose-600 font-medium">{smsError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={isSmsSending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSmsSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending SMS Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Send SMS Code</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifySmsOtp} className="space-y-2.5 animate-fade-in">
                      <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg border border-emerald-200">
                        SMS code sent to <strong>{phone}</strong>!
                      </div>
                      <input
                        type="text"
                        value={smsOtp}
                        onChange={(e) => setSmsOtp(e.target.value.trim())}
                        placeholder="Enter 6-digit SMS OTP"
                        maxLength={6}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono tracking-widest text-center text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {smsError && (
                        <p className="text-[11px] text-rose-600 font-medium">{smsError}</p>
                      )}
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setSmsFlowId(null)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-xl font-medium cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSmsVerifying}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSmsVerifying ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying SMS...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify SMS & Sign In</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* SUBMODE 4: Coinbase Wallet App / Extension */}
              {coinbaseSubMode === 'wallet' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-slate-500">
                    Connect via the Coinbase Wallet browser extension or mobile app via QR code.
                  </p>
                  <button
                    onClick={handleConnectCoinbaseWalletSDK}
                    disabled={isWagmiPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Coinbase Wallet App</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Base Sepolia Testnet & Base Mainnet Compatible</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

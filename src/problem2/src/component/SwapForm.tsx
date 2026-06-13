import React, { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowDownUp, ChevronDown, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import type { ApiTokenPrice, SwapStatus, Token } from '../type';
import { ICON_BASE_URL, PRICE_API, TOKEN_IMAGE_MAPPING } from '../constant';
import TokenModal from './TokenModal';

export default function SwapForm(): React.JSX.Element {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeSide, setActiveSide] = useState<'from' | 'to'>('from');
  
  const [swapStatus, setSwapStatus] = useState<SwapStatus>({ type: '', message: '' });
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  useEffect(() => {
    fetch(PRICE_API)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch current exchange rates.');
        return res.json();
      })
      .then((data: ApiTokenPrice[]) => {
        const tokenMap: Record<string, ApiTokenPrice> = {};
        data.forEach((item) => {
          if (item.currency && item.price !== undefined) {
            tokenMap[item.currency] = item;
          }
        });

        const uniqueTokens: Token[] = Object.values(tokenMap).map((t) => {
            const correctSymbol = TOKEN_IMAGE_MAPPING[t.currency] || t.currency;
          
            return {
              symbol: t.currency, 
              price: t.price,
              iconUrl: `${ICON_BASE_URL}/${correctSymbol}.svg`,
            };
          });

        setTokens(uniqueTokens);
        
        if (uniqueTokens.length > 1) {
          setFromToken(uniqueTokens.find(t => t.symbol === 'USDC') || uniqueTokens[0]);
          setToToken(uniqueTokens.find(t => t.symbol === 'WBTC') || uniqueTokens[1]);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const exchangeRate = useMemo<number>(() => {
    if (!fromToken || !toToken) return 0;
    return fromToken.price / toToken.price;
  }, [fromToken, toToken]);

  const handleFromAmountChange = (val: string): void => {
    if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) return;
    setFromAmount(val);
    setSwapStatus({ type: '', message: '' });

    if (!val) {
      setToAmount('');
      return;
    }
    setToAmount((parseFloat(val) * exchangeRate).toFixed(6));
  };

  const handleToAmountChange = (val: string): void => {
    if (val !== '' && (isNaN(Number(val)) || Number(val) < 0)) return;
    setToAmount(val);
    setSwapStatus({ type: '', message: '' });

    if (!val) {
      setFromAmount('');
      return;
    }
    setFromAmount((parseFloat(val) / exchangeRate).toFixed(6));
  };

  const handlePercentSelect = (percent: number): void => {
    const mockUserBalance = 1500;
    const val = (mockUserBalance * percent).toString();
    handleFromAmountChange(val);
  };

  const handleFlipAssets = (): void => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setSwapStatus({ type: '', message: '' });
  };

  const openTokenModal = (side: 'from' | 'to'): void => {
    setActiveSide(side);
    setModalOpen(true);
  };

  const handleSelectToken = (token: Token): void => {
    if (activeSide === 'from') {
      if (token.symbol === toToken?.symbol) {
        setToToken(fromToken);
        setToAmount(fromAmount);
      }
      setFromToken(token);
      if (fromAmount) setToAmount((parseFloat(fromAmount) * (token.price / (toToken?.price || 1))).toFixed(6));
    } else {
      if (token.symbol === fromToken?.symbol) {
        setFromToken(toToken);
        setFromAmount(toAmount);
      }
      setToToken(token);
      if (fromAmount) setToAmount((parseFloat(fromAmount) * ((fromToken?.price || 1) / token.price)).toFixed(6));
    }
    setModalOpen(false);
  };

  const handleExecuteSwap = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setSwapStatus({ type: 'error', message: 'Please enter a valid amount to swap.' });
      return;
    }
    setIsSwapping(true);
    setSwapStatus({ type: '', message: '' });
    setTimeout(() => {
      setIsSwapping(false);
      setSwapStatus({
        type: 'success',
        message: `Successfully swapped ${fromAmount} ${fromToken?.symbol} to ${toAmount} ${toToken?.symbol}!`,
      });
      setFromAmount('');
      setToAmount('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="relative w-full max-w-md mx-auto my-8">
        <div className="flex flex-col justify-center items-center h-[520px] bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/30 border border-rose-800 rounded-2xl text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-200">Initialization Failed</h3>
        <p className="text-sm text-rose-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-1 group">
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative min-h-full w-full bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/50 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300">
        <div className="flex items-center justify-center mb-5">
          <div>
            <p className="text-xl font-bold tracking-wide text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">Swap Assets</p>
            <p className="text-xs text-slate-400 mt-0.5">Instant cross-token trade execution</p>
          </div>
        </div>
        <form onSubmit={handleExecuteSwap} className="space-y-2 relative">
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 transition-all duration-200 focus-within:border-indigo-500/70 focus-within:bg-slate-950/80 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">You Pay</span>
              <span className="text-xs text-slate-500 font-medium">Bal: 1,500.00 Max</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFromAmountChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => openTokenModal('from')}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold py-1.5 px-3 rounded-xl transition-all duration-200 shadow-md shrink-0 border border-slate-700/50 hover:scale-[1.02]"
              >
                {fromToken && (
                  <img
                    src={fromToken.iconUrl}
                    alt={fromToken.symbol}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNKNOWN.svg'; 
                    }}
                    className="w-5 h-5 rounded-full object-contain shadow-sm"
                  />
                )}
                <span className="text-sm tracking-wide">{fromToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-xs text-slate-500 font-medium">
                {fromToken && fromAmount ? `$${(parseFloat(fromAmount) * fromToken.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00'}
              </div>
              <div className="flex gap-1.5">
                {[0.25, 0.5, 1].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentSelect(pct)}
                    className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900/80 hover:bg-indigo-600 hover:text-white px-2.5 py-1 rounded-md border border-slate-800 transition-all duration-150 active:scale-95"
                  >
                    {pct === 1 ? 'Max' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center -my-3.5 relative z-10">
            <button
              type="button"
              onClick={handleFlipAssets}
              className="p-2.5 bg-slate-800 hover:bg-indigo-500 border-4 border-slate-900 text-slate-300 hover:text-white rounded-xl transition-all shadow-xl group/btn active:scale-95 duration-200"
            >
              <ArrowDownUp className="w-4 h-4 transform group-hover/btn:rotate-180 transition-transform duration-300" />
            </button>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 transition-all duration-200 focus-within:border-indigo-500/70 focus-within:bg-slate-950/80 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-slate-400 tracking-wide">You Receive (Estimated)</span>
              <span className="text-xs text-indigo-400/90 font-medium bg-indigo-950/30 px-1.5 py-0.5 rounded-md border border-indigo-900/30">Best price</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleToAmountChange(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => openTokenModal('to')}
                className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold py-1.5 px-3 rounded-xl transition-all duration-200 shadow-md shrink-0 border border-slate-700/50 hover:scale-[1.02]"
              >
                {toToken && (
                  <img
                    src={toToken.iconUrl}
                    alt={toToken.symbol}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNKNOWN.svg'; 
                    }}
                    className="w-5 h-5 rounded-full object-contain shadow-sm"
                  />
                )}
                <span className="text-sm tracking-wide">{toToken?.symbol || 'Select'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-3 text-left">
              {toToken && toAmount ? `$${(parseFloat(toAmount) * toToken.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00'}
            </div>
          </div>
          {fromToken && toToken && (
            <div className="p-3 bg-slate-950/20 rounded-xl border border-slate-800/40 space-y-1.5 text-xs text-slate-400 transition-all">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-medium"><Info className="w-3.5 h-3.5 text-slate-500" /> Live Exchange Rate</span>
                <span className="font-mono text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/50">
                  1 {fromToken.symbol} = {exchangeRate < 0.001 ? exchangeRate.toFixed(8) : exchangeRate.toFixed(4)} {toToken.symbol}
                </span>
              </div>
            </div>
          )}
          {swapStatus.message && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-sm transition-all animate-in fade-in zoom-in-95 duration-200 ${
              swapStatus.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'bg-rose-950/30 border-rose-800/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
            }`}>
              {swapStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="font-medium leading-relaxed">{swapStatus.message}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-slate-800 disabled:to-slate-800 disabled:border-slate-800 text-white disabled:text-slate-500 font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 transform shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] flex justify-center items-center gap-2 text-sm uppercase tracking-wider border border-indigo-400/20 disabled:pointer-events-none"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Order...
              </>
            ) : !fromAmount ? (
              'Enter an amount'
            ) : (
              'Confirm Swap'
            )}
          </button>
        </form>
        <TokenModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tokens={tokens}
          onSelect={handleSelectToken}
        />
      </div>
    </div>
  );
}
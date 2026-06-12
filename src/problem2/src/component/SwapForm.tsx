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
      <div className="flex flex-col justify-center items-center h-96 text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin mb-2" />
        <p className="text-sm font-medium text-slate-400">Loading swap metrics...</p>
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
    <div className="min-h-full w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-center mb-6 relative">
        <div>
          <p className="text-xl font-bold text-white">Swap Assets</p>
          <p className="text-xs text-slate-400 mt-0.5">Instant cross-token trade execution</p>
        </div>
      </div>

      <form onSubmit={handleExecuteSwap} className="space-y-2 relative">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition-all focus-within:border-indigo-500/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">You Pay</span>
            <span className="text-xs text-slate-500">Bal: 1,500.00 Max</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleFromAmountChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => openTokenModal('from')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded-xl transition-colors shadow-sm shrink-0 border border-slate-700/50"
            >
              {fromToken && (
                <img
                  src={fromToken.iconUrl}
                  alt={fromToken.symbol}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                    (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNKNOWN.svg'; 
                  }}
                  className="w-5 h-5 rounded-full object-contain"
                />
              )}
              <span className="text-sm">{fromToken?.symbol || 'Select'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-slate-500">
              {fromToken && fromAmount ? `$${(parseFloat(fromAmount) * fromToken.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00'}
            </div>
            <div className="flex gap-1.5">
              {[0.25, 0.5, 1].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentSelect(pct)}
                  className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 hover:bg-indigo-950/40 hover:text-indigo-400 px-2 py-1 rounded-md border border-slate-800 transition-all"
                >
                  {pct === 1 ? 'Max' : `${pct * 100}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-3 relative z-10">
          <button
            type="button"
            onClick={handleFlipAssets}
            className="p-2.5 bg-slate-800 hover:bg-indigo-600 border-4 border-slate-900 text-slate-300 hover:text-white rounded-xl transition-all shadow-md group transform hover:rotate-180 duration-300"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition-all focus-within:border-indigo-500/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">You Receive (Estimated)</span>
            <span className="text-xs text-slate-500">Best price</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={toAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleToAmountChange(e.target.value)}
              className="w-full bg-transparent text-2xl font-semibold text-slate-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => openTokenModal('to')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded-xl transition-colors shadow-sm shrink-0 border border-slate-700/50"
            >
              {toToken && (
                <img
                  src={toToken.iconUrl}
                  alt={toToken.symbol}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                    (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNKNOWN.svg'; 
                  }}
                  className="w-5 h-5 rounded-full object-contain"
                />
              )}
              <span className="text-sm">{toToken?.symbol || 'Select'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="text-xs text-slate-500 mt-3 text-left">
            {toToken && toAmount ? `$${(parseFloat(toAmount) * toToken.price).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}` : '$0.00'}
          </div>
        </div>

        {fromToken && toToken && (
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-800/50 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-slate-500" /> Live Exchange Rate</span>
              <span className="font-mono text-slate-300">
                1 {fromToken.symbol} = {exchangeRate < 0.001 ? exchangeRate.toFixed(8) : exchangeRate.toFixed(4)} {toToken.symbol}
              </span>
            </div>
          </div>
        )}

        {swapStatus.message && (
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-sm transition-all ${
            swapStatus.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}>
            {swapStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span>{swapStatus.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-semibold py-3.5 px-4 rounded-2xl transition-all transform shadow-lg active:scale-[0.99] flex justify-center items-center gap-2 text-sm uppercase tracking-wider"
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
  );
}
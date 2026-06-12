import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import type { TokenModalProps } from '../type';
export default function TokenModal({
  isOpen,
  onClose,
  tokens,
  onSelect,
}: TokenModalProps): React.JSX.Element | null {
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredTokens = tokens.filter((t) =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-md font-semibold text-slate-200">Choose token</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-sm p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-sm text-slate-200 pl-9 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredTokens.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">No matching results found</p>
          ) : (
            filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => onSelect(token)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-slate-800/60 rounded-xl transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.iconUrl}
                    alt={token.symbol}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { 
                      (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/UNKNOWN.svg'; 
                    }}
                    className="w-8 h-8 rounded-full object-contain bg-slate-950 p-0.5"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{token.symbol}</div>
                    <div className="text-[11px] text-slate-500">Decentralized Asset</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-slate-300">
                    ${token.price < 0.01 
                      ? token.price.toFixed(6) 
                      : token.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
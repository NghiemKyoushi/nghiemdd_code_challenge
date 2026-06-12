export interface ApiTokenPrice {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  price: number;
  iconUrl: string;
}

export interface SwapStatus {
  type: 'success' | 'error' | '';
  message: string;
}

export interface TokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    tokens: Token[];
    onSelect: (token: Token) => void;
  }
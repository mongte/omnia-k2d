import pyupbit
import yfinance as yf
from datetime import datetime
from src.core.logger import get_logger

logger = get_logger(__name__)

def collect_crypto_data(tickers=["KRW-BTC", "KRW-ETH"]):
    """Collect daily crypto market data via Upbit."""
    results = []
    try:
        # Get current price
        current_prices = pyupbit.get_current_price(tickers)
        
        for ticker in tickers:
            price = current_prices.get(ticker)
            if price:
                results.append({
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "ticker": ticker,
                    "close_price": float(price),
                    "volume": 0.0, # PyUpbit get_current_price doesn't give volume, need get_ohlcv for that
                    "asset_type": "CRYPTO"
                })
        
        logger.info(f"Collected {len(results)} crypto tickers")
        return results
    except Exception as e:
        logger.error(f"Failed to fetch crypto data: {e}")
        return []

def collect_stock_data(tickers=["AAPL", "TSLA", "005930.KS"]):
    """Collect daily stock market data via YFinance."""
    results = []
    try:
        data = yf.download(tickers, period="1d", progress=False)
        
        # Handling the MultiIndex columns from yfinance can be tricky
        # Simple extraction for now
        
        for ticker in tickers:
            try:
                # Check if data exists
                if len(data) == 0: continue
                
                # Get scalar values using .iloc[-1] (latest row)
                close_price = data['Close'][ticker].iloc[-1]
                volume = data['Volume'][ticker].iloc[-1]
                
                results.append({
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "ticker": ticker,
                    "close_price": float(close_price),
                    "volume": float(volume),
                    "asset_type": "STOCK"
                })
            except Exception as inner_e:
                logger.debug(f"Error processing {ticker}: {inner_e}")
                
        logger.info(f"Collected {len(results)} stock tickers")
        return results
    except Exception as e:
        logger.error(f"Failed to fetch stock data: {e}")
        return []

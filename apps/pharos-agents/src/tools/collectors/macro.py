from datetime import datetime
from fredapi import Fred
from src.core.config import get_settings
from src.core.logger import get_logger
import pandas as pd

logger = get_logger(__name__)

# Indicator Mapping: Name -> Series ID
INDICATORS = {
    'FED_RATE': 'FEDFUNDS', # Federal Funds Effective Rate
    'CPI': 'CPIAUCSL',      # Consumer Price Index for All Urban Consumers
    'UNRATE': 'UNRATE',     # Unemployment Rate
    'GDP': 'GDP',           # Gross Domestic Product
    'T10Y2Y': 'T10Y2Y'      # 10-Year Treasury Constant Maturity Minus 2-Year
}

def collect_macro_data():
    """Collect macro economic indicators from FRED."""
    settings = get_settings()
    if not settings.fred_api_key:
        logger.warning("FRED_API_KEY not set. Skipping macro collection.")
        return

    fred = Fred(api_key=settings.fred_api_key)
    
    # In a real scenario, we would upsert to DB.
    # For now, we will return the collected data structure.
    results = []

    for name, series_id in INDICATORS.items():
        try:
            # Fetch last 1 year data
            series = fred.get_series(series_id, observation_start=pd.Timestamp.now() - pd.DateOffset(years=1))
            if series is None or series.empty:
                continue
                
            # Take the latest value
            latest_date = series.index[-1]
            latest_value = series.iloc[-1]
            
            results.append({
                "date": latest_date.strftime('%Y-%m-%d'),
                "indicator_name": name,
                "value": float(latest_value),
                "period_type": "MONTHLY" # Simplified
            })
            
        except Exception as e:
            logger.error(f"Failed to fetch {name} ({series_id}): {e}")

    logger.info(f"Collected {len(results)} macro indicators")
    return results

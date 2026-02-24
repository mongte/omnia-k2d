from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from src.core.logger import get_logger
from src.tools.collectors.macro import collect_macro_data
from src.tools.collectors.market import collect_crypto_data, collect_stock_data

logger = get_logger(__name__)

scheduler = AsyncIOScheduler()

def job_macro():
    logger.info("Starting Macro Data Collection Job")
    data = collect_macro_data()
    # TODO: Insert `data` into Supabase
    logger.info(f"Macro Job Finished: {data}")

def job_market():
    logger.info("Starting Market Data Collection Job")
    c_data = collect_crypto_data()
    s_data = collect_stock_data()
    # TODO: Insert into Supabase
    logger.info(f"Market Job Finished. Crypto: {len(c_data)}, Stock: {len(s_data)}")

def start_scheduler():
    # 1. Macro: Every 1st day of month at 10:00
    scheduler.add_job(job_macro, CronTrigger(day=1, hour=10, minute=0))
    
    # 2. Market (Stock): Daily at 17:00 (After KR market close, US pre-market)
    scheduler.add_job(job_market, CronTrigger(hour=17, minute=0))
    
    # 3. Market (Crypto): Daily at 09:00
    scheduler.add_job(job_market, CronTrigger(hour=9, minute=0))
    
    scheduler.start()
    logger.info("Scheduler started...")

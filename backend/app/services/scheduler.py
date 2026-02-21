from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TrainScheduler:
    """Background scheduler for continuous train position updates"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self._started = False
    
    def start(self):
        """Start the background scheduler"""
        if self._started:
            logger.warning("Scheduler already started")
            return
        
        # Import here to avoid circular dependency
        from app.services.train_simulator import train_simulator
        
        # Schedule train position updates every 15 seconds
        self.scheduler.add_job(
            func=self._update_trains,
            trigger=IntervalTrigger(seconds=15),
            id='train_position_updater',
            name='Update train positions every 15 seconds',
            replace_existing=True
        )
        
        # Schedule train count adjustment every 5 minutes (for peak/off-peak)
        self.scheduler.add_job(
            func=self._adjust_train_count,
            trigger=IntervalTrigger(minutes=5),
            id='train_count_adjuster',
            name='Adjust number of trains based on time',
            replace_existing=True
        )
        
        self.scheduler.start()
        self._started = True
        logger.info("🚂 Train scheduler started - updates every 15 seconds")
    
    def shutdown(self):
        """Shutdown the scheduler gracefully"""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            self._started = False
            logger.info("👋 Train scheduler stopped")
    
    def _update_trains(self):
        """Background task to update all train positions"""
        try:
            from app.services.train_simulator import train_simulator
            
            # Ensure trains are initialized
            train_simulator._ensure_initialized()
            
            # Update positions
            train_simulator._update_train_positions()
            
            # Log status (optional, comment out in production)
            moving_count = sum(1 for t in train_simulator.trains.values() if t['status'] == 'moving')
            logger.debug(f"🚂 Updated {len(train_simulator.trains)} trains ({moving_count} moving)")
            
        except Exception as e:
            logger.error(f"Error updating train positions: {e}")
    
    def _adjust_train_count(self):
        """Adjust number of trains based on current time (peak/off-peak)"""
        try:
            from app.services.train_simulator import train_simulator
            
            now = datetime.now()
            is_peak = train_simulator._is_peak_hour(now)
            current_count = len(train_simulator.trains)
            
            # Target: 12 trains during peak, 8 during off-peak
            target_count = 12 if is_peak else 8
            
            if current_count < target_count:
                # Add trains
                logger.info(f"🚂 Peak hour detected - adding trains ({current_count} → {target_count})")
                train_simulator._add_trains(target_count - current_count)
            elif current_count > target_count:
                # Remove some trains (simulate depot returns)
                logger.info(f"🚂 Off-peak - reducing trains ({current_count} → {target_count})")
                train_simulator._remove_trains(current_count - target_count)
                
        except Exception as e:
            logger.error(f"Error adjusting train count: {e}")

# Create global instance
train_scheduler = TrainScheduler()
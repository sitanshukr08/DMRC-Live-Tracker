import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.multi_line_train_simulator import multi_line_train_simulator
from app.services.eta_calculator import eta_calculator

class BackgroundScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.websocket_manager = None
    
    def set_websocket_manager(self, manager):
        self.websocket_manager = manager
    
    async def update_and_broadcast(self):
        try:
            trains = multi_line_train_simulator.get_all_trains()
            eta_calculator.set_trains(trains)
            
            if self.websocket_manager:
                yellow_count = len([t for t in trains if t["line"] == "Yellow"])
                blue_count = len([t for t in trains if t["line"] == "Blue"])
                violet_count = len([t for t in trains if t["line"] == "Violet"])
                orange_count = len([t for t in trains if t["line"] == "Orange"])
                aqua_count = len([t for t in trains if t["line"] == "Aqua"])
                
                await self.websocket_manager.broadcast({
                    "trains": trains,
                    "timestamp": trains[0]["last_updated"] if trains else None,
                    "total_trains": len(trains)
                })
                
                client_count = len(self.websocket_manager.active_connections)
                print(f"Broadcast: {yellow_count}Y + {blue_count}B + {violet_count}V + {orange_count}O + {aqua_count}A = {len(trains)} trains to {client_count} clients")
        except Exception as e:
            print(f"Error in background scheduler: {e}")
    
    def start(self):
        self.scheduler.add_job(
            self.update_and_broadcast,
            'interval',
            seconds=5,
            id='train_update_job'
        )
        self.scheduler.start()
        print("Background scheduler started - updating every 5 seconds")
    
    def stop(self):
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("Background scheduler stopped")

background_scheduler = BackgroundScheduler()

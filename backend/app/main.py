from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import stations, trains, analytics
from app.routes.route import router as route_router
from app.routes.eta import router as eta_router
from app.routes.websocket import router as websocket_router, manager
from app.services.multi_line_train_simulator import multi_line_train_simulator
from app.services.analytics_service import analytics_service
from app.services.eta_calculator import eta_calculator
from app.services.route_calculator import route_calculator
from app.services.multi_line_station_service import multi_line_station_service
from app.services.background_scheduler import background_scheduler

app = FastAPI(
    title="Delhi Metro Multi-Line Live Tracker API",
    description="Real-time tracking for Delhi Metro Yellow, Blue, Violet, Orange & Aqua Lines with WebSocket support",
    version="7.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stations.router)
app.include_router(trains.router)
app.include_router(route_router)
app.include_router(analytics.router)
app.include_router(eta_router)
app.include_router(websocket_router)

@app.on_event("startup")
async def startup_event():
    all_stations = multi_line_station_service.get_all_stations()
    yellow_stations = multi_line_station_service.get_stations_by_line("Yellow")
    blue_stations = multi_line_station_service.get_stations_by_line("Blue")
    violet_stations = multi_line_station_service.get_stations_by_line("Violet")
    orange_stations = multi_line_station_service.get_stations_by_line("Orange")
    aqua_stations = multi_line_station_service.get_stations_by_line("Aqua")
    
    analytics_service.set_stations(all_stations)
    eta_calculator.set_stations(all_stations)
    route_calculator.set_stations(all_stations)
    
    trains_data = multi_line_train_simulator.get_all_trains()
    eta_calculator.set_trains(trains_data)
    
    background_scheduler.set_websocket_manager(manager)
    background_scheduler.start()
    
    yellow_count = len([t for t in trains_data if t["line"] == "Yellow"])
    blue_count = len([t for t in trains_data if t["line"] == "Blue"])
    violet_count = len([t for t in trains_data if t["line"] == "Violet"])
    orange_count = len([t for t in trains_data if t["line"] == "Orange"])
    aqua_count = len([t for t in trains_data if t["line"] == "Aqua"])
    
    print("=" * 70)
    print("🚇 DELHI METRO MULTI-LINE TRACKER STARTED")
    print("=" * 70)
    print(f"Analytics service initialized with ALL stations")
    print(f"ETA calculator initialized")
    print(f"Route calculator initialized")
    print(f"📍 Loaded {len(all_stations)} stations:")
    print(f"   🟡 Yellow Line: {len(yellow_stations)} stations")
    print(f"   🔵 Blue Line: {len(blue_stations)} stations")
    print(f"   🟣 Violet Line: {len(violet_stations)} stations")
    print(f"   🟠 Orange Line: {len(orange_stations)} stations (Airport Express)")
    print(f"   🔵 Aqua Line: {len(aqua_stations)} stations (Noida-Greater Noida Metro)")
    print(f"🚇 Train simulator started with {len(trains_data)} trains:")
    print(f"   🟡 Yellow Line: {yellow_count} trains")
    print(f"   🔵 Blue Line: {blue_count} trains")
    print(f"   🟣 Violet Line: {violet_count} trains")
    print(f"   🟠 Orange Line: {orange_count} trains (Premium)")
    print(f"   🔵 Aqua Line: {aqua_count} trains (Noida Metro)")
    print(f"WebSocket endpoint: ws://localhost:8000/ws/trains")
    print(f"Broadcasting train updates every 5 seconds")
    print("=" * 70)

@app.on_event("shutdown")
async def shutdown_event():
    background_scheduler.stop()
    print("Application shutdown complete")

@app.get("/")
async def root():
    all_stations = multi_line_station_service.get_all_stations()
    trains = multi_line_train_simulator.get_all_trains()
    
    return {
        "message": "Delhi Metro Multi-Line Live Tracker API",
        "version": "7.0.0",
        "lines": ["Yellow", "Blue", "Violet", "Orange", "Aqua"],
        "websocket": "ws://localhost:8000/ws/trains",
        "stats": {
            "total_stations": len(all_stations),
            "total_trains": len(trains),
            "yellow_line": {
                "stations": len([s for s in all_stations if s['line'] == 'Yellow']),
                "trains": len([t for t in trains if t['line'] == 'Yellow'])
            },
            "blue_line": {
                "stations": len([s for s in all_stations if s['line'] == 'Blue']),
                "trains": len([t for t in trains if t['line'] == 'Blue'])
            },
            "violet_line": {
                "stations": len([s for s in all_stations if s['line'] == 'Violet']),
                "trains": len([t for t in trains if t['line'] == 'Violet'])
            },
            "orange_line": {
                "stations": len([s for s in all_stations if s['line'] == 'Orange']),
                "trains": len([t for t in trains if t['line'] == 'Orange'])
            },
            "aqua_line": {
                "stations": len([s for s in all_stations if s['line'] == 'Aqua']),
                "trains": len([t for t in trains if t['line'] == 'Aqua'])
            }
        }
    }

@app.get("/health")
async def health_check():
    trains = multi_line_train_simulator.get_all_trains()
    return {
        "status": "healthy", 
        "service": "Delhi Metro Multi-Line API",
        "active_trains": len(trains),
        "websocket_clients": len(manager.active_connections)
    }

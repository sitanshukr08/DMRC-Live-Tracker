from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
from app.services.multi_line_train_simulator import multi_line_train_simulator
from app.services.eta_calculator import eta_calculator

router = APIRouter(prefix="/api/trains", tags=["trains"])

@router.get("/live")
async def get_live_trains(
    line: Optional[str] = Query(None, description="Filter by line (Yellow, Blue)")
):
    """
    Get all currently active trains with real-time positions
    
    Parameters:
    - line: Optional filter (Yellow, Blue)
    """
    if line:
        trains = multi_line_train_simulator.get_trains_by_line(line)
    else:
        trains = multi_line_train_simulator.get_all_trains()
    
    # Update ETA calculator with current train positions
    eta_calculator.set_trains(trains)
    
    # Get timestamp
    if trains and len(trains) > 0:
        timestamp = trains[0].get("last_updated", datetime.now().isoformat())
    else:
        timestamp = datetime.now().isoformat()
    
    return {
        "total_trains": len(trains),
        "timestamp": timestamp,
        "trains": trains
    }

@router.get("/live/{train_id}")
async def get_train_by_id(train_id: str):
    """Get specific train information by ID"""
    trains = multi_line_train_simulator.get_all_trains()
    
    train = next((t for t in trains if t["train_id"] == train_id), None)
    
    if not train:
        raise HTTPException(
            status_code=404,
            detail=f"Train {train_id} not found"
        )
    
    return train

@router.get("/count")
async def get_train_count():
    """Get count of active trains"""
    trains = multi_line_train_simulator.get_all_trains()
    
    yellow_trains = [t for t in trains if t["line"] == "Yellow"]
    blue_trains = [t for t in trains if t["line"] == "Blue"]
    
    return {
        "total_trains": len(trains),
        "by_line": {
            "Yellow": len(yellow_trains),
            "Blue": len(blue_trains)
        },
        "by_status": {
            "moving": len([t for t in trains if t.get("status") == "moving"]),
            "at_station": len([t for t in trains if t.get("status") == "at_station"])
        }
    }

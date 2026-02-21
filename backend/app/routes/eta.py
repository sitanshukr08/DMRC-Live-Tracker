from fastapi import APIRouter, HTTPException
from app.services.eta_calculator import eta_calculator

router = APIRouter(prefix="/api/eta", tags=["eta"])

@router.get("/station/{station_id}")
async def get_station_eta(station_id: int):
    """Get ETA for trains approaching a specific station"""
    try:
        result = eta_calculator.calculate_eta(station_id)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except Exception as e:
        print(f"❌ Error calculating ETA for station {station_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate ETA: {str(e)}")

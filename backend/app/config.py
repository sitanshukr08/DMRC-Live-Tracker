from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # Application
    app_name: str = "Delhi Metro Yellow Line API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    allowed_origins: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    
    # Data paths
    data_dir: Path = Path(__file__).parent.parent.parent / "data"
    processed_data_dir: Path = data_dir / "processed"
    metadata_dir: Path = data_dir / "metadata"
    
    # Data files
    yellow_line_file: Path = processed_data_dir / "yellow_line.json"
    fare_structure_file: Path = metadata_dir / "fare_structure.json"
    operational_params_file: Path = metadata_dir / "operational_params.json"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
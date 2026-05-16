@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting GeoTera backend on http://localhost:8000
uvicorn main:app --reload --port 8000 --host 0.0.0.0

#!/usr/bin/env bash
set -e
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 --host 0.0.0.0

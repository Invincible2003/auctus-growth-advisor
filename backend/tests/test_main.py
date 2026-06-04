import os
import sys
# Adjust path to import backend app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.cleaning_service import CleaningService
import pandas as pd

client = TestClient(app)

def test_health_check():
    """Verify that the system health endpoint is online and displays proper branding."""
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "online"
    assert json_data["service"] == "AUCTUS"
    assert "Aryan Pandey" in json_data["branding"]

def test_root_endpoint():
    """Verify that the root endpoint redirects to swagger or displays welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert "developer" in json_data
    assert "Aryan Pandey" in json_data["developer"]

def test_data_cleaning_logic():
    """Verify that the Pandas cleaning service corrects duplicates and missing amounts."""
    # Build test dataframe with duplicates and missing values
    test_df = pd.DataFrame([
        {"date": "2026-06-01", "amount": 100.0, "product_name": "A", "quantity": 2},
        {"date": "2026-06-01", "amount": 100.0, "product_name": "A", "quantity": 2}, # Duplicate row
        {"date": "2026-06-02", "amount": None, "product_name": "B", "quantity": 1},  # Missing amount
    ])
    
    cleaned_df, logs = CleaningService.clean_sales_data(test_df)
    
    # Assert duplicates were dropped (length should be 2 instead of 3)
    assert len(cleaned_df) == 2
    
    # Assert missing amount was filled with median ($100.0 in this case)
    assert cleaned_df.iloc[1]["amount"] == 100.0
    
    # Verify logs documented the issues
    log_issues = [log["issue"] for log in logs]
    assert "Duplicate Records" in log_issues
    assert "Missing Sales Amounts" in log_issues

def test_reviews_cleaning_logic():
    """Verify that reviews cleaning maps columns and standardizes ratings."""
    test_df = pd.DataFrame([
        {"review_text": "Love it!", "rating": 6}, # Out of bounds rating
        {"review_text": None, "rating": 2},      # Missing text
    ])
    
    cleaned_df, logs = CleaningService.clean_reviews_data(test_df)
    
    # Assert out of bounds rating capped at 5
    assert cleaned_df.iloc[0]["rating"] == 5
    
    # Assert missing text replaced with placeholder
    assert "No comment" in cleaned_df.iloc[1]["review_text"]
    
    log_issues = [log["issue"] for log in logs]
    assert "Invalid Rating Scale" in log_issues
    assert "Missing Review Contents" in log_issues

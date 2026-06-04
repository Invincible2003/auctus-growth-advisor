# AUCTUS API Documentation
**AI-Powered Local Business Growth Advisor**
*Made by Aryan Pandey*

The AUCTUS backend is built with FastAPI. It exposes a RESTful JSON API. Swagger interactive documentation is served at `/docs` when running in development mode.

---

## 🔒 Authentication Flow
Secure endpoints require the inclusion of a JWT token in the request header:
`Authorization: Bearer <token>`

### 1. Signup / Register Profile
- **Endpoint:** `POST /api/v1/auth/signup`
- **Request Body:**
  ```json
  {
    "email": "owner@cafehaven.com",
    "password": "securepassword123",
    "role": "Business Owner"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "email": "owner@cafehaven.com",
    "role": "Business Owner",
    "id": "uuid-string-value",
    "created_at": "2026-06-04T14:27:00Z"
  }
  ```

### 2. Login / Issue Token
- **Endpoint:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "owner@cafehaven.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "jwt-token-string",
    "token_type": "bearer",
    "user": {
      "id": "uuid-string",
      "email": "owner@cafehaven.com",
      "role": "Business Owner",
      "business_name": "My Business"
    }
  }
  ```

### 3. Password Recovery Request
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "owner@cafehaven.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "If this email is registered, a password reset link has been dispatched."
  }
  ```

---

## 🏢 Business Profile Settings

### 1. Retrieve Settings
- **Endpoint:** `GET /api/v1/business/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "id": "uuid-string",
    "user_id": "uuid-string",
    "name": "Coffee Haven",
    "industry": "Restaurant & Cafe",
    "location": "New York, NY",
    "employees": 5,
    "revenue": 120000.00,
    "contact_email": "owner@cafehaven.com",
    "contact_phone": "+1 (555) 019-2834",
    "created_at": "...",
    "updated_at": "..."
  }
  ```

### 2. Update Settings
- **Endpoint:** `PUT /api/v1/business/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Pydantic schema matching the profile metrics fields.

---

## 📥 Ingestion & Cleaning

### 1. Ingest Dataset
- **Endpoint:** `POST /api/v1/ingestion/upload`
- **Headers:** `Authorization: Bearer <token>`
- **Content-Type:** `multipart/form-data`
- **Form Parameters:**
  - `file`: (Binary File)
  - `file_type`: `"sales"` or `"reviews"`
- **Response:**
  ```json
  {
    "success": true,
    "dataset_id": "uuid-string",
    "filename": "transactions.csv",
    "row_count": 450,
    "cleaning_logs": [
      {
        "issue": "Duplicate Records",
        "action": "Removed duplicate rows",
        "count": 5
      }
    ],
    "ai_explanation": "5 duplicate transaction rows were dropped to guarantee arithmetic accuracy. Outliers capped..."
  }
  ```

---

## 📊 Analytics & Machine Learning

### 1. Fetch Dashboard Analytics
- **Endpoint:** `GET /api/v1/analytics/dashboard`
- **Response:** Combines calculated KPIs (Revenue, growth percentage, Best Seller) with Recharts trend lines data.

### 2. Generate Sales Forecast
- **Endpoint:** `GET /api/v1/analytics/forecasting`
- **Query Parameter:** `days` (integer: 30, 90, 180, 365)
- **Response:** List of daily points `{ date, revenue, lower_bound, upper_bound }` alongside model metrics.

### 3. Customer Segments
- **Endpoint:** `GET /api/v1/analytics/customers`
- **Response:** KMeans persona clusters showing share percentages and average tickets.

---

## 🤖 AI growth advisor & SWOT

### 1. Advisor Chat Message
- **Endpoint:** `POST /api/v1/advisor/chat`
- **Request Body:** `{ "role": "user", "message": "Why are sales dropping?" }`
- **Response:** `{ "reply": "...", "history_item": { ... } }`

### 2. Competitor SWOT Report
- **Endpoint:** `POST /api/v1/advisor/competitor/swot`
- **Request Body:** `{ "competitor_name": "Cafe Nero" }`
- **Response:** Full SWOT Quadrants list, pricing logs, strengths, weaknesses, and a competitive audit.

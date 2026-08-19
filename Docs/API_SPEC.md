# API Specification: Expense Tracker Application

**Version:** 1.0  
**Backend Stack:** Django, Django REST Framework (DRF), Simple JWT, MySQL  

---

## 1. Overview

### Base URL
All API endpoints are relative to the base URL:
`https://api.expensetracker.com` (or `http://localhost:8000` for local development).

### Content Type
All requests and responses use JSON content format.
`Content-Type: application/json`
`Accept: application/json`

### Versioning
API versioning is done via the URL path. All endpoints defined in this document fall under `/api/v1/` unless otherwise specified. For brevity, the endpoints below omit the `v1/` prefix, starting directly with `/api/`.

### Authentication Mechanism
The API uses **JSON Web Token (JWT)** for authentication via `djangorestframework-simplejwt`. 
Protected endpoints require an `Authorization` header with a valid Bearer token.
**Header Format:** `Authorization: Bearer <access_token>`

---

## 2. Authentication Endpoints

### Register User
- **Method & URL:** `POST /api/auth/register/`
- **Description:** Register a new user account.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "strongPassword123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "User registered successfully."
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"email": ["A user with that email already exists."]}`

### Login (Obtain Tokens)
- **Method & URL:** `POST /api/auth/login/`
- **Description:** Authenticate a user and obtain JWT access and refresh tokens.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "strongPassword123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "access": "eyJ0eXAiOiJKV1QiLCJ...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "No active account found with the given credentials"}`

### Refresh Token
- **Method & URL:** `POST /api/auth/token/refresh/`
- **Description:** Obtain a new access token using a valid refresh token.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "access": "eyJ0eXAiOiJKV1QiLCJ..."
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Token is invalid or expired", "code": "token_not_valid"}`

### Logout (Blacklist Token)
- **Method & URL:** `POST /api/auth/logout/`
- **Description:** Blacklist the given refresh token so it cannot be used again.
- **Auth Required:** Yes
- **Request Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "refresh": "eyJ0eXAiOiJKV1QiLCJ..."
  }
  ```
- **Success Response (205 Reset Content):** `{"message": "Successfully logged out."}`
- **Error Responses:**
  - `400 Bad Request`: `{"refresh": ["This field is required."]}`
  - `401 Unauthorized`: `{"detail": "Authentication credentials were not provided."}`

### Password Reset Request
- **Method & URL:** `POST /api/auth/password-reset/`
- **Description:** Request a password reset link to be sent to the user's email.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Success Response (200 OK):** `{"message": "Password reset email sent if the account exists."}`
- **Error Responses:**
  - `400 Bad Request`: `{"email": ["Enter a valid email address."]}`

### Password Reset Confirm
- **Method & URL:** `POST /api/auth/password-reset/confirm/`
- **Description:** Confirm the password reset using a token sent via email.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "token": "reset_token_from_email",
    "uidb64": "user_id_base64",
    "new_password": "newStrongPassword123"
  }
  ```
- **Success Response (200 OK):** `{"message": "Password successfully reset."}`
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "Invalid or expired token."}`

---

## 3. User Profile Endpoints

### Get / Update Profile
- **Method & URL:** `GET /api/users/profile/` | `PUT /api/users/profile/`
- **Description:** Retrieve or update the authenticated user's profile details.
- **Auth Required:** Yes
- **Request Headers:** `Authorization: Bearer <access_token>`
- **PUT Request Body:**
  ```json
  {
    "name": "John Doe",
    "currency": "USD"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "currency": "USD",
    "created_at": "2026-08-18T10:00:00Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"currency": ["Invalid currency code."]}`
  - `401 Unauthorized`: `{"detail": "Authentication credentials were not provided."}`

### Delete Profile
- **Method & URL:** `DELETE /api/users/profile/`
- **Description:** Permanently delete the user's account and associated data.
- **Auth Required:** Yes
- **Request Headers:** `Authorization: Bearer <access_token>`
- **Success Response (204 No Content):** (No body)
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Authentication credentials were not provided."}`

---

## 4. Account Endpoints

### List / Create Accounts
- **Method & URL:** `GET /api/accounts/` | `POST /api/accounts/`
- **Description:** List all accounts for the user, or create a new account.
- **Auth Required:** Yes
- **Request Headers:** `Authorization: Bearer <access_token>`
- **POST Request Body:**
  ```json
  {
    "name": "Main Bank",
    "type": "bank",
    "balance": "1500.00"
  }
  ```
  *(type options: cash, bank, card, wallet)*
- **Success Response - GET (200 OK):**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Main Bank",
        "type": "bank",
        "balance": "1500.00"
      }
    ]
  }
  ```
- **Success Response - POST (201 Created):** *(Same as single object above)*
- **Error Responses:**
  - `400 Bad Request`: `{"type": ["\"invalid_type\" is not a valid choice."]}`
  - `401 Unauthorized`

### Retrieve / Update / Delete Account
- **Method & URL:** `GET /api/accounts/{id}/` | `PUT /api/accounts/{id}/` | `DELETE /api/accounts/{id}/`
- **Description:** Retrieve, update, or delete a specific account.
- **Auth Required:** Yes
- **Success Response (200 OK):** *(Single account object)*
- **Success Response - DELETE (204 No Content)**
- **Error Responses:**
  - `404 Not Found`: `{"detail": "Not found."}`

### Transfer Funds
- **Method & URL:** `POST /api/accounts/transfer/`
- **Description:** Transfer funds between two accounts.
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "from_account": 1,
    "to_account": 2,
    "amount": "100.00",
    "note": "Transfer to savings"
  }
  ```
- **Success Response (200 OK):** `{"message": "Transfer successful."}`
- **Error Responses:**
  - `400 Bad Request`: `{"amount": ["Insufficient funds in the source account."]}`

---

## 5. Category Endpoints

### List / Create Categories
- **Method & URL:** `GET /api/categories/` | `POST /api/categories/`
- **Description:** List all user categories (including global defaults), or create a custom one.
- **Auth Required:** Yes
- **POST Request Body:**
  ```json
  {
    "name": "Groceries",
    "type": "expense",
    "icon": "shopping-cart",
    "color": "#FF5733"
  }
  ```
  *(type options: income, expense)*
- **Success Response - GET (200 OK):** Standard paginated response of category objects.
- **Success Response - POST (201 Created)**
- **Error Responses:**
  - `400 Bad Request`: `{"name": ["This field is required."]}`

### Retrieve / Update / Delete Category
- **Method & URL:** `GET /api/categories/{id}/` | `PUT /api/categories/{id}/` | `DELETE /api/categories/{id}/`
- **Description:** Manage a specific category. (Default system categories may restrict modification).
- **Auth Required:** Yes
- **Success Response (200 OK):** *(Single category object)*
- **Success Response - DELETE (204 No Content)**
- **Error Responses:**
  - `403 Forbidden`: `{"detail": "You do not have permission to modify a system default category."}`
  - `404 Not Found`

---

## 6. Transaction Endpoints

### List / Create Transactions
- **Method & URL:** `GET /api/transactions/` | `POST /api/transactions/`
- **Description:** List user transactions or add a new transaction.
- **Auth Required:** Yes
- **Query Parameters (GET):**
  - `date_from` (YYYY-MM-DD)
  - `date_to` (YYYY-MM-DD)
  - `category` (Category ID)
  - `account` (Account ID)
  - `type` (income | expense)
  - `search` (Search in note or category name)
  - `ordering` (e.g., `-date`, `amount`)
- **POST Request Body:**
  ```json
  {
    "account": 1,
    "category": 2,
    "amount": "50.00",
    "type": "expense",
    "date": "2026-08-18",
    "note": "Lunch",
    "is_recurring": false
  }
  ```
- **Success Response - GET (200 OK):** Standard paginated response of transaction objects.
- **Success Response - POST (201 Created)**
- **Error Responses:**
  - `400 Bad Request`: `{"account": ["Invalid pk \"99\" - object does not exist."]}`

### Retrieve / Update / Delete Transaction
- **Method & URL:** `GET /api/transactions/{id}/` | `PUT /api/transactions/{id}/` | `DELETE /api/transactions/{id}/`
- **Description:** Manage a specific transaction.
- **Auth Required:** Yes
- **Success Response (200 OK):** *(Single transaction object)*
- **Success Response - DELETE (204 No Content)**
- **Error Responses:**
  - `404 Not Found`

---

## 7. Budget Endpoints

### List / Create Budgets
- **Method & URL:** `GET /api/budgets/` | `POST /api/budgets/`
- **Description:** List or create user budgets.
- **Auth Required:** Yes
- **POST Request Body:**
  ```json
  {
    "category": 2, 
    "limit_amount": "500.00",
    "period_start": "2026-08-01",
    "period_end": "2026-08-31"
  }
  ```
  *(Omit `category` for an overall budget)*
- **Success Response - GET (200 OK):** Standard paginated list of budgets.
- **Success Response - POST (201 Created)**

### Retrieve / Update / Delete Budget
- **Method & URL:** `GET /api/budgets/{id}/` | `PUT /api/budgets/{id}/` | `DELETE /api/budgets/{id}/`
- **Description:** Manage a specific budget.
- **Auth Required:** Yes
- **Success Response (200 OK)**
- **Success Response - DELETE (204 No Content)**

### Budget Status
- **Method & URL:** `GET /api/budgets/{id}/status/`
- **Description:** Retrieve real-time spending status against a budget.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "limit_amount": "500.00",
    "spent_amount": "400.00",
    "remaining_amount": "100.00",
    "percentage_used": 80.0
  }
  ```

---

## 8. Report Endpoints

### Dashboard Summary
- **Method & URL:** `GET /api/reports/dashboard/`
- **Description:** Get overall summary (total income, total expense, balance) for a given period.
- **Auth Required:** Yes
- **Query Parameters:** `date_from`, `date_to`
- **Success Response (200 OK):**
  ```json
  {
    "total_income": "2000.00",
    "total_expense": "1500.00",
    "net_balance": "500.00"
  }
  ```

### Spending Trends
- **Method & URL:** `GET /api/reports/trends/`
- **Description:** Get aggregated spending grouped by category or month for charting.
- **Auth Required:** Yes
- **Query Parameters:** `date_from`, `date_to`, `group_by` (category | month)
- **Success Response (200 OK):**
  ```json
  [
    {
      "category__name": "Groceries",
      "total": "400.00"
    },
    {
      "category__name": "Utilities",
      "total": "150.00"
    }
  ]
  ```

### Export Data
- **Method & URL:** `GET /api/reports/export/`
- **Description:** Export user transactions.
- **Auth Required:** Yes
- **Query Parameters:** `format` (csv | pdf), `date_from`, `date_to`
- **Success Response (200 OK):** Returns the binary file with appropriate `Content-Type` (e.g., `text/csv` or `application/pdf`).

---

## 9. Notification Endpoints

### List Notifications
- **Method & URL:** `GET /api/notifications/`
- **Description:** Get the user's notifications (e.g., budget alerts).
- **Auth Required:** Yes
- **Success Response (200 OK):** Standard paginated response.
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "type": "budget_alert",
        "message": "You have reached 80% of your Groceries budget.",
        "is_read": false,
        "created_at": "2026-08-18T12:00:00Z"
      }
    ]
  }
  ```

### Mark Notification as Read
- **Method & URL:** `PUT /api/notifications/{id}/read/`
- **Description:** Mark a specific notification as read.
- **Auth Required:** Yes
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "is_read": true
  }
  ```

### Mark All as Read
- **Method & URL:** `POST /api/notifications/read-all/`
- **Description:** Mark all unread notifications as read.
- **Auth Required:** Yes
- **Success Response (200 OK):** `{"message": "All notifications marked as read."}`

---

## 10. Pagination

All endpoints that return a list of items use standard DRF PageNumberPagination.
- **Query Parameters:** `page` (integer, default: 1), `page_size` (integer, default: 20)
- **Format:**
  ```json
  {
    "count": 150,
    "next": "https://api.expensetracker.com/api/transactions/?page=3",
    "previous": "https://api.expensetracker.com/api/transactions/?page=1",
    "results": [ ... ]
  }
  ```

---

## 11. Error Response Format

The API standardizes error responses using HTTP status codes and JSON bodies.

### 400 Bad Request (Validation Errors)
```json
{
  "field_name": [
    "Error message regarding this specific field."
  ],
  "non_field_errors": [
    "General error message not tied to a specific field."
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "A server error occurred."
}
```

---

## 12. Rate Limiting

To prevent abuse and ensure stability, the API employs rate limiting via DRF's built-in throttling mechanism.
- **AnonRateThrottle:** 100 requests per day (applied to endpoints not requiring authentication, such as register, login).
- **UserRateThrottle:** 10,000 requests per day, 60 requests per minute (applied to authenticated users).

If a rate limit is exceeded, the API returns a `429 Too Many Requests` status code.
- **Response Format:**
  ```json
  {
    "detail": "Request was throttled. Expected available in 55 seconds."
  }
  ```

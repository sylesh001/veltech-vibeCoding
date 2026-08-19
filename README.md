# ExpenseFlow 💰📊

ExpenseFlow is a modern, full-stack personal finance and expense tracking application built with **React (Vite + Tailwind CSS)** on the frontend and **Django REST Framework** on the backend.

---

## ✨ Features

- **Authentication & Security**: Secure JWT authentication (access & refresh tokens) with custom user registration and profiles.
- **Transactions Management**: Track and filter expenses and incomes with account associations and notes.
- **Budget Tracking**: Set monthly or category-wise budget limits and monitor utilization in real time.
- **Account Management**: Support for multiple account types (Bank Accounts, Credit Cards, Cash, Wallets).
- **Reports & Analytics**: Visual spending summaries, breakdowns by categories, and financial statistics.
- **Clean UI**: Modern responsive design tokens with full dark/light mode surface palette.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS**
- **React Router 6**
- **Axios** (JWT interceptors & authentication state)

### Backend
- **Django 5.1** + **Django REST Framework**
- **SimpleJWT** for token authentication
- **SQLite / MySQL** database support
- **Pytest** test suite (70+ test cases)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```
   > Backend API available at: `http://127.0.0.1:8000/api/`

---

### Frontend Setup

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   > Frontend available at: `http://localhost:5173/`

---

## 🧪 Running Tests

To run the full backend test suite:
```bash
cd Backend
pytest
```

---

## 📁 Project Structure

```
├── Backend/
│   ├── apps/
│   │   ├── accounts/     # Bank & wallet accounts management
│   │   ├── budgets/      # Budget goals & threshold tracking
│   │   ├── categories/   # Expense & income categories
│   │   ├── expenses/     # Expense logs
│   │   ├── incomes/      # Income logs
│   │   └── users/        # Custom user auth & JWT views
│   └── expense_tracker/  # Settings & root routing
├── Frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Modals
│   │   ├── context/      # AuthContext
│   │   └── pages/        # Dashboard, Transactions, Budgets, etc.
│   └── package.json
├── Docs/                 # SRS, API Specs & Database Design
├── requirements.txt
└── README.md
```


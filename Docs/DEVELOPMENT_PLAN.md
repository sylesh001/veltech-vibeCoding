# Expense Tracker Application - Development Plan

## 1. Project Overview
The Expense Tracker Application is a personal finance tool designed to help users record, categorize, and analyze their income and expenses. The application provides clear visibility into spending habits, supports budget management, and aids in financial decision-making through dynamic reports.

**Technology Stack:**
* **Backend:** Django 5.x, Django REST Framework (DRF)
* **Database:** MySQL 8.0+
* **Frontend:** React 18+ (Vite)
* **Authentication:** JWT via `djangorestframework-simplejwt`

**Primary Goals:**
* Create a responsive, intuitive single-page application (SPA).
* Provide robust APIs for transaction management, budgeting, and reporting.
* Ensure secure data storage and authentication.
* Deliver an MVP within an 8-week timeframe.

---

## 2. Team Structure

To effectively deliver the Expense Tracker, the following roles are recommended:

* **Backend Developer:** Responsible for the Django API, MySQL database schema, authentication, and backend business logic.
* **Frontend Developer:** Responsible for the React SPA, UI/UX implementation, state management, and API integration.
* **QA Engineer:** Responsible for writing and executing test plans, automated testing (e2e, integration), and ensuring requirements are met.
* **DevOps / SysAdmin:** Responsible for CI/CD pipelines, Docker setup, environment configuration, and deployment.

---

## 3. Development Phases & Milestones

The project will be executed in 6 distinct phases over an 8-week period.

### Phase 1: Project Setup & Infrastructure (Week 1)
**Goals:** Establish the foundation for both frontend and backend development.
* [ ] Initialize Django project and app structure.
* [ ] Configure MySQL 8.0+ database connection.
* [ ] Scaffold React application using Vite.
* [ ] Setup Git repository and branch protection rules.
* [ ] Configure Docker and `docker-compose` for local development.
* [ ] Setup CI/CD pipelines (e.g., GitHub Actions) for linting and basic testing.
* [ ] Define environment variables and `.env.example` files.

### Phase 2: Authentication & User Management (Week 2)
**Goals:** Secure the application and manage user accounts.
* [ ] Implement custom Django User model extending `AbstractUser`.
* [ ] Setup JWT authentication using `djangorestframework-simplejwt`.
* [ ] Create DRF endpoints for user registration, login, token refresh, and logout.
* [ ] Implement password reset flow (email verification).
* [ ] Create user profile CRUD endpoints.
* [ ] Develop React authentication pages (Login, Register).
* [ ] Implement React `AuthContext` and protected routes.

### Phase 3: Core Features — Accounts, Categories, Transactions (Weeks 3-4)
**Goals:** Implement the primary data entry and tracking functionalities.
* [ ] Backend CRUD APIs and MySQL schema for Accounts, Categories, and Transactions.
* [ ] Seed default categories (Income/Expense).
* [ ] Implement filtering, search, and pagination for transactions via `django-filter`.
* [ ] Build React pages for Account management and Category customization.
* [ ] Build React Transaction list and form views.
* [ ] Implement client-side form validation (React Hook Form).

### Phase 4: Budgets & Notifications (Week 5)
**Goals:** Allow users to set spending limits and receive alerts.
* [ ] Backend CRUD APIs for Budgets (overall and category-specific).
* [ ] Implement logic to check budget thresholds (80% and 100%) upon transaction entry.
* [ ] Create Notification model and API to serve alerts.
* [ ] Build React Budget UI with visual progress indicators.
* [ ] Implement Notification bell/dropdown in the React header.

### Phase 5: Dashboard & Reports (Week 6)
**Goals:** Provide insights and data visualization.
* [ ] Develop Dashboard API to aggregate totals (income, expense, balance) and category breakdowns.
* [ ] Integrate Recharts in React to render dynamic pie and bar charts.
* [ ] Create monthly/yearly trend reports API.
* [ ] Implement CSV and PDF export functionality (ReportLab on backend or client-side).
* [ ] Build the main React Dashboard view.

### Phase 6: Polish, Testing & Deployment (Weeks 7-8)
**Goals:** Ensure quality, security, and release to production.
* [ ] Write and execute comprehensive automated tests:
  * Backend: `pytest-django`, `factory-boy`.
  * Frontend: Jest, React Testing Library.
  * E2E: Cypress or Playwright.
* [ ] Perform security hardening (CORS, secure headers, rate limiting).
* [ ] Optimize MySQL queries and add necessary indexes.
* [ ] Conduct cross-browser and responsive design QA.
* [ ] Finalize deployment via Docker (Nginx, Gunicorn) to a production server/cloud.
* [ ] Complete API and user documentation.

---

## 4. Technology Decisions

**Backend:**
* `Django`: High-level Python web framework.
* `djangorestframework`: For building RESTful APIs.
* `djangorestframework-simplejwt`: Token-based authentication.
* `django-cors-headers`: Handling Cross-Origin Resource Sharing.
* `django-filter`: Queryset filtering from URL parameters.
* `Pillow`: Image processing (e.g., receipt uploads, avatars).
* `ReportLab`: PDF generation.
* `mysqlclient`: MySQL database adapter.

**Frontend:**
* `React`: Core UI library.
* `React Router`: Client-side routing.
* `Axios`: HTTP client for API requests.
* `Recharts`: Composable charting library.
* `React Hook Form`: Form state management and validation.
* `React Toastify`: Notification popups.

**Testing:**
* `pytest`, `pytest-django`: Backend unit testing.
* `factory-boy`: Test data generation.
* `Jest`, `React Testing Library`: Frontend unit/component testing.
* `Cypress`: End-to-end testing.

**DevOps & Infrastructure:**
* `Docker`, `docker-compose`: Containerization.
* `Nginx`: Reverse proxy and static file serving.
* `Gunicorn`: Python WSGI HTTP Server.

---

## 5. Project Structure

Suggested directory tree to keep concerns separated:

```text
expense-tracker/
├── backend/
│   ├── core/                 # Django project settings
│   ├── users/                # User model and auth APIs
│   ├── transactions/         # Accounts, Categories, Transactions logic
│   ├── budgets/              # Budget and Notification logic
│   ├── reports/              # Dashboard aggregation and exports
│   ├── requirements.txt      # Python dependencies
│   ├── manage.py
│   ├── Dockerfile
│   └── pytest.ini
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Images, styles
│   │   ├── components/       # Reusable UI components (Buttons, Modals)
│   │   ├── contexts/         # React Context (AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # View components (Dashboard, Login, Transactions)
│   │   ├── services/         # API calls (axios instances)
│   │   ├── utils/            # Helper functions (formatting, validation)
│   │   ├── App.jsx           # Main routing
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 6. Environment Setup

The project requires `.env` files for both frontend and backend to manage sensitive data and environment-specific settings.

**Backend `.env`**
```env
DEBUG=True
SECRET_KEY=your_django_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173

# MySQL Database
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=secret
DB_HOST=db
DB_PORT=3306

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

**Frontend `.env`**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 7. Git Workflow

We will follow a standardized Git workflow to ensure code quality and seamless collaboration.

* **Main Branches:**
  * `main`: Production-ready code.
  * `develop`: Integration branch for ongoing development.
* **Feature Branches:** Create branches from `develop` named `feature/<short-description>` (e.g., `feature/jwt-auth`).
* **Bugfix/Hotfix Branches:** Named `bugfix/<issue>` or `hotfix/<issue>`.
* **Commit Messages:** Follow conventional commits (e.g., `feat: add transaction API`, `fix: correct balance calculation`).
* **Pull Requests (PRs):**
  * PRs must be made against the `develop` branch.
  * Require at least one code review approval.
  * CI checks (linting, tests) must pass before merging.

---

## 8. Risk Register

| Risk | Impact | Likelihood | Mitigation Strategy |
|---|---|---|---|
| **Scope Creep** | High | High | Strictly adhere to the MVP defined in the SRS. Defer complex features (bank sync) to post-launch phases. |
| **MySQL Performance at Scale** | Medium | Low | Use appropriate indexing (e.g., on `user_id`, `date`). Monitor query performance and optimize ORM usage. |
| **JWT Security** | High | Medium | Store tokens securely. Use short expiration times for access tokens and handle refresh securely. |
| **Third-Party Dependency Issues** | Medium | Medium | Pin dependency versions in `requirements.txt` and `package.json`. Regularly audit for security vulnerabilities. |

---

## 9. Definition of Done (DoD)

A feature or user story is considered complete only when it meets the following criteria:
* [ ] **Code Complete:** Implemented according to requirements.
* [ ] **Code Reviewed:** Approved by at least one peer developer.
* [ ] **Tested:** Unit and integration tests written and passing.
* [ ] **Documented:** API endpoints documented; inline comments added where complex.
* [ ] **Deployed:** Successfully deployed and tested in the staging environment.

---

## 10. Milestones & Timeline

| Phase | Milestone | Duration | Timeline |
|---|---|---|---|
| Phase 1 | Project Setup & Infrastructure | 1 Week | Week 1 |
| Phase 2 | Authentication & User Management | 1 Week | Week 2 |
| Phase 3 | Core Features (Accounts, Categories, Transactions) | 2 Weeks | Weeks 3-4 |
| Phase 4 | Budgets & Notifications | 1 Week | Week 5 |
| Phase 5 | Dashboard & Reports | 1 Week | Week 6 |
| Phase 6 | Polish, Testing & Deployment | 2 Weeks | Weeks 7-8 |

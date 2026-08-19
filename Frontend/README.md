# ExpenseFlow — React Frontend

Converted from the Stitch export (`stitch_expenseflow_finance_dashboard.zip`)
into a working Vite + React + Tailwind CSS project.

## What's included

- `src/pages/` — one component per Stitch screen: Dashboard, Transactions,
  Budgets, Accounts, Reports, plus a placeholder Settings page.
- `src/components/Sidebar.jsx`, `MobileNav.jsx`, `TopBar.jsx` — the
  navigation chrome, extracted once from the duplicated markup in each
  Stitch export and shared across all pages via `Layout.jsx`.
- `tailwind.config.js` — rebuilt from the design tokens in
  `expenseflow/DESIGN.md` (colors, spacing, typography, radii) so the
  Tailwind utility classes from Stitch (`bg-primary`, `text-on-surface`,
  `font-headline-lg`, etc.) work unmodified.
- React Router is wired up so the sidebar/mobile nav links actually
  navigate between screens.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Notes / next steps

- All data on each screen (balances, transactions, budgets) is currently
  static, exactly as Stitch generated it. Replace it with real data by
  fetching from your API and passing it into the page components as props
  or via state.
- The `+ Add Transaction` button, filters, and modals are visual only —
  wire up `onClick`/`onSubmit` handlers as you connect the backend.
- The user avatar in the top bar uses a placeholder image
  (`https://i.pravatar.cc/80`) — swap in the real user's photo.
- Chart placeholders (the donut/bar charts on Dashboard and Reports) are
  static CSS shapes. Swap them for a real charting library (e.g. Recharts)
  once you have live data.

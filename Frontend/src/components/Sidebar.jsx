import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
  { to: '/budgets', label: 'Budgets', icon: 'account_balance_wallet' },
  { to: '/accounts', label: 'Accounts', icon: 'account_balance' },
  { to: '/reports', label: 'Reports', icon: 'assessment' },
]

const linkBase =
  'flex items-center gap-md px-lg py-sm rounded-lg font-label-md text-label-md transition-all'
const linkInactive =
  'text-on-surface-variant dark:text-outline hover:bg-surface-container-low dark:hover:bg-surface-container-high'
const linkActive = 'bg-primary-container text-on-primary-container'

export default function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col h-screen py-xl border-r border-outline-variant dark:border-outline fixed left-0 top-0 w-72 bg-surface dark:bg-surface-dim shadow-[0px_10px_32px_rgba(0,0,0,0.08)] z-40">
      <div className="px-lg mb-xl">
        <span className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed-dim font-extrabold tracking-tight">
          ExpenseFlow
        </span>
      </div>

      <div className="flex flex-col px-md gap-sm flex-grow mt-8">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : linkInactive}`
            }
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto px-md pb-lg">
        <NavLink to="/settings" className={`${linkBase} ${linkInactive}`}>
          <span className="material-symbols-outlined">settings</span>
          Settings
        </NavLink>
      </div>
    </nav>
  )
}

import { NavLink } from 'react-router-dom'

const MOBILE_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/transactions', label: 'Spend', icon: 'payments' },
  { to: '/budgets', label: 'Budget', icon: 'savings' },
  { to: '/accounts', label: 'Accounts', icon: 'account_balance' },
  { to: '/reports', label: 'More', icon: 'more_horiz' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] bg-surface dark:bg-surface-dim md:hidden flex justify-around items-center px-4 pb-safe pt-2">
      {MOBILE_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-4 py-1 rounded-full active:scale-90 transition-transform ${
              isActive
                ? 'text-primary dark:text-primary-fixed-dim bg-surface-container-highest'
                : 'text-on-surface-variant dark:text-outline active:bg-surface-container-high'
            }`
          }
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {item.icon}
          </span>
          <span className="font-label-sm text-label-sm mt-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

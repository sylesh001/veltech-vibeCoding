import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import MobileNav from './MobileNav.jsx'
import TopBar from './TopBar.jsx'

export default function Layout() {
  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-24 md:pb-8">
      <TopBar userAvatarUrl="https://i.pravatar.cc/80" />
      <Sidebar />

      <main className="w-full md:pl-72">
        <div className="w-full max-w-container-max px-md md:px-gutter mx-auto mt-xl">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

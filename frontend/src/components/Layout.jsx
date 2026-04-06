import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, GraduationCap, Calendar, Bell, Users, ClipboardList, LogOut, Shield, ChevronRight } from 'lucide-react'

const navItems = {
  admin: [
    { to:'/dashboard', icon:LayoutDashboard, label:'Басты бет' },
    { to:'/users',     icon:Users,           label:'Пайдаланушылар' },
    { to:'/subjects',  icon:BookOpen,        label:'Пәндер' },
    { to:'/groups',    icon:GraduationCap,   label:'Топтар' },
    { to:'/schedule',  icon:Calendar,        label:'Кесте' },
    { to:'/grades',    icon:ClipboardList,   label:'Бағалар' },
    { to:'/notifications', icon:Bell,        label:'Хабарламалар' },
  ],
  teacher: [
    { to:'/dashboard',     icon:LayoutDashboard, label:'Басты бет' },
    { to:'/subjects',      icon:BookOpen,        label:'Пәндерім' },
    { to:'/grades',        icon:ClipboardList,   label:'Бағалар' },
    { to:'/assignments',   icon:GraduationCap,   label:'Тапсырмалар' },
    { to:'/schedule',      icon:Calendar,        label:'Кесте' },
    { to:'/notifications', icon:Bell,            label:'Хабарламалар' },
  ],
  student: [
    { to:'/dashboard',     icon:LayoutDashboard, label:'Басты бет' },
    { to:'/subjects',      icon:BookOpen,        label:'Пәндерім' },
    { to:'/grades',        icon:ClipboardList,   label:'Бағаларым' },
    { to:'/assignments',   icon:GraduationCap,   label:'Тапсырмалар' },
    { to:'/schedule',      icon:Calendar,        label:'Кестем' },
    { to:'/notifications', icon:Bell,            label:'Хабарламалар' },
  ],
}

const roleLabel = { admin:'Администратор', teacher:'Оқытушы', student:'Студент' }
const roleBadge = { admin:'bg-red-500', teacher:'bg-blue-500', student:'bg-green-500' }

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const items = navItems[user?.role] || []

  return (
    <div className="flex h-screen" style={{background:'#f0f4f8'}}>
      {/* Sidebar */}
      <aside className="w-72 flex flex-col" style={{background:'#0a2463', boxShadow:'4px 0 20px rgba(0,0,0,0.3)'}}>
        
        {/* Logo */}
        <div className="p-6" style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'#e63946'}}>
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-lg tracking-wide">CyberEdu</div>
              <div className="text-xs tracking-widest uppercase" style={{color:'rgba(255,255,255,0.5)'}}>Қауіпсіз Оқу Порталы</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="p-4 mx-3 my-3 rounded-xl" style={{background:'rgba(255,255,255,0.07)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{background:'#e63946'}}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.full_name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${roleBadge[user?.role]}`}/>
                <span className="text-xs" style={{color:'rgba(255,255,255,0.5)'}}>{roleLabel[user?.role]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-3 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-widest mb-2 px-3" style={{color:'rgba(255,255,255,0.3)'}}>
            Навигация
          </div>
          {items.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all"
                style={{
                  background: active ? 'rgba(230,57,70,0.9)' : 'transparent',
                  color: active ? 'white' : 'rgba(255,255,255,0.65)',
                }}>
                <Icon size={17} />
                <span className="flex-1 font-medium">{label}</span>
                {active && <ChevronRight size={14}/>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{borderTop:'1px solid rgba(255,255,255,0.1)'}}>
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm transition-all"
            style={{color:'rgba(255,255,255,0.5)'}}>
            <LogOut size={17}/>
            <span>Шығу</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white px-8 py-4 flex items-center justify-between" style={{boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">
              {items.find(i => i.to === location.pathname)?.label || 'UniLMS'}
            </h2>
            <p className="text-xs text-gray-400">АУЭС — Қауіпсіз Оқу Порталы</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background:'#0a2463'}}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
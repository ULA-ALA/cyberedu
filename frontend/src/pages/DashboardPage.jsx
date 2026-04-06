import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Users, BookOpen, GraduationCap, ClipboardList, Bell } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ users:0, subjects:0, groups:0, grades:0 })
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data.slice(0,5))).catch(()=>{})
    if (user?.role === 'admin') {
      Promise.all([
        api.get('/users'),
        api.get('/subjects'),
        api.get('/groups'),
        api.get('/grades'),
      ]).then(([u, s, g, gr]) => {
        setStats({ users:u.data.length, subjects:s.data.length, groups:g.data.length, grades:gr.data.length })
      }).catch(()=>{})
    }
  }, [user])

  const chartData = [
    { name:'Қаң', students:45 },
    { name:'Ақп', students:52 },
    { name:'Нау', students:48 },
    { name:'Сәу', students:61 },
    { name:'Мам', students:55 },
    { name:'Мау', students:67 },
  ]

  const gradeData = [
    { grade:'5', count:28 },
    { grade:'4', count:42 },
    { grade:'3', count:18 },
    { grade:'2', count:5 },
  ]

  const kpiCards = [
    { label:'Пайдаланушылар', value:stats.users,    icon:Users,          bg:'bg-blue-50',   iconBg:'bg-blue-100',   textColor:'text-blue-600' },
    { label:'Пандер',         value:stats.subjects,  icon:BookOpen,       bg:'bg-green-50',  iconBg:'bg-green-100',  textColor:'text-green-600' },
    { label:'Топтар',         value:stats.groups,    icon:GraduationCap,  bg:'bg-purple-50', iconBg:'bg-purple-100', textColor:'text-purple-600' },
    { label:'Багалар',        value:stats.grades,    icon:ClipboardList,  bg:'bg-orange-50', iconBg:'bg-orange-100', textColor:'text-orange-600' },
  ]

  const roleGreeting = { admin:'Административтик панель', teacher:'Окытушы кабинеті', student:'Студент кабинеті' }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{roleGreeting[user?.role]}</h1>
        <p className="text-gray-500 mt-1">Қош келдіңіз, <span className="font-medium text-gray-700">{user?.full_name}</span>!</p>
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {kpiCards.map(({ label, value, icon:Icon, bg, iconBg, textColor }) => (
              <div key={label} className={`${bg} rounded-xl p-6 border border-gray-100`}>
                <div className={`${iconBg} p-3 rounded-lg w-fit mb-4`}>
                  <Icon size={20} className={textColor}/>
                </div>
                <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
                <div className="text-sm text-gray-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Студенттер белсенділігі</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="name" tick={{ fontSize:12 }}/>
                  <YAxis tick={{ fontSize:12 }}/>
                  <Tooltip/>
                  <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} dot={{ r:4 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Багалар болінісі</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                  <XAxis dataKey="grade" tick={{ fontSize:12 }}/>
                  <YAxis tick={{ fontSize:12 }}/>
                  <Tooltip/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-blue-600"/>
          <h3 className="font-semibold text-gray-800">Соңғы хабарламалар</h3>
        </div>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Хабарламалар жоқ</p>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-100'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}/>
                <div>
                  <div className="text-sm font-medium text-gray-800">{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
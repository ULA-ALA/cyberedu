import { useState, useEffect } from 'react'
import api from '../services/api'
import { Bell, CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])

  const fetchNotifs = () => api.get('/notifications').then(r => setNotifications(r.data)).catch(()=>{})
  useEffect(() => { fetchNotifs() }, [])

  const markRead = async id => {
    await api.put(`/notifications/${id}/read`)
    fetchNotifs()
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    fetchNotifs()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хабарламалар</h1>
          <p className="text-gray-500 text-sm mt-1">{unreadCount} оқылмаган</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <CheckCheck size={16}/> Барлығын оқыдым
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell size={40} className="mx-auto mb-3 text-gray-200"/>
            <p className="text-sm">Хабарламалар жоқ</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition-all ${
              n.is_read ? 'border-gray-100' : 'border-blue-200 hover:border-blue-300'
            }`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`}/>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</span>
                  <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
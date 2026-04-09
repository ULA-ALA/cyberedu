import { useState, useEffect } from 'react'
import api from '../services/api'
import { Clock, MapPin, BookOpen, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Дүйсенбі','Сейсенбі','Сәрсенбі','Бейсенбі','Жұма']

export default function SchedulePage() {
  const { user } = useAuth()
  const [schedule, setSchedule] = useState([])
  const [subjects, setSubjects] = useState([])
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    subject_id: '',
    group_id: '',
    day_of_week: 'Дүйсенбі',
    start_time: '08:00',
    end_time: '09:30',
    room: ''
  })

  const fetchAll = () => {
    api.get('/schedule').then(r => setSchedule(r.data)).catch(()=>{})
    api.get('/subjects').then(r => setSubjects(r.data)).catch(()=>{})
    api.get('/groups').then(r => setGroups(r.data)).catch(()=>{})
  }

  useEffect(() => { fetchAll() }, [])

  const getSubjectName = id => subjects.find(s => s.id === id)?.name || `Пән ${id}`
  const getGroupName = id => groups.find(g => g.id === id)?.name || `Топ ${id}`
  const daySchedule = day => schedule.filter(s => s.day_of_week === day)

  const colors = ['bg-blue-50 border-blue-200','bg-green-50 border-green-200','bg-purple-50 border-purple-200','bg-orange-50 border-orange-200','bg-pink-50 border-pink-200']
  const textColors = ['text-blue-700','text-green-700','text-purple-700','text-orange-700','text-pink-700']

  const handleCreate = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/schedule', {
        ...form,
        subject_id: parseInt(form.subject_id),
        group_id: parseInt(form.group_id)
      })
      setShowModal(false)
      setForm({ subject_id:'', group_id:'', day_of_week:'Дүйсенбі', start_time:'08:00', end_time:'09:30', room:'' })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Жоюға сенімдісіз бе?')) return
    try {
      await api.delete(`/schedule/${id}`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Сабақ кестесі</h1>
          <p className="text-gray-500 text-sm mt-1">Апталық кесте</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16}/> Сабақ қосу
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {DAYS.map((day, di) => (
          <div key={day} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-800 text-white px-4 py-3 text-sm font-semibold text-center">{day}</div>
            <div className="p-3 space-y-2">
              {daySchedule(day).length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-xs">Сабақ жоқ</div>
              ) : (
                daySchedule(day).map((item, i) => (
                  <div key={item.id} className={`${colors[i % colors.length]} border rounded-lg p-3 relative`}>
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(item.id)} className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-500">
                        <Trash2 size={11}/>
                      </button>
                    )}
                    <div className={`font-semibold text-xs ${textColors[i % textColors.length]} mb-1`}>
                      <BookOpen size={10} className="inline mr-1"/>
                      {getSubjectName(item.subject_id)}
                    </div>
                    <div className="text-gray-400 text-xs mb-1">{getGroupName(item.group_id)}</div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <Clock size={10}/> {item.start_time} – {item.end_time}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <MapPin size={10}/> {item.room}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Сабақ қосу</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пән</label>
                <select value={form.subject_id} onChange={e => setForm({...form, subject_id:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Таңдаңыз</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Топ</label>
                <select value={form.group_id} onChange={e => setForm({...form, group_id:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Таңдаңыз</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Күн</label>
                <select value={form.day_of_week} onChange={e => setForm({...form, day_of_week:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Басталуы</label>
                  <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Аяқталуы</label>
                  <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Аудитория</label>
                <input value={form.room} onChange={e => setForm({...form, room:e.target.value})} required placeholder="А-301" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Бас тарту</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Сақталуда...' : 'Сақтау'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
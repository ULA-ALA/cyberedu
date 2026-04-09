import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Trash2, Users } from 'lucide-react'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', year:2024, specialty:'' })
  const [loading, setLoading] = useState(false)

  const fetchGroups = () => api.get('/groups/').then(r => setGroups(r.data)).catch(() => api.get('/groups').then(r => setGroups(r.data)))
  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/groups', form)
      setShowModal(false)
      setForm({ name:'', year:2024, specialty:'' })
      fetchGroups()
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async id => {
    if (!confirm('Жоюға сенімдісіз бе?')) return
    try {
      await api.delete(`/groups/${id}`)
      fetchGroups()
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Топтар</h1>
          <p className="text-gray-500 text-sm mt-1">{groups.length} топ</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16}/> Жаңа топ
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={18} className="text-blue-600"/>
              </div>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded transition-colors">
                <Trash2 size={15}/>
              </button>
            </div>
            <div className="font-semibold text-gray-900">{g.name}</div>
            <div className="text-xs text-gray-400 mt-1">{g.specialty} • {g.year} жыл</div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Топтар жоқ</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Жаңа топ</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Топ атауы</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="БИТ-21-1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Мамандық</label>
                <input value={form.specialty} onChange={e => setForm({...form, specialty:e.target.value})} required placeholder="Ақпараттық қауіпсіздік" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Қабылдау жылы</label>
                <input type="number" value={form.year} onChange={e => setForm({...form, year:parseInt(e.target.value)})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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
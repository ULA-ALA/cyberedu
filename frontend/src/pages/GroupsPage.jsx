import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, Users } from 'lucide-react'

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', year:'' })

  const fetchGroups = () => api.get('/groups').then(r => setGroups(r.data)).catch(()=>{})
  useEffect(() => { fetchGroups() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    try {
      await api.post('/groups', { name: form.name, year: form.year ? Number(form.year) : null })
      setShowModal(false)
      setForm({ name:'', year:'' })
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
          <Plus size={16}/> Жана топ
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {groups.map(g => (
          <div key={g.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={20} className="text-indigo-600"/>
            </div>
            <div className="font-bold text-gray-900">{g.name}</div>
            {g.year && <div className="text-xs text-gray-400 mt-1">{g.year}-жылгы қабылдау</div>}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Жана топ</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Топ атауы</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="мысалы: ИС-22-1" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Қабылдау жылы</label>
                <input type="number" value={form.year} onChange={e => setForm({...form, year:e.target.value})} placeholder="2022" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700">Бас тарту</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Сақтау</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
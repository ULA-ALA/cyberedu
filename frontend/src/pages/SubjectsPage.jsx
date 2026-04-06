import { useState, useEffect } from 'react'
import api from '../services/api'
import { Plus, BookOpen, Trash2 } from 'lucide-react'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', code:'', credits:3 })

  const fetchSubjects = () => api.get('/subjects').then(r => setSubjects(r.data))
  useEffect(() => { fetchSubjects() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    try {
      await api.post('/subjects', { ...form, credits: Number(form.credits) })
      setShowModal(false)
      setForm({ name:'', code:'', credits:3 })
      fetchSubjects()
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    }
  }

  const handleDelete = async id => {
    if (!confirm('Жоюга сенімдісіз бе?')) return
    await api.delete(`/subjects/${id}`)
    fetchSubjects()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пандер</h1>
          <p className="text-gray-500 text-sm mt-1">{subjects.length} пан</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16}/> Жана пан
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {subjects.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600"/>
              </div>
              <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 size={14}/>
              </button>
            </div>
            <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
            <div className="text-xs text-gray-400 mt-1">{s.code}</div>
            <div className="mt-3">
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s.credits} кредит</span>
            </div>
          </div>
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Пандер жоқ</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Жана пан</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пан атауы</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
                <input value={form.code} onChange={e => setForm({...form, code:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Кредиттер</label>
                <input type="number" min="1" max="10" value={form.credits} onChange={e => setForm({...form, credits:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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
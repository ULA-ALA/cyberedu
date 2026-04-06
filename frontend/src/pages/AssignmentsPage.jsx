import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Plus, Upload, FileText, Clock } from 'lucide-react'

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', subject_id:'', deadline:'' })
  const [file, setFile] = useState(null)

  useEffect(() => {
    api.get('/assignments').then(r => setAssignments(r.data)).catch(()=>{})
    api.get('/subjects').then(r => setSubjects(r.data)).catch(()=>{})
  }, [])

  const getSubjectName = id => subjects.find(s => s.id === id)?.name || `Пан ${id}`
  const isOverdue = deadline => deadline && new Date(deadline) < new Date()

  const handleCreate = async e => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('subject_id', form.subject_id)
    if (form.deadline) fd.append('deadline', form.deadline)
    if (file) fd.append('file', file)
    try {
      await api.post('/assignments', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      setShowModal(false)
      setForm({ title:'', description:'', subject_id:'', deadline:'' })
      setFile(null)
      api.get('/assignments').then(r => setAssignments(r.data))
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    }
  }

  const handleSubmit = async assignmentId => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async e => {
      const fd = new FormData()
      fd.append('file', e.target.files[0])
      try {
        await api.post(`/assignments/${assignmentId}/submit`, fd, { headers:{ 'Content-Type':'multipart/form-data' } })
        alert('Тапсырма жіберілді!')
      } catch (err) {
        alert(err.response?.data?.detail || 'Қате')
      }
    }
    input.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тапсырмалар</h1>
          <p className="text-gray-500 text-sm mt-1">{assignments.length} тапсырма</p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16}/> Жана тапсырма
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-purple-600"/>
              </div>
              {a.deadline && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOverdue(a.deadline) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {isOverdue(a.deadline) ? 'Мерзімі отті' : 'Белсенді'}
                </span>
              )}
            </div>
            <div className="font-semibold text-gray-900 text-sm mb-1">{a.title}</div>
            <div className="text-xs text-blue-600 mb-2">{getSubjectName(a.subject_id)}</div>
            {a.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{a.description}</p>}
            {a.deadline && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <Clock size={11}/> {new Date(a.deadline).toLocaleDateString('ru-RU')}
              </div>
            )}
            {user?.role === 'student' && (
              <button onClick={() => handleSubmit(a.id)} className="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors w-full justify-center mt-2">
                <Upload size={12}/> Тапсыру
              </button>
            )}
          </div>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Тапсырмалар жоқ</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Жана тапсырма</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Атауы</label>
                <input value={form.title} onChange={e => setForm({...form, title:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сипаттама</label>
                <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пан</label>
                <select value={form.subject_id} onChange={e => setForm({...form, subject_id:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Таңдаңыз</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тапсыру мерзімі</label>
                <input type="datetime-local" value={form.deadline} onChange={e => setForm({...form, deadline:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Файл (міндетті емес)</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"/>
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
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Plus, Star } from 'lucide-react'

export default function GradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ student_id:'', subject_id:'', score:'', comment:'' })

  useEffect(() => {
    api.get('/grades').then(r => setGrades(r.data)).catch(()=>{})
    api.get('/subjects').then(r => setSubjects(r.data)).catch(()=>{})
    if (user?.role !== 'student') {
      api.get('/users').then(r => setStudents(r.data.filter(u => u.role === 'student'))).catch(()=>{})
    }
  }, [user])

  const handleCreate = async e => {
    e.preventDefault()
    try {
      await api.post('/grades', {
        student_id: Number(form.student_id),
        subject_id: Number(form.subject_id),
        score: Number(form.score),
        comment: form.comment
      })
      setShowModal(false)
      setForm({ student_id:'', subject_id:'', score:'', comment:'' })
      api.get('/grades').then(r => setGrades(r.data))
    } catch (err) {
      alert(err.response?.data?.detail || 'Қате')
    }
  }

  const getSubjectName = id => subjects.find(s => s.id === id)?.name || id
  const scoreColor = score => score >= 4 ? 'text-green-600 bg-green-50' : score >= 3 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Багалар</h1>
          <p className="text-gray-500 text-sm mt-1">{grades.length} жазба</p>
        </div>
        {user?.role !== 'student' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus size={16}/> Баға қою
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Пан','Баға','Пікір','Күні'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {grades.map(g => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{getSubjectName(g.subject_id)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreColor(g.score)}`}>{g.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{g.comment || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{new Date(g.created_at).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {grades.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">Багалар жоқ</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Баға қою</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Студент</label>
                <select value={form.student_id} onChange={e => setForm({...form, student_id:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Таңдаңыз</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пан</label>
                <select value={form.subject_id} onChange={e => setForm({...form, subject_id:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Таңдаңыз</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Баға (1-5)</label>
                <input type="number" min="1" max="5" step="0.1" value={form.score} onChange={e => setForm({...form, score:e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Пікір</label>
                <textarea value={form.comment} onChange={e => setForm({...form, comment:e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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
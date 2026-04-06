import { useState, useEffect } from 'react'
import api from '../services/api'
import { Clock, MapPin, BookOpen } from 'lucide-react'

const DAYS = ['Дуйсенбі','Сейсенбі','Сарсенбі','Бейсенбі','Жума']

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([])
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    api.get('/schedule').then(r => setSchedule(r.data)).catch(()=>{})
    api.get('/subjects').then(r => setSubjects(r.data)).catch(()=>{})
  }, [])

  const getSubjectName = id => subjects.find(s => s.id === id)?.name || `Пан ${id}`
  const daySchedule = day => schedule.filter(s => s.day_of_week === day)

  const colors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-purple-50 border-purple-200',
    'bg-orange-50 border-orange-200',
    'bg-pink-50 border-pink-200'
  ]
  const textColors = [
    'text-blue-700',
    'text-green-700',
    'text-purple-700',
    'text-orange-700',
    'text-pink-700'
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Сабақ кестесі</h1>
        <p className="text-gray-500 text-sm mt-1">Апталық кесте</p>
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
                  <div key={item.id} className={`${colors[i % colors.length]} border rounded-lg p-3`}>
                    <div className={`font-semibold text-xs ${textColors[i % textColors.length]} mb-1`}>
                      <BookOpen size={10} className="inline mr-1"/>
                      {getSubjectName(item.subject_id)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <Clock size={10}/>
                      <span>{item.start_time} – {item.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <MapPin size={10}/>
                      <span>{item.room}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Clock size={40} className="mx-auto mb-3 text-gray-200"/>
          <p className="text-sm">Кесте толтырылмаган</p>
        </div>
      )}
    </div>
  )
}
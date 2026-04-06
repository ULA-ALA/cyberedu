import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    const email = emailRef.current.value
    const password = passwordRef.current.value
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      console.error(e)
      setError('Email немесе пароль дурыс емес')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg, #1e3a8a, #2563eb)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <div style={{width:'100%', maxWidth:'400px'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'64px', height:'64px', background:'white', borderRadius:'16px', marginBottom:'16px'}}>
            <Shield size={32} color="#2563eb" />
          </div>
          <h1 style={{color:'white', fontSize:'28px', fontWeight:'bold', margin:'0'}}>UniLMS</h1>
          <p style={{color:'#93c5fd', marginTop:'4px'}}>АУЭС Университеті</p>
        </div>
        <div style={{background:'white', borderRadius:'16px', padding:'32px', boxShadow:'0 25px 50px rgba(0,0,0,0.3)'}}>
          <h2 style={{fontSize:'20px', fontWeight:'600', marginBottom:'24px', color:'#1f2937'}}>Жүйеге кіру</h2>
          {error && (
            <div style={{background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px'}}>
              {error}
            </div>
          )}
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', fontSize:'14px', fontWeight:'500', color:'#374151', marginBottom:'4px'}}>Email</label>
            <input ref={emailRef} type="text" defaultValue="admin@unilms.kz"
              style={{width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', fontSize:'14px', fontWeight:'500', color:'#374151', marginBottom:'4px'}}>Пароль</label>
            <input ref={passwordRef} type="text" defaultValue="admin123"
              style={{width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box'}}/>
          </div>
          <button onClick={handleLogin} disabled={loading}
            style={{width:'100%', padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>
            {loading ? 'Кіруде...' : 'Кіру'}
          </button>
          <p style={{textAlign:'center', fontSize:'12px', color:'#9ca3af', marginTop:'16px'}}>admin@unilms.kz / admin123</p>
        </div>
      </div>
    </div>
  )
}
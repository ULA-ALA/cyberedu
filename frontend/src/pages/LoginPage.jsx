import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email және пароль енгізіңіз')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Email немесе пароль дұрыс емес')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = () => {
    if (!email) {
      setError('Алдымен email енгізіңіз')
      return
    }
    setForgotSent(true)
    setError('')
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg, #0a2463, #1e5fa8)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
      <div style={{width:'100%', maxWidth:'420px'}}>
        <div style={{textAlign:'center', marginBottom:'32px'}}>
          <div style={{display:'inline-flex', alignItems:'center', justifyContent:'center', width:'72px', height:'72px', background:'white', borderRadius:'20px', marginBottom:'16px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)'}}>
            <Shield size={36} color="#0a2463" />
          </div>
          <h1 style={{color:'white', fontSize:'32px', fontWeight:'bold', margin:'0'}}>CyberEdu</h1>
          <p style={{color:'rgba(255,255,255,0.6)', marginTop:'6px', fontSize:'14px'}}>Қауіпсіз Оқу Порталы — АУЭС</p>
        </div>

        <div style={{background:'white', borderRadius:'20px', padding:'36px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
          <h2 style={{fontSize:'22px', fontWeight:'700', marginBottom:'24px', color:'#0a2463', margin:'0 0 24px 0'}}>Жүйеге кіру</h2>

          {error && (
            <div style={{background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'12px 16px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px'}}>
              {error}
            </div>
          )}

          {forgotSent && (
            <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#16a34a', padding:'12px 16px', borderRadius:'10px', marginBottom:'16px', fontSize:'14px'}}>
              ✅ Нұсқаулар {email} адресіне жіберілді
            </div>
          )}

          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block', fontSize:'14px', fontWeight:'600', color:'#374151', marginBottom:'6px'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@unilms.kz"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{width:'100%', padding:'12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', boxSizing:'border-box', outline:'none', transition:'border-color 0.2s'}}
              onFocus={e => e.target.style.borderColor = '#0a2463'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{marginBottom:'8px'}}>
            <label style={{display:'block', fontSize:'14px', fontWeight:'600', color:'#374151', marginBottom:'6px'}}>Пароль</label>
            <div style={{position:'relative'}}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Паролді енгізіңіз"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{width:'100%', padding:'12px 44px 12px 14px', border:'1.5px solid #e5e7eb', borderRadius:'10px', fontSize:'14px', boxSizing:'border-box', outline:'none'}}
                onFocus={e => e.target.style.borderColor = '#0a2463'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'0'}}
              >
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <div style={{textAlign:'right', marginBottom:'20px'}}>
            <button
              type="button"
              onClick={handleForgot}
              style={{background:'none', border:'none', color:'#1e5fa8', fontSize:'13px', cursor:'pointer', fontWeight:'500'}}
            >
              Парольді ұмыттыңыз ба?
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{width:'100%', padding:'13px', background: loading ? '#93c5fd' : '#0a2463', color:'white', border:'none', borderRadius:'10px', fontSize:'15px', fontWeight:'700', cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.2s'}}
          >
            {loading ? 'Кіруде...' : 'Кіру'}
          </button>
        </div>
      </div>
    </div>
  )
}
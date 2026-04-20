// PÁGINA LOGIN — ENTRAR NA CONTA
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setErro('')
    if (!form.email || !form.senha) {
      setErro('Preencha todos os campos')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, senha: form.senha })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/'
      } else {
        setErro(data.message || 'E-mail ou senha incorretos')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }
        .input-field {
          width:100%;
          padding:14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:10px;
          color:#fff;
          font-size:15px;
          font-family:'Barlow',sans-serif;
          outline:none;
          transition:border .2s;
        }
        .input-field:focus { border-color:#F5A800; }
        .input-field::placeholder { color:#4A5B7A; }
        .btn-entrar {
          width:100%;
          padding:18px;
          border:none;
          border-radius:12px;
          cursor:pointer;
          font-family:'Barlow',sans-serif;
          font-size:16px;
          font-weight:700;
          letter-spacing:2px;
          text-transform:uppercase;
          background:linear-gradient(135deg,#FFD060,#F5A800,#C88000);
          color:#04091C;
          transition:all .2s;
          box-shadow:0 8px 32px rgba(245,168,0,.3);
        }
        .btn-entrar:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(245,168,0,.5); }
        .btn-entrar:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .label { font-size:13px; color:#7A8BB0; font-weight:600; margin-bottom:6px; letter-spacing:1px; display:block; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#04091C', padding:'20px 16px 60px', fontFamily:"'Barlow',sans-serif" }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>

          <div style={{ textAlign:'center', padding:'32px 0 32px' }}>
            <Link href="/" style={{ textDecoration:'none' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:36, color:'#F5A800', letterSpacing:4, filter:'drop-shadow(0 0 16px rgba(245,168,0,0.4))' }}>
                CAPI DA SORTE
              </div>
            </Link>
            <div style={{ fontSize:13, color:'#7A8BB0', letterSpacing:3, textTransform:'uppercase', marginTop:8, fontWeight:600 }}>
              Entrar na sua conta
            </div>
          </div>

          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:20, padding:'28px 24px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              <div>
                <label className="label">E-mail *</label>
                <input
                  className="input-field"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm({...form, email:e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div>
                <label className="label">Senha *</label>
                <input
                  className="input-field"
                  type="password"
                  name="senha"
                  placeholder="Sua senha"
                  value={form.senha}
                  onChange={e => setForm({...form, senha:e.target.value})}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div style={{ textAlign:'right' }}>
                <Link href="/esqueci-senha" style={{ fontSize:13, color:'#F5A800', fontWeight:600, textDecoration:'none' }}>
                  Esqueci minha senha
                </Link>
              </div>

              {erro && (
                <div style={{ background:'rgba(255,61,90,0.1)', border:'1px solid rgba(255,61,90,0.3)', borderRadius:10, padding:'12px 16px', color:'#FF3D5A', fontSize:13, fontWeight:600 }}>
                  {erro}
                </div>
              )}

              <button className="btn-entrar" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#7A8BB0' }}>
            Não tem uma conta?{' '}
            <Link href="/cadastro" style={{ color:'#F5A800', fontWeight:700, textDecoration:'none' }}>
              Cadastrar
            </Link>
          </div>

          <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:'#2A3B5A' }}>
            © 2026 Capi da Sorte • Todos os direitos reservados
          </div>

        </div>
      </div>
    </>
  )
}
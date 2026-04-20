// PÁGINA ACESSO — SENHA DE PROTEÇÃO
'use client'
import { useState } from 'react'

export default function Acesso() {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAcesso = async () => {
    setLoading(true)
    setErro(false)

    const res = await fetch('/api/acesso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha })
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      setErro(true)
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }
        .input-senha {
          width:100%;
          padding:16px 20px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(245,168,0,0.3);
          border-radius:12px;
          color:#fff;
          font-size:16px;
          font-family:'Barlow',sans-serif;
          outline:none;
          transition:border .2s;
          text-align:center;
          letter-spacing:4px;
        }
        .input-senha:focus { border-color:#F5A800; }
        .input-senha::placeholder { color:#4A5B7A; letter-spacing:2px; }
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
      `}</style>

      <div style={{ minHeight:'100vh', background:'#04091C', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Barlow',sans-serif" }}>
        <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>

          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:48, color:'#F5A800', letterSpacing:4, marginBottom:8, filter:'drop-shadow(0 0 20px rgba(245,168,0,0.5))' }}>
            CAPI DA SORTE
          </div>

          <div style={{ fontSize:13, color:'#7A8BB0', letterSpacing:3, textTransform:'uppercase', marginBottom:48, fontWeight:600 }}>
            Área Restrita
          </div>

          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:20, padding:32, backdropFilter:'blur(20px)' }}>

            <div style={{ fontSize:14, color:'#7A8BB0', marginBottom:24, fontWeight:600, letterSpacing:1 }}>
              Digite o código de acesso
            </div>

            <input
              type="password"
              className="input-senha"
              placeholder="••••••••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAcesso()}
              style={{ marginBottom:16 }}
            />

            {erro && (
              <div style={{ color:'#FF3D5A', fontSize:13, marginBottom:16, fontWeight:600 }}>
                Código de acesso incorreto
              </div>
            )}

            <button className="btn-entrar" onClick={handleAcesso} disabled={loading || !senha}>
              {loading ? 'Verificando...' : 'Acessar'}
            </button>

          </div>

          <div style={{ marginTop:32, fontSize:11, color:'#2A3B5A', letterSpacing:1 }}>
            © 2026 Capi da Sorte • Todos os direitos reservados
          </div>

        </div>
      </div>
    </>
  )
}
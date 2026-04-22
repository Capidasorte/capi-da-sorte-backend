// PÁGINA MINHA CONTA — CAPI DA SORTE
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Bilhete {
  numero: string
  status: string
  campanha: string
  created_at: string
}

interface User {
  id: string
  nome: string
  email: string
}

export default function MinhaConta() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([])
  const [loading, setLoading] = useState(true)
  const [totalGasto, setTotalGasto] = useState(0)

  // STARS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      gold: Math.random() > 0.78,
      alpha: Math.random(),
      tw: Math.random() * 0.02 + 0.005
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.tw
        if (s.alpha > 1 || s.alpha < 0) s.tw *= -1
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.gold ? `rgba(245,168,0,${Math.abs(s.alpha)})` : `rgba(255,255,255,${Math.abs(s.alpha) * 0.5})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!userData || !token) { window.location.href = '/login'; return }
    try { setUser(JSON.parse(userData)) }
    catch { window.location.href = '/login'; return }
    carregarBilhetes(token)
  }, [])

  const carregarBilhetes = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/my-numbers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBilhetes(data.bilhetes || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const formatData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }
        .logo-wrap { filter:drop-shadow(0 0 8px rgba(245,168,0,0.5)); transition:filter .3s; }
        .logo-wrap:hover { filter:drop-shadow(0 0 16px rgba(245,168,0,0.8)); }
        .bilhete-card { transition:all .2s; }
        .bilhete-card:hover { border-color:rgba(245,168,0,0.4)!important; transform:translateY(-1px); }
        .btn-sair { background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:8px; color:rgba(255,255,255,0.4); font-family:'Barlow',sans-serif; font-size:13px; font-weight:700; padding:8px 16px; cursor:pointer; transition:all .2s; letter-spacing:1px; }
        .btn-sair:hover { border-color:rgba(255,61,90,0.5); color:rgba(255,61,90,0.7); }
        .spinner { width:36px; height:36px; border:3px solid rgba(245,168,0,.15); border-top-color:#F5A800; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      <div style={{ minHeight:'100vh', background:'#04091C', fontFamily:"'Barlow',sans-serif", color:'#fff', position:'relative', zIndex:1 }}>

        {/* HEADER */}
        <header style={{ background:'rgba(4,9,28,0.95)', borderBottom:'1px solid rgba(245,168,0,0.2)', padding:'0 16px', height:70, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)' }}>
          <Link href="/" className="logo-wrap" style={{ textDecoration:'none' }}>
            <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(18px,4vw,26px)', color:'#F5A800', letterSpacing:2 }}>CAPI DA SORTE</span>
          </Link>
          <button className="btn-sair" onClick={sair}>Sair</button>
        </header>

        <div style={{ maxWidth:600, margin:'0 auto', padding:'32px 16px 80px' }}>

          {/* SAUDAÇÃO */}
          {user && (
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(11px,2vw,13px)', color:'#7A8BB0', letterSpacing:4, textTransform:'uppercase', marginBottom:6 }}>Bem-vindo de volta</div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,42px)', color:'#fff', letterSpacing:2 }}>{user.nome}</div>
              <div style={{ fontSize:13, color:'#7A8BB0', marginTop:2 }}>{user.email}</div>
            </div>
          )}

          {/* CARDS DE RESUMO */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28 }}>
            <div style={{ background:'rgba(245,168,0,0.08)', border:'1px solid rgba(245,168,0,0.2)', borderRadius:14, padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(32px,7vw,48px)', color:'#F5A800', lineHeight:1 }}>{bilhetes.length}</div>
              <div style={{ fontSize:12, color:'#7A8BB0', fontWeight:600, marginTop:4, letterSpacing:1, textTransform:'uppercase' }}>Bilhetes</div>
            </div>
            <div style={{ background:'rgba(31,204,106,0.08)', border:'1px solid rgba(31,204,106,0.2)', borderRadius:14, padding:'18px 16px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(20px,5vw,32px)', color:'#1FCC6A', lineHeight:1 }}>Abr 30</div>
              <div style={{ fontSize:12, color:'#7A8BB0', fontWeight:600, marginTop:4, letterSpacing:1, textTransform:'uppercase' }}>Próximo Sorteio</div>
            </div>
          </div>

          {/* BOTÃO COMPRAR MAIS */}
          <Link href="/" style={{ display:'block', width:'100%', padding:'16px', borderRadius:12, background:'linear-gradient(135deg,#FFD060,#F5A800,#C88000)', color:'#04091C', fontWeight:700, fontSize:'clamp(14px,3vw,16px)', textDecoration:'none', letterSpacing:2, textTransform:'uppercase', textAlign:'center', fontFamily:"'Barlow Condensed',sans-serif", boxShadow:'0 8px 24px rgba(245,168,0,.3)', marginBottom:28 }}>
            Comprar Mais Bilhetes
          </Link>

          {/* LISTA DE BILHETES */}
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(16px,3vw,20px)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#fff', marginBottom:16 }}>
            Meus Bilhetes
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div className="spinner"></div>
              <div style={{ fontSize:14, color:'#7A8BB0' }}>Carregando seus bilhetes...</div>
            </div>
          )}

          {!loading && bilhetes.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, color:'#7A8BB0', letterSpacing:2, marginBottom:8 }}>Nenhum bilhete ainda</div>
              <div style={{ fontSize:13, color:'#4A5B7A' }}>Compre seus primeiros bilhetes e concorra!</div>
            </div>
          )}

          {!loading && bilhetes.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {bilhetes.map((b, i) => (
                <div key={i} className="bilhete-card" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, color:'#F5A800', letterSpacing:2 }}>#{b.numero}</div>
                    <div style={{ fontSize:12, color:'#7A8BB0', marginTop:2 }}>{b.campanha}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ display:'inline-block', background: b.status === 'confirmed' ? 'rgba(31,204,106,0.15)' : 'rgba(245,168,0,0.15)', border:`1px solid ${b.status === 'confirmed' ? 'rgba(31,204,106,0.4)' : 'rgba(245,168,0,0.4)'}`, borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, color: b.status === 'confirmed' ? '#1FCC6A' : '#F5A800', letterSpacing:1, textTransform:'uppercase' }}>
                      {b.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </div>
                    <div style={{ fontSize:11, color:'#4A5B7A', marginTop:4 }}>{formatData(b.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <footer style={{ background:'rgba(4,9,28,0.95)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'16px', textAlign:'center', position:'relative', zIndex:10 }}>
          <div style={{ fontSize:11, color:'#2A3B5A' }}>© 2026 Capi da Sorte • Todos os direitos reservados</div>
        </footer>

      </div>
    </>
  )
}
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

const SORTEIOS = [
  { ordem: '1º Sorteio', data: '2026-04-15T20:00:00', premio: 500 },
  { ordem: '2º Sorteio', data: '2026-04-20T20:00:00', premio: 800 },
  { ordem: '3º Sorteio', data: '2026-04-26T20:00:00', premio: 1200 },
  { ordem: 'Sorteio Principal', data: '2026-04-30T20:00:00', premio: null },
]

function useCountdown(targetDate: string) {
  const [tempo, setTempo] = useState({ dias:0, horas:0, minutos:0, segundos:0 })
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTempo({ dias:0, horas:0, minutos:0, segundos:0 }); return }
      setTempo({
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff % 86400000) / 3600000),
        minutos: Math.floor((diff % 3600000) / 60000),
        segundos: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return tempo
}

export default function MinhaConta() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([])
  const [loading, setLoading] = useState(true)
  const [premio, setPremio] = useState(100000)
  const [displayPremio, setDisplayPremio] = useState(100000)
  const [sorteioIdx, setSorteioIdx] = useState(0)

  const proximoSorteio = SORTEIOS.find(s => new Date(s.data).getTime() > Date.now()) || SORTEIOS[SORTEIOS.length - 1]
  const countdown = useCountdown(proximoSorteio.data)

  useEffect(() => {
    const id = setInterval(() => setSorteioIdx(i => (i + 1) % SORTEIOS.length), 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      const qty = Math.floor(Math.random() * 5) + 1
      setPremio(p => p + 1.5 * qty)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const start = displayPremio
    const end = premio
    const duration = 1200
    const startTime = performance.now()
    let animId: number
    const update = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayPremio(start + (end - start) * ease)
      if (progress < 1) animId = requestAnimationFrame(update)
    }
    animId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animId)
  }, [premio])

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

  const formatPremio = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formatData = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
  const pad = (n: number) => String(n).padStart(2, '0')
  const sorteioAtual = SORTEIOS[sorteioIdx]

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
        @keyframes spin { to { transform:rotate(360deg); } }
        .btn-buy { position:relative; overflow:hidden; transition:all .2s; animation:btn-pulse 2.5s ease-in-out infinite; display:block; text-decoration:none; text-align:center; }
        .btn-buy::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent); animation:btn-shine 2s linear infinite; }
        .btn-buy:hover { transform:translateY(-3px)!important; box-shadow:0 14px 44px rgba(245,168,0,.7)!important; animation:none!important; }
        @keyframes btn-pulse { 0%,100%{box-shadow:0 8px 32px rgba(245,168,0,.4)} 50%{box-shadow:0 8px 48px rgba(245,168,0,.75),0 0 70px rgba(245,168,0,.2)} }
        @keyframes btn-shine { 0%{left:-100%} 100%{left:100%} }
        .sorteio-slide { animation:slide-in .4s ease; }
        @keyframes slide-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .counter-premio {
          font-family:'Bebas Neue',cursive;
          font-size:clamp(36px,9vw,56px);
          line-height:1;
          background:linear-gradient(135deg,#C88000 0%,#FFD060 40%,#F5A800 60%,#FFD060 80%,#C88000 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:metal-shine 3s linear infinite;
          filter:drop-shadow(0 0 20px rgba(245,168,0,.5));
          letter-spacing:2px;
        }
        @keyframes metal-shine{0%{background-position:0% center}100%{background-position:200% center}}
        .live-dot { animation:blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        .countdown-num { font-family:'Bebas Neue',cursive; font-size:clamp(26px,6vw,36px); color:#1FCC6A; line-height:1; filter:drop-shadow(0 0 8px rgba(31,204,106,0.5)); }
        .countdown-lbl { font-size:9px; color:#7A8BB0; letter-spacing:1px; text-transform:uppercase; font-weight:700; margin-top:2px; }
        .countdown-sep { font-family:'Bebas Neue',cursive; font-size:24px; color:rgba(31,204,106,0.4); margin:0 3px; padding-bottom:14px; line-height:1; }
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

          {/* 1. SAUDAÇÃO */}
          {user && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(11px,2vw,13px)', color:'#7A8BB0', letterSpacing:4, textTransform:'uppercase', marginBottom:4 }}>Bem-vindo de volta</div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,42px)', color:'#fff', letterSpacing:2 }}>{user.nome}</div>
              <div style={{ fontSize:13, color:'#7A8BB0', marginTop:2 }}>{user.email}</div>
            </div>
          )}

          {/* 2. PREMIO ACUMULADO */}
          <div style={{ background:'rgba(245,168,0,0.07)', border:'1px solid rgba(245,168,0,0.2)', borderRadius:16, padding:'20px', marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#7A8BB0', fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:8 }}>Premio Acumulado</div>
            <div className="counter-premio">R$ {formatPremio(displayPremio)}</div>
            <div style={{ display:'flex', justifyContent:'center', marginTop:10 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(31,204,106,.08)', border:'1px solid rgba(31,204,106,.3)', borderRadius:20, padding:'4px 12px', fontSize:10, fontWeight:700, color:'#1FCC6A', letterSpacing:2, textTransform:'uppercase' }}>
                <span className="live-dot" style={{ width:6, height:6, borderRadius:'50%', background:'#1FCC6A', display:'inline-block' }}></span>
                Crescendo ao vivo
              </div>
            </div>
          </div>

          {/* 3. MEUS BILHETES */}
          <div style={{ background:'rgba(245,168,0,0.05)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:14, padding:'16px', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, color:'#7A8BB0', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>Meus Bilhetes</div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(40px,9vw,56px)', color:'#F5A800', lineHeight:1 }}>{bilhetes.length}</div>
            </div>
            <div style={{ textAlign:'right', fontSize:13 }}>
              <div style={{ color:'#1FCC6A', fontWeight:700 }}>{bilhetes.filter(b => b.status === 'confirmed').length} confirmados</div>
              <div style={{ marginTop:4, color:'#7A8BB0' }}>{bilhetes.filter(b => b.status !== 'confirmed').length} pendentes</div>
            </div>
          </div>

          {/* 4. BOTÃO COMPRAR MAIS */}
          <Link href="/" className="btn-buy" style={{ width:'100%', padding:'clamp(14px,3vw,18px)', borderRadius:12, fontSize:'clamp(14px,3vw,17px)', fontWeight:900, letterSpacing:2, textTransform:'uppercase', background:'linear-gradient(135deg,#FFD060,#F5A800,#C88000)', color:'#04091C', fontFamily:"'Barlow Condensed',sans-serif", marginBottom:20 }}>
            Comprar Mais Bilhetes
          </Link>

          {/* 5. COUNTDOWN */}
          <div style={{ background:'rgba(31,204,106,0.07)', border:'1px solid rgba(31,204,106,0.2)', borderRadius:16, padding:'20px', marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#7A8BB0', fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>Próximo Sorteio — {proximoSorteio.ordem}</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}><div className="countdown-num">{pad(countdown.dias)}</div><div className="countdown-lbl">dias</div></div>
              <div className="countdown-sep">:</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}><div className="countdown-num">{pad(countdown.horas)}</div><div className="countdown-lbl">horas</div></div>
              <div className="countdown-sep">:</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}><div className="countdown-num">{pad(countdown.minutos)}</div><div className="countdown-lbl">min</div></div>
              <div className="countdown-sep">:</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}><div className="countdown-num">{pad(countdown.segundos)}</div><div className="countdown-lbl">seg</div></div>
            </div>
          </div>

          {/* 6. SORTEIOS ROTATIVOS */}
          <div style={{ background:'rgba(13,30,74,0.6)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'18px', marginBottom:28, textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#C88000,#FFD060,#C88000)' }}></div>
            <div style={{ fontSize:11, color:'#7A8BB0', fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Calendário de Sorteios</div>
            <div key={sorteioIdx} className="sorteio-slide">
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(12px,2.5vw,14px)', fontWeight:700, color:'#7A8BB0', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>{sorteioAtual.ordem}</div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(22px,5vw,32px)', color:'#fff', letterSpacing:2, marginBottom:4 }}>
                {new Date(sorteioAtual.data).toLocaleDateString('pt-BR', { day:'2-digit', month:'long' })}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(20px,4vw,28px)', color:'#F5A800', letterSpacing:1 }}>
                {sorteioAtual.premio ? `R$ ${sorteioAtual.premio.toLocaleString('pt-BR')},00` : `R$ ${formatPremio(displayPremio)}`}
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:12 }}>
              {SORTEIOS.map((_, i) => (
                <div key={i} onClick={() => setSorteioIdx(i)} style={{ width:6, height:6, borderRadius:'50%', background: i === sorteioIdx ? '#F5A800' : 'rgba(255,255,255,0.15)', cursor:'pointer', transition:'all .2s' }}></div>
              ))}
            </div>
          </div>

          {/* 7. LISTA DE BILHETES */}
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(16px,3vw,20px)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#fff', marginBottom:14 }}>
            Todos os Bilhetes
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div className="spinner"></div>
              <div style={{ fontSize:14, color:'#7A8BB0' }}>Carregando seus bilhetes...</div>
            </div>
          )}

          {!loading && bilhetes.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, color:'#7A8BB0', letterSpacing:2, marginBottom:8 }}>Nenhum bilhete ainda</div>
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

        <footer style={{ background:'rgba(4,9,28,0.95)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'16px', textAlign:'center', zIndex:10 }}>
          <div style={{ fontSize:11, color:'#2A3B5A' }}>© 2026 Capi da Sorte • Todos os direitos reservados</div>
        </footer>

      </div>
    </>
  )
}
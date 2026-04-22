// PÁGINA COMPRA — FLUXO DE PAGAMENTO PIX
'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Campanha { id: string; nome: string; premio_atual: number; limite_cotas_por_cpf: number }
interface Pagamento { pix_copia_cola: string; qr_code_image: string; payment_id: string }
interface User { id: string; nome: string; email: string }

function CompraContent() {
  const searchParams = useSearchParams()
  const qtdParam = searchParams.get('qty')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [loading, setLoading] = useState(false)
  const [pagamento, setPagamento] = useState<Pagamento | null>(null)
  const [status, setStatus] = useState<'pix' | 'confirmado'>('pix')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoIniciado, setAutoIniciado] = useState(false)

  const quantidade = qtdParam ? parseInt(qtdParam) : 5

  const calcularValor = (qty: number): number => {
    if (qty === 1)  return 4.99
    if (qty === 5)  return 22.00
    if (qty === 10) return 40.00
    if (qty === 20) return 70.00
    if (qty > 20) {
      const blocos20 = Math.floor(qty / 20)
      const resto = qty % 20
      let valor = blocos20 * 70.00
      if (resto > 0) valor += calcularValor(resto)
      return parseFloat(valor.toFixed(2))
    }
    return parseFloat((qty * 4.99).toFixed(2))
  }

  const valor = calcularValor(quantidade)

  // STARS ANIMATION
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
    catch { localStorage.removeItem('user'); localStorage.removeItem('token'); window.location.href = '/login'; return }
    carregarCampanha()
  }, [])

  useEffect(() => {
    if (status !== 'pix' || !pagamento?.payment_id) return
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/status/${pagamento.payment_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') setStatus('confirmado')
      } catch (err) { console.error(err) }
    }, 4000)
    return () => clearInterval(interval)
  }, [status, pagamento?.payment_id])

  const carregarCampanha = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/campanha-ativa`)
      if (res.ok) { const data = await res.json(); setCampanha(data) }
      else setError('Nenhuma campanha ativa no momento.')
    } catch { setError('Erro ao conectar com o servidor.') }
  }

  useEffect(() => {
    if (campanha && user && !autoIniciado && !pagamento) {
      setAutoIniciado(true)
      iniciarCompra(campanha.id)
    }
  }, [campanha, user])

  const iniciarCompra = async (campaign_id: string) => {
    setError(null)
    const token = localStorage.getItem('token')
    if (!token) { window.location.href = '/login'; return }
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ campaign_id, quantidade })
      })
      const data = await res.json()
      if (res.ok) setPagamento(data)
      else setError(data.error || 'Não foi possível gerar o PIX.')
    } catch { setError('Erro de conexão. Verifique sua internet.') }
    finally { setLoading(false) }
  }

  const copiarCodigo = () => {
    if (pagamento?.pix_copia_cola) {
      navigator.clipboard.writeText(pagamento.pix_copia_cola)
      alert('Código PIX copiado!')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }
        .spinner { width:44px; height:44px; border:3px solid rgba(245,168,0,.15); border-top-color:#F5A800; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-copiar { width:100%; padding:14px; border:2px solid #F5A800; border-radius:12px; cursor:pointer; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; background:transparent; color:#F5A800; transition:all .2s; margin-top:12px; }
        .btn-verificar { width:100%; padding:14px; border:none; border-radius:12px; cursor:not-allowed; font-family:'Barlow',sans-serif; font-size:14px; font-weight:700; background:#1FCC6A; color:#fff; margin-top:12px; opacity:0.8; }
        .btn-recompra { display:block; padding:16px; border-radius:12px; background:linear-gradient(135deg,#FFD060,#F5A800,#C88000); color:#04091C; font-weight:700; font-size:15px; text-decoration:none; letter-spacing:1px; text-transform:uppercase; text-align:center; font-family:'Barlow',sans-serif; box-shadow:0 8px 24px rgba(245,168,0,.3); }
        .btn-bilhetes { display:block; padding:16px; border-radius:12px; background:transparent; border:2px solid rgba(245,168,0,0.4); color:#F5A800; font-weight:700; font-size:15px; text-decoration:none; letter-spacing:1px; text-transform:uppercase; text-align:center; font-family:'Barlow',sans-serif; }
        .logo-wrap { filter:drop-shadow(0 0 8px rgba(245,168,0,0.5)); transition:filter .3s; }
        .logo-wrap:hover { filter:drop-shadow(0 0 16px rgba(245,168,0,0.8)); }
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      <div style={{ minHeight:'100vh', background:'#04091C', padding:'20px 16px 80px', fontFamily:"'Barlow',sans-serif", color:'#fff', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>

          {/* LOGO */}
          <div style={{ textAlign:'center', padding:'32px 0 24px' }}>
            <Link href="/" className="logo-wrap" style={{ textDecoration:'none', display:'inline-block' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:38, color:'#F5A800', letterSpacing:4, filter:'drop-shadow(0 0 16px rgba(245,168,0,0.5))' }}>
                CAPI DA SORTE
              </div>
            </Link>
          </div>

          {/* ERRO */}
          {error && (
            <div style={{ background:'rgba(255,61,90,0.15)', border:'1px solid #FF3D5A', color:'#FF6B85', padding:'14px 16px', borderRadius:12, marginBottom:20, fontSize:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{error}</span>
              <button onClick={() => { setError(null); if(campanha) iniciarCompra(campanha.id) }} style={{ color:'#F5A800', background:'none', border:'none', cursor:'pointer', fontWeight:700, fontSize:13, marginLeft:12 }}>
                Tentar novamente
              </button>
            </div>
          )}

          {/* CARREGANDO */}
          {loading && !pagamento && (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div className="spinner"></div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, color:'#F5A800', letterSpacing:2, marginBottom:8 }}>
                Gerando seu PIX...
              </div>
              <div style={{ fontSize:14, color:'#7A8BB0' }}>
                {quantidade} bilhete{quantidade > 1 ? 's' : ''} — R$ {valor.toFixed(2).replace('.',',')}
              </div>
            </div>
          )}

          {/* PIX */}
          {!loading && pagamento && status === 'pix' && (
            <div>
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{ fontSize:13, color:'#7A8BB0', letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>Pagamento via PIX</div>
                {user && <div style={{ fontSize:16, color:'#fff', marginTop:8, fontWeight:700 }}>Olá, {user.nome?.split(' ')[0]}!</div>}
                <div style={{ fontSize:13, color:'#7A8BB0', marginTop:4 }}>{quantidade} bilhete{quantidade > 1 ? 's' : ''} serão confirmados após o pagamento</div>
              </div>

              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:20, padding:'28px 24px', textAlign:'center' }}>
                <div style={{ background:'rgba(245,168,0,0.08)', border:'1px solid rgba(245,168,0,0.2)', borderRadius:12, padding:'14px', marginBottom:24 }}>
                  <div style={{ fontSize:13, color:'#7A8BB0', marginBottom:4 }}>{quantidade} bilhete{quantidade > 1 ? 's' : ''}</div>
                  <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:46, color:'#F5A800', lineHeight:1 }}>R$ {valor.toFixed(2).replace('.',',')}</div>
                </div>

                {pagamento.qr_code_image && (
                  <div style={{ background:'#fff', borderRadius:16, padding:20, display:'inline-block', marginBottom:20, boxShadow:'0 10px 40px rgba(0,0,0,0.4)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${pagamento.qr_code_image}`} alt="QR Code PIX" style={{ width:220, height:220, borderRadius:8 }} />
                  </div>
                )}

                <div style={{ fontSize:13, color:'#7A8BB0', marginBottom:16 }}>Escaneie o QR Code ou copie o código abaixo</div>

                {pagamento.pix_copia_cola && (
                  <button className="btn-copiar" onClick={copiarCodigo}>Copiar Código PIX</button>
                )}

                <button className="btn-verificar">Aguardando confirmação automática...</button>

                <div style={{ fontSize:12, color:'#4A5B7A', marginTop:20 }}>Não feche essa tela após o pagamento</div>
              </div>
            </div>
          )}

          {/* CONFIRMADO */}
          {status === 'confirmado' && (
            <div style={{ textAlign:'center', paddingTop:20 }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:42, color:'#1FCC6A', marginBottom:8, filter:'drop-shadow(0 0 20px rgba(31,204,106,0.5))' }}>
                Pagamento Confirmado!
              </div>
              <div style={{ fontSize:16, color:'#fff', marginBottom:6 }}>
                Seus {quantidade} bilhetes foram garantidos!
              </div>
              <div style={{ fontSize:14, color:'#7A8BB0', marginBottom:40 }}>
                Você receberá seus números no WhatsApp em instantes
              </div>
              <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:16, padding:'24px', marginBottom:20 }}>
                <div style={{ fontSize:13, color:'#7A8BB0', marginBottom:16, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>O que deseja fazer agora?</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <Link href="/" className="btn-recompra">Comprar Mais Bilhetes</Link>
                  <Link href="/minha-conta" className="btn-bilhetes">Ver Meus Bilhetes</Link>
                </div>
              </div>
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:'#2A3B5A' }}>
            © 2026 Capi da Sorte • Todos os direitos reservados
          </div>

        </div>
      </div>
    </>
  )
}

export default function Compra() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#04091C', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:24, color:'#F5A800', letterSpacing:2 }}>Carregando...</div>
      </div>
    }>
      <CompraContent />
    </Suspense>
  )
}
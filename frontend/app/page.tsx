// PÁGINA PRINCIPAL — CAPI DA SORTE
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [premio, setPremio] = useState(100000)
  const [displayPremio, setDisplayPremio] = useState(0)
  const [cotasVendidas, setCotasVendidas] = useState(0)
  const totalCotas = 1000000
  const incrementoPorCota = 1.5
  const [feed, setFeed] = useState<{id: number, text: string}[]>([])
  const feedCounter = useRef(0)
  const [pkgSelecionado, setPkgSelecionado] = useState(5)
  const [quantidade, setQuantidade] = useState(5)
  const [fraseIdx, setFraseIdx] = useState(0)

  const frases = [
    'Compras acontecendo agora',
    'Quanto mais bilhetes, maiores suas chances',
    'Compras confirmadas em tempo real',
    'Prêmio crescendo ao vivo',
    'Não fique de fora',
  ]

  const pacotes = [
    { qty: 1,  valor: 4.99,  label: null,          economia: null },
    { qty: 5,  valor: 22.00, label: 'POPULAR',      economia: 2.95 },
    { qty: 10, valor: 40.00, label: null,            economia: 9.90,  pulse: true },
    { qty: 20, valor: 70.00, label: 'MELHOR VALOR',  economia: 29.80, pulse: true },
  ]

  const nomes = ['Maria S.', 'Joao P.', 'Ana C.', 'Pedro L.', 'Lucas M.', 'Carla F.', 'Bruno T.']

  const addFeed = useCallback((qty: number) => {
    const n = nomes[Math.floor(Math.random() * nomes.length)]
    const masked = n.split(' ')[0].substring(0, 2) + '*** ' + n.split(' ').pop()
    const id = ++feedCounter.current
    setFeed(prev => [{ id, text: `${masked} garantiu ${qty} bilhete${qty > 1 ? 's' : ''}` }, ...prev.slice(0, 2)])
    setTimeout(() => setFeed(prev => prev.filter(f => f.id !== id)), 5000)
  }, [])

  // Frases rotativas
  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIdx(i => (i + 1) % frases.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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
    const interval = setInterval(() => {
      const qty = Math.floor(Math.random() * 8) + 1
      setPremio(p => p + incrementoPorCota * qty)
      setCotasVendidas(p => p + qty)
      addFeed(qty)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [addFeed])

  const formatPremio = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const pct = Math.max(0.1, (cotasVendidas / totalCotas) * 100)

  // Calcula valor baseado na quantidade
  const calcularValor = (qty: number) => {
    if (qty === 1)  return 4.99
    if (qty === 5)  return 22.00
    if (qty === 10) return 40.00
    if (qty === 20) return 70.00
    return parseFloat((qty * 4.99).toFixed(2))
  }

  const calcularEconomia = (qty: number) => {
    const valorSemDesconto = parseFloat((qty * 4.99).toFixed(2))
    const valorComDesconto = calcularValor(qty)
    const eco = valorSemDesconto - valorComDesconto
    return eco > 0 ? eco : null
  }

  const valorAtual = calcularValor(quantidade)
  const economiaAtual = calcularEconomia(quantidade)

  const incrementar = () => setQuantidade(q => Math.min(q + 1, 20))
  const decrementar = () => setQuantidade(q => Math.max(q - 1, 1))

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; -webkit-font-smoothing:antialiased; }
        .counter {
          font-family:'Bebas Neue',cursive;
          font-size:clamp(52px,12vw,110px);
          line-height:1;
          background:linear-gradient(135deg,#C88000 0%,#FFD060 40%,#F5A800 60%,#FFD060 80%,#C88000 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:metal-shine 3s linear infinite;
          letter-spacing:2px;
          filter:drop-shadow(0 0 30px rgba(245,168,0,.5));
        }
        @keyframes metal-shine{0%{background-position:0% center}100%{background-position:200% center}}
        .glow-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border:1px solid rgba(245,168,0,.12);border-radius:50%;pointer-events:none;animation:ring-pulse 2.5s ease-in-out infinite;}
        @keyframes ring-pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.5}50%{transform:translate(-50%,-50%) scale(1.04);opacity:1}}
        .live-dot{animation:blink 1s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .progress-fill{position:relative;}
        .progress-fill::after{content:'';position:absolute;right:0;top:0;bottom:0;width:40px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6));animation:shine 1.5s ease-in-out infinite;}
        @keyframes shine{0%,100%{opacity:0}50%{opacity:1}}
        .btn-buy{position:relative;overflow:hidden;transition:all .2s;animation:btn-pulse 2.5s ease-in-out infinite;}
        .btn-buy::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:btn-shine 2s linear infinite;}
        .btn-buy:hover{transform:translateY(-3px)!important;box-shadow:0 14px 44px rgba(245,168,0,.7)!important;animation:none!important;}
        @keyframes btn-pulse{0%,100%{box-shadow:0 8px 32px rgba(245,168,0,.4)}50%{box-shadow:0 8px 48px rgba(245,168,0,.75),0 0 70px rgba(245,168,0,.2)}}
        @keyframes btn-shine{0%{left:-100%}100%{left:100%}}
        .feed-item{animation:slideUp .4s ease forwards;}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        .pkg{transition:all 0.2s;cursor:pointer;}
        .pkg:hover{border-color:#F5A800!important;background:rgba(245,168,0,0.08)!important;transform:translateY(-2px);}
        .pkg-pulse{animation:pkg-glow 2s ease-in-out infinite;}
        @keyframes pkg-glow{0%,100%{box-shadow:0 0 0 rgba(245,168,0,0)}50%{box-shadow:0 0 20px rgba(245,168,0,.35),0 0 40px rgba(245,168,0,.1)}}
        .social-link{transition:opacity .2s;text-decoration:none;}
        .social-link:hover{opacity:.7;}
        .logo-wrap{filter:drop-shadow(0 0 8px rgba(245,168,0,0.5));transition:filter .3s;}
        .logo-wrap:hover{filter:drop-shadow(0 0 16px rgba(245,168,0,0.8));}
        .sorteios-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px 20px;max-width:900px;margin:0 auto;}
        @media(max-width:600px){.sorteios-grid{grid-template-columns:repeat(2,1fr);}}
        .sorteio-card{position:relative;overflow:hidden;border-radius:12px;padding:14px 10px;text-align:center;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .pacotes-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
        @media(max-width:600px){.pacotes-grid{grid-template-columns:repeat(2,1fr);}}
        .frase-rotativa{animation:frase-fade .5s ease;}
        @keyframes frase-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .btn-qty{background:rgba(245,168,0,0.1);border:2px solid rgba(245,168,0,0.4);color:#F5A800;font-family:'Bebas Neue',cursive;font-size:24px;width:48px;height:48px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
        .btn-qty:hover{background:rgba(245,168,0,0.2);border-color:#F5A800;}
        .btn-qty:active{transform:scale(.93);}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />

      <main style={{ fontFamily:"'Barlow',sans-serif", minHeight:'100vh', color:'#fff', position:'relative', zIndex:1, paddingBottom:100 }}>

        {/* HEADER */}
        <header style={{ background:'rgba(4,9,28,0.95)', borderBottom:'1px solid rgba(245,168,0,0.2)', padding:'0 16px', height:70, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)' }}>
          <Link href="/" className="logo-wrap" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
            <span style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#F5A800', letterSpacing:2, fontFamily:"'Bebas Neue',cursive" }}>CAPI DA SORTE</span>
          </Link>
          <div style={{ display:'flex', gap:8 }}>
            <Link href="/login" style={{ background:'transparent', border:'2px solid #F5A800', color:'#F5A800', padding:'8px clamp(10px,2vw,18px)', borderRadius:8, fontWeight:700, fontSize:'clamp(12px,2vw,15px)', textDecoration:'none' }}>Entrar</Link>
            <Link href="/cadastro" style={{ background:'linear-gradient(135deg,#FFD060,#F5A800)', color:'#04091C', padding:'8px clamp(10px,2vw,18px)', borderRadius:8, fontWeight:700, fontSize:'clamp(12px,2vw,15px)', textDecoration:'none' }}>Cadastrar</Link>
          </div>
        </header>

        {/* CONTADOR */}
        <div style={{ textAlign:'center', padding:'40px 16px 16px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(14px,3vw,18px)', fontWeight:700, letterSpacing:5, textTransform:'uppercase', color:'#7A8BB0', marginBottom:8 }}>Premio Acumulado</div>
          <div style={{ position:'relative', display:'inline-block', marginBottom:16 }}>
            <div className="glow-ring" style={{ width:300, height:120 }}></div>
            <div className="glow-ring" style={{ width:360, height:150, animationDelay:'.4s', opacity:.6 }}></div>
            <div className="glow-ring" style={{ width:420, height:180, animationDelay:'.8s', opacity:.3 }}></div>
            <div className="counter">R$ {formatPremio(displayPremio)}</div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(31,204,106,.08)', border:'1px solid rgba(31,204,106,.3)', borderRadius:20, padding:'6px 16px', fontSize:'clamp(10px,2vw,12px)', fontWeight:700, color:'#1FCC6A', letterSpacing:3, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span className="live-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#1FCC6A', display:'inline-block' }}></span>
              Atualizando ao vivo • Participe e Concorra
            </div>
          </div>
        </div>

        {/* SORTEIOS */}
        <div className="sorteios-grid">
          {[
            { ordem:'1º Sorteio', data:'15 Abr', premio:'R$ 500,00', main:false },
            { ordem:'2º Sorteio', data:'20 Abr', premio:'R$ 800,00', main:false },
            { ordem:'3º Sorteio', data:'26 Abr', premio:'R$ 1.200,00', main:false },
            { ordem:'Principal', data:'30 Abr', premio:`R$ ${formatPremio(displayPremio)}`, main:true },
          ].map((s, i) => (
            <div key={i} className="sorteio-card" style={{ background:s.main?'rgba(245,168,0,0.1)':'rgba(13,30,74,0.6)', border:`1px solid ${s.main?'rgba(245,168,0,0.5)':'rgba(255,255,255,0.1)'}` }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.main?'linear-gradient(90deg,#F5A800,#fff8,#F5A800)':'linear-gradient(90deg,#C88000,#FFD060)' }}></div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(10px,2vw,13px)', fontWeight:700, color:'#7A8BB0', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>{s.ordem}</div>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(16px,3vw,22px)', fontWeight:900, color:'#fff', marginBottom:4 }}>{s.data}</div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#F5A800', letterSpacing:1 }}>{s.premio}</div>
              {s.main && <span style={{ background:'#F5A800', color:'#04091C', fontSize:'clamp(8px,1.5vw,10px)', fontWeight:900, padding:'3px 8px', borderRadius:8, marginTop:4, letterSpacing:1 }}>ACUMULADO</span>}
            </div>
          ))}
        </div>

        {/* BARRA DE PROGRESSO */}
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ fontSize:'clamp(13px,2.5vw,15px)', color:'#aaa', fontWeight:600 }}>Bilhetes vendidos: <strong style={{ color:'#fff' }}>{cotasVendidas.toLocaleString('pt-BR')}</strong></span>
            <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(20px,4vw,28px)', color:'#F5A800', fontWeight:900 }}>{pct.toFixed(1)}%</span>
          </div>
          <div style={{ height:12, background:'rgba(255,255,255,0.05)', borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="progress-fill" style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#C88000,#F5A800,#FFD060)', borderRadius:12, transition:'width 1s ease' }}></div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'clamp(11px,2vw,14px)', color:'#7A8BB0', marginTop:6, fontWeight:600 }}>
            <span>{cotasVendidas.toLocaleString('pt-BR')} vendidos</span>
            <span>{(totalCotas - cotasVendidas).toLocaleString('pt-BR')} disponíveis</span>
          </div>
          {/* FRASE ROTATIVA */}
          <div style={{ textAlign:'center', marginTop:10 }}>
            <span key={fraseIdx} className="frase-rotativa" style={{ fontSize:'clamp(11px,2vw,13px)', color:'rgba(245,168,0,0.6)', fontWeight:600, letterSpacing:1 }}>
              ⚡ {frases[fraseIdx]}
            </span>
          </div>
        </div>

        {/* PACOTES */}
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px 20px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(16px,3vw,20px)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#fff', marginBottom:14 }}>Escolha seu Pacote</div>
          <div className="pacotes-grid">
            {pacotes.map((pkg) => (
              <div
                key={pkg.qty}
                className={`pkg${(pkg as any).pulse ? ' pkg-pulse' : ''}`}
                onClick={() => { setPkgSelecionado(pkg.qty); setQuantidade(pkg.qty); }}
                style={{ border:`2px solid ${pkgSelecionado===pkg.qty?'#F5A800':'rgba(255,255,255,0.12)'}`, background:pkgSelecionado===pkg.qty?'rgba(245,168,0,0.14)':'rgba(255,255,255,0.03)', borderRadius:14, padding:'16px 8px', textAlign:'center', position:'relative' }}
              >
                {pkg.label && <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#F5A800', color:'#04091C', fontSize:'clamp(7px,1.5vw,9px)', fontWeight:900, padding:'3px 8px', borderRadius:8, whiteSpace:'nowrap', letterSpacing:1 }}>{pkg.label}</div>}
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,38px)', fontWeight:900, color:'#fff', lineHeight:1 }}>{pkg.qty}</div>
                <div style={{ fontSize:'clamp(11px,2vw,12px)', color:'#7A8BB0', marginTop:4, fontWeight:600 }}>bilhete{pkg.qty>1?'s':''}</div>
                <div style={{ fontSize:'clamp(14px,3vw,18px)', fontWeight:700, color:'#F5A800', marginTop:6 }}>R$ {pkg.valor.toFixed(2).replace('.',',')}</div>
                {pkg.economia && <div style={{ fontSize:'clamp(10px,2vw,12px)', color:'#00DD44', fontWeight:800, marginTop:4 }}>economia R$ {pkg.economia.toFixed(2).replace('.',',')}</div>}
              </div>
            ))}
          </div>

          {/* CONTADOR + e - */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:16, padding:'20px', marginBottom:16 }}>
            <div style={{ fontSize:'clamp(12px,2vw,14px)', color:'#7A8BB0', fontWeight:600, letterSpacing:1, marginBottom:14, textAlign:'center' }}>Ou escolha a quantidade</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:12 }}>
              <button className="btn-qty" onClick={decrementar}>−</button>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(36px,8vw,52px)', color:'#fff', lineHeight:1 }}>{quantidade}</div>
                <div style={{ fontSize:'clamp(11px,2vw,12px)', color:'#7A8BB0', fontWeight:600 }}>bilhete{quantidade>1?'s':''}</div>
              </div>
              <button className="btn-qty" onClick={incrementar}>+</button>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,42px)', color:'#F5A800', lineHeight:1 }}>R$ {valorAtual.toFixed(2).replace('.',',')}</div>
              {economiaAtual && economiaAtual > 0 && (
                <div style={{ fontSize:'clamp(11px,2vw,13px)', color:'#00DD44', fontWeight:800, marginTop:4 }}>
                  economia R$ {economiaAtual.toFixed(2).replace('.',',')}
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO PRINCIPAL */}
          <div style={{ background:'linear-gradient(135deg,rgba(245,168,0,0.1),rgba(245,168,0,0.03))', border:'1px solid rgba(245,168,0,0.3)', borderRadius:16, padding:'clamp(16px,4vw,30px)', textAlign:'center' }}>
            <div style={{ fontSize:'clamp(12px,2vw,14px)', color:'#7A8BB0', marginBottom:4, letterSpacing:1, fontWeight:600 }}>Total a Pagar</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(42px,8vw,58px)', fontWeight:900, color:'#F5A800', lineHeight:1, marginBottom:20, letterSpacing:2 }}>
              R$ {valorAtual.toFixed(2).replace('.',',')}
            </div>
            <Link href="/compra" className="btn-buy" style={{ width:'100%', padding:'clamp(14px,3vw,22px)', border:'none', borderRadius:12, cursor:'pointer', fontSize:'clamp(16px,3.5vw,22px)', fontWeight:900, letterSpacing:2, textTransform:'uppercase', background:'linear-gradient(135deg,#FFD060,#F5A800,#C88000)', color:'#04091C', boxShadow:'0 8px 32px rgba(245,168,0,.4)', fontFamily:"'Barlow Condensed',sans-serif", display:'block', textDecoration:'none' }}>
              Garantir Meus Bilhetes Agora
            </Link>
            <div style={{ fontSize:'clamp(11px,2vw,14px)', color:'#7A8BB0', marginTop:12, fontWeight:600 }}>Pagamento 100% seguro via PIX • Confirmação imediata</div>
            <div style={{ fontSize:'clamp(11px,2vw,14px)', color:'#7A8BB0', marginTop:4, fontWeight:600 }}>Quanto mais bilhetes, maiores suas chances</div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ background:'rgba(4,9,28,0.95)', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'20px 16px', textAlign:'center', position:'relative', zIndex:10 }}>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:24, marginBottom:12 }}>
          <a href="https://wa.me/55" target="_blank" className="social-link" style={{ display:'flex', alignItems:'center', gap:8, color:'#25D366' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            <span style={{ fontSize:'clamp(13px,2.5vw,16px)', fontWeight:700 }}>WhatsApp</span>
          </a>
          <a href="https://instagram.com/capidasorte" target="_blank" className="social-link" style={{ display:'flex', alignItems:'center', gap:8, color:'#E1306C' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#E1306C"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span style={{ fontSize:'clamp(13px,2.5vw,16px)', fontWeight:700 }}>Instagram</span>
          </a>
        </div>
        <div style={{ fontSize:'clamp(11px,2vw,13px)', color:'#4A5B7A', fontWeight:600 }}>© 2026 Capi da Sorte • Todos os direitos reservados</div>
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:'clamp(36px,6vw,46px)', height:'clamp(36px,6vw,46px)', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(11px,2vw,14px)', fontWeight:900, color:'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1 }}>+18</div>
      </footer>

      {/* FEED */}
      <div style={{ position:'fixed', bottom:100, left:16, zIndex:200, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
        {feed.map(f => (
          <div key={f.id} className="feed-item" style={{ background:'rgba(4,9,28,.95)', border:'1px solid rgba(245,168,0,.3)', borderRadius:10, padding:'10px 14px', fontSize:'clamp(12px,2vw,14px)', fontWeight:600, color:'#fff', maxWidth:260, backdropFilter:'blur(10px)' }}>{f.text}</div>
        ))}
      </div>
    </>
  )
}
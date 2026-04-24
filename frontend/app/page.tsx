'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

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

const SORTEIOS = [
  { ordem: '1º Sorteio', data: '2026-04-15T20:00:00', premio: 500 },
  { ordem: '2º Sorteio', data: '2026-04-20T20:00:00', premio: 800 },
  { ordem: '3º Sorteio', data: '2026-04-26T20:00:00', premio: 1200 },
  { ordem: 'Sorteio Principal', data: '2026-04-30T20:00:00', premio: null },
]

function drawArvore(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle='#8B4513'
  ctx.fillRect(x-size*0.08,y-size*0.3,size*0.16,size*0.3)
  const cores=['#006400','#228B22','#32CD32']
  for(let i=0;i<3;i++){
    const sy=y-size*0.3-size*0.25*i; const sw=size*(0.8-i*0.15)
    ctx.beginPath(); ctx.moveTo(x,sy-size*0.35); ctx.lineTo(x-sw/2,sy); ctx.lineTo(x+sw/2,sy)
    ctx.closePath(); ctx.fillStyle=cores[i]+'cc'; ctx.fill()
  }
  const lc=['#FF0000','#FFD700','#00FF00','#0000FF','#FF6B00','#FF69B4']
  for(let i=0;i<14;i++){
    const angle=Math.random()*Math.PI*2; const r=Math.random()*size*0.35
    const lx=x+Math.cos(angle)*r; const ly=y-size*0.3+Math.sin(angle)*r*0.5-size*0.1
    ctx.beginPath(); ctx.arc(lx,ly,3,0,Math.PI*2)
    ctx.fillStyle=lc[i%lc.length]; ctx.shadowColor=lc[i%lc.length]; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0
  }
}

function drawPresente(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cor: string) {
  ctx.fillStyle=cor; ctx.fillRect(x-size/2,y-size/2,size,size)
  ctx.strokeStyle='gold'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(x,y-size/2); ctx.lineTo(x,y+size/2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-size/2,y); ctx.lineTo(x+size/2,y); ctx.stroke()
  ctx.strokeStyle='gold'; ctx.lineWidth=1; ctx.strokeRect(x-size/2,y-size/2,size,size)
  ctx.fillStyle='gold'
  ctx.beginPath(); ctx.ellipse(x-5,y-size/2,5,4,-0.5,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x+5,y-size/2,5,4,0.5,0,Math.PI*2); ctx.fill()
}

function drawCenoura(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rot: number) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot)
  ctx.fillStyle='#FF6600'
  ctx.beginPath(); ctx.moveTo(0,-size/2); ctx.lineTo(-size/4,size/4); ctx.lineTo(0,size/2); ctx.lineTo(size/4,size/4); ctx.closePath(); ctx.fill()
  ctx.strokeStyle='#CC4400'; ctx.lineWidth=1; ctx.stroke()
  const fc=['#228B22','#32CD32','#006400']
  for(let i=0;i<3;i++){
    ctx.strokeStyle=fc[i]; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(0,-size/2)
    ctx.quadraticCurveTo(Math.cos((-0.5+i*0.5)*Math.PI)*size*0.4,-size/2-size*0.4,Math.cos((-0.5+i*0.5)*Math.PI)*size*0.3,-size/2-size*0.5)
    ctx.stroke()
  }
  ctx.restore()
}

function drawCoelhoRodape(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, salto: number) {
  ctx.save(); ctx.translate(x,y-salto); ctx.scale(scale,scale)
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.ellipse(0,0,18,22,0,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(0,-28,14,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.ellipse(-8,-48,5,16,-.2,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,-48,5,16,.2,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FFB6C1'
  ctx.beginPath(); ctx.ellipse(-8,-48,2.5,12,-.2,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,-48,2.5,12,.2,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#333'
  ctx.beginPath(); ctx.arc(-5,-30,2.5,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(5,-30,2.5,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FF69B4'; ctx.beginPath(); ctx.arc(0,-24,2,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(0,20,6,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawCoracao(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cor: string) {
  ctx.beginPath(); ctx.moveTo(x,y+size*0.3)
  ctx.bezierCurveTo(x-size,y-size*0.3,x-size*1.5,y+size*0.5,x,y+size*1.2)
  ctx.bezierCurveTo(x+size*1.5,y+size*0.5,x+size,y-size*0.3,x,y+size*0.3)
  ctx.fillStyle=cor; ctx.fill()
}

function drawBalao(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, cor: string) {
  ctx.beginPath(); ctx.ellipse(x,y,r,r*1.2,0,0,Math.PI*2)
  ctx.fillStyle=cor+'cc'; ctx.fill(); ctx.strokeStyle=cor; ctx.lineWidth=1.5; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x,y+r*1.2); ctx.lineTo(x+Math.sin(y*0.05)*10,y+r*1.2+30)
  ctx.strokeStyle=cor+'88'; ctx.lineWidth=1; ctx.stroke()
  ctx.beginPath(); ctx.ellipse(x-r*0.25,y-r*0.3,r*0.2,r*0.15,-0.5,0,Math.PI*2)
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fill()
}

function drawGravata(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale)
  ctx.fillStyle='rgba(30,144,255,0.7)'
  ctx.beginPath(); ctx.moveTo(0,-30); ctx.lineTo(-10,-10); ctx.lineTo(-15,40); ctx.lineTo(0,55); ctx.lineTo(15,40); ctx.lineTo(10,-10); ctx.closePath(); ctx.fill()
  ctx.fillStyle='rgba(30,100,200,0.5)'
  ctx.beginPath(); ctx.moveTo(-10,-10); ctx.lineTo(10,-10); ctx.lineTo(8,0); ctx.lineTo(-8,0); ctx.closePath(); ctx.fill()
  ctx.restore()
}

function drawRaio(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.strokeStyle='rgba(255,50,0,0.8)'; ctx.lineWidth=2
  ctx.shadowColor='#FF3200'; ctx.shadowBlur=15
  ctx.beginPath(); ctx.moveTo(x,0)
  let cy=0; let cx=x
  while(cy<h){ cy+=Math.random()*40+20; cx+=Math.random()*40-20; ctx.lineTo(cx,cy) }
  ctx.stroke(); ctx.shadowBlur=0
}

function criarFogoDourado(canvas: HTMLCanvasElement) {
  const x=Math.random()*canvas.width; const y=Math.random()*canvas.height*0.6
  const cor=['#FFD700','#C0C0C0','#FFF8DC','#FFFACD','#E8E8E8'][Math.floor(Math.random()*5)]
  return { vida:100, particulas:Array.from({length:60},()=>({x,y,vx:(Math.random()-0.5)*12,vy:(Math.random()-0.5)*12,alpha:1,cor,r:Math.random()*2.5+0.5})) }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [premio, setPremio] = useState(0)
  const [displayPremio, setDisplayPremio] = useState(0)
  const [cotasVendidas, setCotasVendidas] = useState(0)
  const [campanhaCarregada, setCampanhaCarregada] = useState(false)
  const [userLogado, setUserLogado] = useState<{nome: string, data_nascimento?: string} | null>(null)
  const [temaAtivo, setTemaAtivo] = useState('padrao')
  const totalCotas = 10000000
  const incrementoPorCota = 1.5
  const [feed, setFeed] = useState<{id: number, text: string}[]>([])
  const feedCounter = useRef(0)
  const [pkgSelecionado, setPkgSelecionado] = useState(5)
  const [quantidade, setQuantidade] = useState(5)
  const [fraseIdx, setFraseIdx] = useState(0)
  const LIMITE_MAX = 200

  const proximoSorteio = SORTEIOS.find(s => new Date(s.data).getTime() > Date.now()) || SORTEIOS[SORTEIOS.length - 1]
  const countdown = useCountdown(proximoSorteio.data)

  const frases = [
    'Compras acontecendo agora',
    'Quanto mais bilhetes, maiores suas chances',
    'Compras confirmadas em tempo real',
    'Prêmio crescendo ao vivo',
    'Não fique de fora',
  ]

  const pacotes = [
    { qty: 1,  valor: 4.99,  label: null,          economia: null,  pulse: false },
    { qty: 5,  valor: 22.00, label: 'POPULAR',      economia: 2.95,  pulse: false },
    { qty: 10, valor: 40.00, label: null,            economia: 9.90,  pulse: true  },
    { qty: 20, valor: 70.00, label: 'MELHOR VALOR',  economia: 29.80, pulse: true  },
  ]

  const nomes = ['Maria S.', 'Joao P.', 'Ana C.', 'Pedro L.', 'Lucas M.', 'Carla F.', 'Bruno T.']

  const addFeed = useCallback((qty: number) => {
    const n = nomes[Math.floor(Math.random() * nomes.length)]
    const masked = n.split(' ')[0].substring(0, 2) + '*** ' + n.split(' ').pop()
    const id = ++feedCounter.current
    setFeed(prev => [{ id, text: `${masked} garantiu ${qty} bilhete${qty > 1 ? 's' : ''}` }, ...prev.slice(0, 2)])
    setTimeout(() => setFeed(prev => prev.filter(f => f.id !== id)), 5000)
  }, [])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try { setUserLogado(JSON.parse(userData)) }
      catch { setUserLogado(null) }
    }
  }, [])

  useEffect(() => {
    const carregarTema = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          if (user.data_nascimento) {
            const hoje = new Date()
            const nasc = new Date(user.data_nascimento)
            if (nasc.getDate() === hoje.getDate() && nasc.getMonth() === hoje.getMonth()) {
              setTemaAtivo('aniversario')
              return
            }
          }
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tema-ativo`)
        if (res.ok) {
          const data = await res.json()
          setTemaAtivo(data.tema || 'padrao')
        }
      } catch (err) {
        setTemaAtivo('padrao')
      }
    }
    carregarTema()
  }, [])

  useEffect(() => {
    const carregarCampanha = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/campanha-ativa`)
        if (res.ok) {
          const data = await res.json()
          const premioReal = parseFloat(data.premio_inicial) + (parseFloat(data.cotas_vendidas) * parseFloat(data.incremento_por_cota))
          setPremio(premioReal)
          setDisplayPremio(premioReal)
          setCotasVendidas(parseInt(data.cotas_vendidas))
          setCampanhaCarregada(true)
        }
      } catch (err) {
        console.error(err)
        setPremio(100000)
        setDisplayPremio(100000)
        setCampanhaCarregada(true)
      }
    }
    carregarCampanha()
  }, [])

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
    resize(); window.addEventListener('resize', resize)
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3, gold: Math.random() > 0.78,
      alpha: Math.random(), tw: Math.random() * 0.02 + 0.005
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha += s.tw; if (s.alpha > 1 || s.alpha < 0) s.tw *= -1
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
    const canvas = overlayRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let frame = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const snow = Array.from({length:100},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*3+1,speed:Math.random()*1.5+0.3,alpha:Math.random()*0.7+0.3}))
    const confetesDourados = Array.from({length:80},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,w:Math.random()*10+4,h:Math.random()*6+2,speed:Math.random()*3+1,cor:['#FFD700','#C0C0C0','#FFF8DC','#E8E8E8','#FFFACD'][Math.floor(Math.random()*5)],rot:Math.random()*360,rotSpeed:Math.random()*4-2}))
    const confetesCarnaval = Array.from({length:80},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,w:Math.random()*10+4,h:Math.random()*6+2,speed:Math.random()*3+1,cor:['#FF0044','#9B00FF','#FFD700','#00FF88','#FF6B00','#00BFFF'][Math.floor(Math.random()*6)],rot:Math.random()*360,rotSpeed:Math.random()*4-2}))
    const petalas = Array.from({length:50},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,r:Math.random()*8+3,speed:Math.random()*2+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const baloes = Array.from({length:15},()=>({x:Math.random()*innerWidth,y:innerHeight+Math.random()*200,r:Math.random()*25+15,speed:Math.random()*1.5+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2,cor:['#FF0044','#FFD700','#9B00FF','#00FF88','#FF6B00','#00BFFF','#FF69B4'][Math.floor(Math.random()*7)]}))
    const coracoes = Array.from({length:30},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,size:Math.random()*20+8,speed:Math.random()*1.5+0.3,alpha:Math.random()*0.5+0.5,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const presentes = Array.from({length:20},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,size:Math.random()*22+12,speed:Math.random()*2+0.5,cor:['#CC0000','#006400','#FFD700','#0000AA','#CC0000'][Math.floor(Math.random()*5)],rot:Math.random()*30-15}))
    const coelhos = Array.from({length:5},()=>({x:innerWidth*0.1+Math.random()*innerWidth*0.8,salto:0,saltoDir:1,saltoMax:Math.random()*40+20,scale:Math.random()*0.4+0.5}))
    const cenouras = Array.from({length:25},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,speed:Math.random()*2+0.5,size:Math.random()*30+20,rot:Math.random()*Math.PI*2,rotSpeed:(Math.random()-0.5)*0.05}))
    const fogosDourados: any[] = []
    let fogoTimer = 0
    const particulas_bf: any[] = []
    let raioTimer = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      if(temaAtivo==='natal'){
        snow.forEach(s=>{
          s.y+=s.speed; s.x+=Math.sin(frame*0.01+s.x)*0.3
          if(s.y>canvas.height){s.y=-10;s.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
          ctx.fillStyle=`rgba(255,255,255,${s.alpha})`; ctx.fill()
        })
        for(let i=0;i<5;i++) drawArvore(ctx,canvas.width*0.1+canvas.width*0.2*i,canvas.height,70)
        presentes.forEach(p=>{
          p.y+=p.speed
          if(p.y>canvas.height){p.y=-30;p.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180)
          drawPresente(ctx,0,0,p.size,p.cor); ctx.restore()
        })
      }

      if(temaAtivo==='ano_novo'){
        confetesDourados.forEach(c=>{
          c.y+=c.speed*0.8; c.x+=Math.sin(frame*0.015+c.x)*0.8; c.rot+=c.rotSpeed*0.5
          if(c.y>canvas.height){c.y=-20;c.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot*Math.PI/180)
          ctx.shadowColor=c.cor; ctx.shadowBlur=4
          ctx.fillStyle=c.cor; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h)
          ctx.shadowBlur=0; ctx.restore()
        })
        fogoTimer++
        if(fogoTimer>50){fogoTimer=0; fogosDourados.push(criarFogoDourado(canvas))}
        for(let i=fogosDourados.length-1;i>=0;i--){
          const f=fogosDourados[i]
          f.particulas.forEach((p: any)=>{
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.08; p.alpha-=0.015
            if(p.alpha>0){
              ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
              ctx.shadowColor=p.cor; ctx.shadowBlur=6
              ctx.fillStyle=p.cor+Math.floor(p.alpha*255).toString(16).padStart(2,'0')
              ctx.fill(); ctx.shadowBlur=0
            }
          })
          f.vida--; if(f.vida<=0)fogosDourados.splice(i,1)
        }
      }

      if(temaAtivo==='carnaval'){
        confetesCarnaval.forEach(c=>{
          c.y+=c.speed; c.x+=Math.sin(frame*0.03+c.x)*1.5; c.rot+=c.rotSpeed
          if(c.y>canvas.height){c.y=-20;c.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot*Math.PI/180)
          ctx.fillStyle=c.cor; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h); ctx.restore()
        })
        for(let i=0;i<3;i++){
          ctx.beginPath()
          const cores=['rgba(255,0,68,0.35)','rgba(155,0,255,0.35)','rgba(255,215,0,0.35)']
          ctx.strokeStyle=cores[i]; ctx.lineWidth=4
          for(let x=0;x<canvas.width;x+=5){
            const y=canvas.height*0.15+canvas.height*0.1*i+Math.sin(x*0.015+frame*0.04)*50
            x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
          }
          ctx.stroke()
        }
      }

      if(temaAtivo==='maes'){
        petalas.forEach(p=>{
          p.y+=p.speed; p.swingPos+=0.02; p.x+=Math.sin(p.swingPos)*p.swing
          if(p.y>canvas.height){p.y=-20;p.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
          ctx.fillStyle='rgba(255,105,180,0.5)'; ctx.fill()
          ctx.beginPath(); ctx.arc(p.x+p.r,p.y,p.r*0.8,0,Math.PI*2)
          ctx.fillStyle='rgba(255,182,193,0.35)'; ctx.fill()
        })
      }

      if(temaAtivo==='namorados'){
        coracoes.forEach(c=>{
          c.y+=c.speed; c.swingPos+=0.02; c.x+=Math.sin(c.swingPos)*c.swing
          if(c.y>canvas.height){c.y=-30;c.x=Math.random()*canvas.width}
          drawCoracao(ctx,c.x,c.y,c.size,`rgba(255,0,68,${c.alpha})`)
        })
        petalas.forEach(p=>{
          p.y+=p.speed*0.5; p.swingPos+=0.015; p.x+=Math.sin(p.swingPos)*p.swing
          if(p.y>canvas.height){p.y=-20;p.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*0.7,0,Math.PI*2)
          ctx.fillStyle='rgba(220,20,60,0.3)'; ctx.fill()
        })
      }

      if(temaAtivo==='pais'){
        for(let i=0;i<5;i++){
          const x=canvas.width*0.1+canvas.width*0.2*i
          const y=70+Math.sin(frame*0.02+i*1.2)*15
          drawGravata(ctx,x,y,0.8)
        }
      }

      if(temaAtivo==='pascoa'){
        cenouras.forEach(c=>{
          c.y+=c.speed; c.rot+=c.rotSpeed
          if(c.y>canvas.height){c.y=-40;c.x=Math.random()*canvas.width}
          drawCenoura(ctx,c.x,c.y,c.size,c.rot)
        })
        coelhos.forEach(c=>{
          c.salto+=c.saltoDir*3
          if(c.salto>=c.saltoMax||c.salto<=0) c.saltoDir*=-1
          drawCoelhoRodape(ctx,c.x,canvas.height-40,c.scale,Math.abs(c.salto))
        })
      }

      if(temaAtivo==='black_friday'){
        raioTimer++
        if(raioTimer>30){raioTimer=0; drawRaio(ctx,Math.random()*canvas.width,canvas.height)}
        const grad=ctx.createRadialGradient(0,0,0,0,0,300)
        grad.addColorStop(0,`rgba(255,0,0,${0.15+Math.sin(frame*0.05)*0.05})`)
        grad.addColorStop(1,'transparent')
        ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height)
        const grad2=ctx.createRadialGradient(canvas.width,canvas.height,0,canvas.width,canvas.height,300)
        grad2.addColorStop(0,`rgba(255,0,0,${0.15+Math.sin(frame*0.05)*0.05})`)
        grad2.addColorStop(1,'transparent')
        ctx.fillStyle=grad2; ctx.fillRect(0,0,canvas.width,canvas.height)
        const bAlpha=0.4+Math.sin(frame*0.15)*0.3
        ctx.shadowColor='#FF0000'; ctx.shadowBlur=20
        ctx.strokeStyle=`rgba(255,0,0,${bAlpha})`; ctx.lineWidth=5
        ctx.strokeRect(8,8,canvas.width-16,canvas.height-16)
        ctx.shadowBlur=0
        if(frame%3===0) particulas_bf.push({x:Math.random()*canvas.width,y:canvas.height+10,vx:(Math.random()-0.5)*2,vy:-(Math.random()*3+1),alpha:1,size:Math.random()*3+1})
        for(let i=particulas_bf.length-1;i>=0;i--){
          const p=particulas_bf[i]; p.x+=p.vx; p.y+=p.vy; p.alpha-=0.01
          if(p.alpha<=0||p.y<-10){particulas_bf.splice(i,1);continue}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
          ctx.fillStyle=`rgba(255,30,0,${p.alpha})`
          ctx.shadowColor='#FF0000'; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0
        }
      }

      if(temaAtivo==='aniversario'){
        baloes.forEach(b=>{
          b.y-=b.speed; b.swingPos+=0.02; b.x+=Math.sin(b.swingPos)*b.swing
          if(b.y<-100){b.y=canvas.height+100;b.x=Math.random()*canvas.width}
          drawBalao(ctx,b.x,b.y,b.r,b.cor)
        })
      }

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [temaAtivo])

  useEffect(() => {
    if (!campanhaCarregada) return
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
    if (!campanhaCarregada) return
    const interval = setInterval(() => {
      const qty = Math.floor(Math.random() * 8) + 1
      setPremio(p => p + incrementoPorCota * qty)
      setCotasVendidas(p => p + qty)
      addFeed(qty)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [campanhaCarregada, addFeed])

  const formatPremio = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const pct = Math.max(0.1, (cotasVendidas / totalCotas) * 100)
  const pad = (n: number) => String(n).padStart(2, '0')

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

  const calcularEconomia = (qty: number) => {
    const semDesconto = parseFloat((qty * 4.99).toFixed(2))
    const comDesconto = calcularValor(qty)
    const eco = semDesconto - comDesconto
    return eco > 0.01 ? eco : null
  }

  const valorAtual = calcularValor(quantidade)
  const economiaAtual = calcularEconomia(quantidade)

  const incrementar = () => setQuantidade(q => Math.min(q + 1, LIMITE_MAX))
  const decrementar = () => setQuantidade(q => Math.max(q - 1, 1))

  return (<>
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
        .btn-qty{background:rgba(245,168,0,0.1);border:2px solid rgba(245,168,0,0.4);color:#F5A800;font-family:'Bebas Neue',cursive;font-size:24px;width:52px;height:52px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
        .btn-qty:hover{background:rgba(245,168,0,0.2);border-color:#F5A800;}
        .btn-qty:active{transform:scale(.93);}
        .btn-qty:disabled{opacity:0.3;cursor:not-allowed;}
        .countdown-num{font-family:'Bebas Neue',cursive;font-size:clamp(28px,7vw,42px);color:#1FCC6A;line-height:1;filter:drop-shadow(0 0 8px rgba(31,204,106,0.5));}
        .countdown-lbl{font-size:9px;color:#7A8BB0;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-top:2px;}
        .countdown-sep{font-family:'Bebas Neue',cursive;font-size:28px;color:rgba(31,204,106,0.4);margin:0 4px;padding-bottom:14px;line-height:1;}
        .aniv-banner{animation:aniv-glow 2s ease-in-out infinite;}
        @keyframes aniv-glow{0%,100%{box-shadow:0 0 20px rgba(255,140,0,0.4)}50%{box-shadow:0 0 40px rgba(255,140,0,0.8)}}
      `}</style>

      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />
      <canvas ref={overlayRef} style={{ position:'fixed', inset:0, zIndex:2, pointerEvents:'none' }} />

      <main style={{ fontFamily:"'Barlow',sans-serif", minHeight:'100vh', color:'#fff', position:'relative', zIndex:1, paddingBottom:100 }}>

        {temaAtivo==='aniversario'&&userLogado&&(
          <div className="aniv-banner" style={{ background:'linear-gradient(135deg,rgba(255,140,0,0.15),rgba(255,69,0,0.1))', border:'1px solid rgba(255,140,0,0.4)', padding:'14px 20px', textAlign:'center', position:'relative', zIndex:10 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(18px,4vw,28px)', color:'#FF8C00', letterSpacing:3 }}>
              🎂 Feliz Aniversário, {userLogado.nome.split(' ')[0]}!
            </div>
            <div style={{ fontSize:'clamp(12px,2vw,14px)', color:'rgba(255,140,0,0.7)', marginTop:4, fontWeight:600 }}>
              Você tem um desconto exclusivo esperando por você hoje!
            </div>
          </div>
        )}

        <header style={{ background:'rgba(4,9,28,0.95)', borderBottom:'1px solid rgba(245,168,0,0.2)', padding:'0 16px', height:70, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)' }}>
          <Link href="/" className="logo-wrap" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
            <span style={{ fontSize:'clamp(18px,4vw,26px)', fontWeight:900, color:'#F5A800', letterSpacing:2, fontFamily:"'Bebas Neue',cursive" }}>CAPI DA SORTE</span>
          </Link>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {userLogado ? (
              <>
                <span style={{ fontSize:'clamp(12px,2vw,14px)', color:'rgba(245,168,0,0.7)', fontWeight:600 }}>{userLogado.nome.split(' ')[0]}</span>
                <Link href="/minha-conta" style={{ background:'linear-gradient(135deg,#FFD060,#F5A800)', color:'#04091C', padding:'8px clamp(10px,2vw,18px)', borderRadius:8, fontWeight:700, fontSize:'clamp(12px,2vw,15px)', textDecoration:'none' }}>Minha Conta</Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ background:'transparent', border:'2px solid #F5A800', color:'#F5A800', padding:'8px clamp(10px,2vw,18px)', borderRadius:8, fontWeight:700, fontSize:'clamp(12px,2vw,15px)', textDecoration:'none' }}>Entrar</Link>
                <Link href="/cadastro" style={{ background:'linear-gradient(135deg,#FFD060,#F5A800)', color:'#04091C', padding:'8px clamp(10px,2vw,18px)', borderRadius:8, fontWeight:700, fontSize:'clamp(12px,2vw,15px)', textDecoration:'none' }}>Cadastrar</Link>
              </>
            )}
          </div>
        </header>

        <div style={{ textAlign:'center', padding:'40px 16px 16px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(14px,3vw,18px)', fontWeight:700, letterSpacing:5, textTransform:'uppercase', color:'#7A8BB0', marginBottom:8 }}>Premio Acumulado</div>
          <div style={{ position:'relative', display:'inline-block', marginBottom:16 }}>
            <div className="glow-ring" style={{ width:300, height:120 }}></div>
            <div className="glow-ring" style={{ width:360, height:150, animationDelay:'.4s', opacity:.6 }}></div>
            <div className="glow-ring" style={{ width:420, height:180, animationDelay:'.8s', opacity:.3 }}></div>
            <div className="counter">{campanhaCarregada ? `R$ ${formatPremio(displayPremio)}` : 'Carregando...'}</div>
          </div>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(31,204,106,.08)', border:'1px solid rgba(31,204,106,.3)', borderRadius:20, padding:'6px 16px', fontSize:'clamp(10px,2vw,12px)', fontWeight:700, color:'#1FCC6A', letterSpacing:3, textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span className="live-dot" style={{ width:8, height:8, borderRadius:'50%', background:'#1FCC6A', display:'inline-block' }}></span>
              Atualizando ao vivo • Participe e Concorra
            </div>
          </div>
        </div>

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
          <div style={{ textAlign:'center', marginTop:10 }}>
            <span key={fraseIdx} className="frase-rotativa" style={{ fontSize:'clamp(11px,2vw,13px)', color:'rgba(245,168,0,0.6)', fontWeight:600, letterSpacing:1 }}>{frases[fraseIdx]}</span>
          </div>
        </div>

        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px 24px' }}>
          <div style={{ background:'rgba(31,204,106,0.07)', border:'1px solid rgba(31,204,106,0.2)', borderRadius:16, padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#7A8BB0', fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>{proximoSorteio.ordem} — Faltam</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
              {[{v:countdown.dias,l:'dias'},{v:countdown.horas,l:'horas'},{v:countdown.minutos,l:'min'},{v:countdown.segundos,l:'seg'}].map((c,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-end' }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div className="countdown-num">{pad(c.v)}</div>
                    <div className="countdown-lbl">{c.l}</div>
                  </div>
                  {i<3&&<div className="countdown-sep">:</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 16px 20px' }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:'clamp(16px,3vw,20px)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#fff', marginBottom:14 }}>Escolha seu Pacote</div>
          <div className="pacotes-grid">
            {pacotes.map((pkg) => (
              <div key={pkg.qty} className={`pkg${pkg.pulse?' pkg-pulse':''}`} onClick={()=>{setPkgSelecionado(pkg.qty);setQuantidade(pkg.qty);}} style={{ border:`2px solid ${pkgSelecionado===pkg.qty?'#F5A800':'rgba(255,255,255,0.12)'}`, background:pkgSelecionado===pkg.qty?'rgba(245,168,0,0.14)':'rgba(255,255,255,0.03)', borderRadius:14, padding:'16px 8px', textAlign:'center', position:'relative' }}>
                {pkg.label&&<div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#F5A800', color:'#04091C', fontSize:'clamp(7px,1.5vw,9px)', fontWeight:900, padding:'3px 8px', borderRadius:8, whiteSpace:'nowrap', letterSpacing:1 }}>{pkg.label}</div>}
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,38px)', fontWeight:900, color:'#fff', lineHeight:1 }}>{pkg.qty}</div>
                <div style={{ fontSize:'clamp(11px,2vw,12px)', color:'#7A8BB0', marginTop:4, fontWeight:600 }}>bilhete{pkg.qty>1?'s':''}</div>
                <div style={{ fontSize:'clamp(14px,3vw,18px)', fontWeight:700, color:'#F5A800', marginTop:6 }}>R$ {pkg.valor.toFixed(2).replace('.',',')}</div>
                {pkg.economia&&<div style={{ fontSize:'clamp(10px,2vw,12px)', color:'#00DD44', fontWeight:800, marginTop:4 }}>economia R$ {pkg.economia.toFixed(2).replace('.',',')}</div>}
              </div>
            ))}
          </div>

          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:16, padding:'20px', marginBottom:16 }}>
            <div style={{ fontSize:'clamp(12px,2vw,14px)', color:'#7A8BB0', fontWeight:600, letterSpacing:1, marginBottom:14, textAlign:'center' }}>Ou escolha a quantidade</div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:12 }}>
              <button className="btn-qty" onClick={decrementar} disabled={quantidade<=1}>−</button>
              <div style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(36px,8vw,52px)', color:'#fff', lineHeight:1 }}>{quantidade}</div>
                <div style={{ fontSize:'clamp(11px,2vw,12px)', color:'#7A8BB0', fontWeight:600 }}>bilhete{quantidade>1?'s':''}</div>
              </div>
              <button className="btn-qty" onClick={incrementar} disabled={quantidade>=LIMITE_MAX}>+</button>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(28px,6vw,42px)', color:'#F5A800', lineHeight:1 }}>R$ {valorAtual.toFixed(2).replace('.',',')}</div>
              {economiaAtual&&economiaAtual>0&&<div style={{ fontSize:'clamp(11px,2vw,13px)', color:'#00DD44', fontWeight:800, marginTop:4 }}>economia R$ {economiaAtual.toFixed(2).replace('.',',')}</div>}
              {quantidade>=LIMITE_MAX&&<div style={{ fontSize:'clamp(10px,2vw,12px)', color:'rgba(245,168,0,0.5)', marginTop:6, fontWeight:600 }}>Limite máximo atingido</div>}
            </div>
          </div>

          <div style={{ background:'linear-gradient(135deg,rgba(245,168,0,0.1),rgba(245,168,0,0.03))', border:'1px solid rgba(245,168,0,0.3)', borderRadius:16, padding:'clamp(16px,4vw,30px)', textAlign:'center' }}>
            <div style={{ fontSize:'clamp(12px,2vw,14px)', color:'#7A8BB0', marginBottom:4, letterSpacing:1, fontWeight:600 }}>Total a Pagar</div>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:'clamp(42px,8vw,58px)', fontWeight:900, color:'#F5A800', lineHeight:1, marginBottom:20, letterSpacing:2 }}>R$ {valorAtual.toFixed(2).replace('.',',')}</div>
            <Link href={`/compra?qty=${quantidade}`} className="btn-buy" style={{ width:'100%', padding:'clamp(14px,3vw,22px)', border:'none', borderRadius:12, cursor:'pointer', fontSize:'clamp(16px,3.5vw,22px)', fontWeight:900, letterSpacing:2, textTransform:'uppercase', background:'linear-gradient(135deg,#FFD060,#F5A800,#C88000)', color:'#04091C', boxShadow:'0 8px 32px rgba(245,168,0,.4)', fontFamily:"'Barlow Condensed',sans-serif", display:'block', textDecoration:'none' }}>
              Garantir Meus Bilhetes Agora
            </Link>
            <div style={{ fontSize:'clamp(11px,2vw,14px)', color:'#7A8BB0', marginTop:12, fontWeight:600 }}>Pagamento 100% seguro via PIX • Confirmação imediata</div>
            <div style={{ fontSize:'clamp(11px,2vw,14px)', color:'#7A8BB0', marginTop:4, fontWeight:600 }}>Quanto mais bilhetes, maiores suas chances</div>
          </div>
        </div>

      </main>

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
        <div style={{ fontSize:'clamp(11px,2vw,13px)', color:'#4A5B7A', fontWeight:600 }}>©️ 2026 Capi da Sorte • Todos os direitos reservados</div>
        <div style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:'clamp(36px,6vw,46px)', height:'clamp(36px,6vw,46px)', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(11px,2vw,14px)', fontWeight:900, color:'rgba(255,255,255,0.5)', fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1 }}>+18</div>
      </footer>

      <div style={{ position:'fixed', bottom:100, left:16, zIndex:200, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
        {feed.map(f => (
          <div key={f.id} className="feed-item" style={{ background:'rgba(4,9,28,.95)', border:'1px solid rgba(245,168,0,.3)', borderRadius:10, padding:'10px 14px', fontSize:'clamp(12px,2vw,14px)', fontWeight:600, color:'#fff', maxWidth:260, backdropFilter:'blur(10px)' }}>{f.text}</div>
        ))}
      </div>
    </>
  )
}
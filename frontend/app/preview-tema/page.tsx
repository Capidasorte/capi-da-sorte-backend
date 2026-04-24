'use client'
import { useEffect, useRef, useState } from 'react'

const TEMAS = [
  { id:'padrao', nome:'Padrão', cor:'#F5A800' },
  { id:'natal', nome:'Natal', cor:'#CC0000' },
  { id:'ano_novo', nome:'Ano Novo', cor:'#FFD700' },
  { id:'carnaval', nome:'Carnaval', cor:'#9B00FF' },
  { id:'maes', nome:'Dia das Mães', cor:'#FF69B4' },
  { id:'namorados', nome:'Namorados', cor:'#FF0044' },
  { id:'pais', nome:'Dia dos Pais', cor:'#1E90FF' },
  { id:'pascoa', nome:'Páscoa', cor:'#9ACD32' },
  { id:'black_friday', nome:'Black Friday', cor:'#FF0000' },
  { id:'aniversario', nome:'Aniversariante', cor:'#FF8C00' },
]

function drawArvore(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle='#8B4513'
  ctx.fillRect(x-size*0.08,y-size*0.3,size*0.16,size*0.3)
  const cores=['#006400','#228B22','#32CD32']
  for(let i=0;i<3;i++){
    const sy=y-size*0.3-size*0.25*i
    const sw=size*(0.8-i*0.15)
    ctx.beginPath()
    ctx.moveTo(x,sy-size*0.35)
    ctx.lineTo(x-sw/2,sy)
    ctx.lineTo(x+sw/2,sy)
    ctx.closePath()
    ctx.fillStyle=cores[i]+'cc'
    ctx.fill()
  }
  const luzesCores=['#FF0000','#FFD700','#00FF00','#0000FF','#FF6B00','#FF69B4']
  for(let i=0;i<12;i++){
    const angle=Math.random()*Math.PI*2
    const r=Math.random()*size*0.35
    const lx=x+Math.cos(angle)*r
    const ly=y-size*0.3+Math.sin(angle)*r*0.5-size*0.1
    ctx.beginPath(); ctx.arc(lx,ly,3,0,Math.PI*2)
    ctx.fillStyle=luzesCores[i%luzesCores.length]
    ctx.shadowColor=luzesCores[i%luzesCores.length]
    ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0
  }
}

function drawCoracao(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cor: string) {
  ctx.beginPath()
  ctx.moveTo(x,y+size*0.3)
  ctx.bezierCurveTo(x-size,y-size*0.3,x-size*1.5,y+size*0.5,x,y+size*1.2)
  ctx.bezierCurveTo(x+size*1.5,y+size*0.5,x+size,y-size*0.3,x,y+size*0.3)
  ctx.fillStyle=cor; ctx.fill()
}

function drawBalao(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, cor: string) {
  ctx.beginPath(); ctx.ellipse(x,y,r,r*1.2,0,0,Math.PI*2)
  ctx.fillStyle=cor+'cc'; ctx.fill()
  ctx.strokeStyle=cor; ctx.lineWidth=1.5; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x,y+r*1.2); ctx.lineTo(x+Math.sin(y*0.05)*10,y+r*1.2+30)
  ctx.strokeStyle=cor+'88'; ctx.lineWidth=1; ctx.stroke()
  ctx.beginPath(); ctx.ellipse(x-r*0.25,y-r*0.3,r*0.2,r*0.15,-0.5,0,Math.PI*2)
  ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fill()
}

function drawGravata(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale)
  ctx.fillStyle='rgba(30,144,255,0.7)'
  ctx.beginPath(); ctx.moveTo(0,-30); ctx.lineTo(-10,-10); ctx.lineTo(-15,40)
  ctx.lineTo(0,55); ctx.lineTo(15,40); ctx.lineTo(10,-10); ctx.closePath()
  ctx.fill()
  ctx.fillStyle='rgba(30,100,200,0.5)'
  ctx.beginPath(); ctx.moveTo(-10,-10); ctx.lineTo(10,-10)
  ctx.lineTo(8,0); ctx.lineTo(-8,0); ctx.closePath(); ctx.fill()
  ctx.restore()
}

function drawRaio(ctx: CanvasRenderingContext2D, x: number, h: number) {
  ctx.strokeStyle='rgba(255,50,0,0.8)'; ctx.lineWidth=2
  ctx.shadowColor='#FF3200'; ctx.shadowBlur=15
  ctx.beginPath(); ctx.moveTo(x,0)
  let cy=0; let cx=x
  while(cy<h){
    cy+=Math.random()*40+20; cx+=Math.random()*40-20; ctx.lineTo(cx,cy)
  }
  ctx.stroke(); ctx.shadowBlur=0
}

function criarFogo(canvas: HTMLCanvasElement) {
  const x=Math.random()*canvas.width
  const y=Math.random()*canvas.height*0.5
  const cor=['#FFD700','#FF0044','#00FF88','#00BFFF','#FF6B00','#9B00FF'][Math.floor(Math.random()*6)]
  return {
    vida:80,
    particulas:Array.from({length:50},()=>({
      x,y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10,alpha:1,cor
    }))
  }
}

function hexToRgbInline(hex: string) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}export default function PreviewTemaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [tema, setTema] = useState('padrao')
  const [countdown, setCountdown] = useState({h:0,m:0,s:0})

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const vira = new Date(now.getFullYear()+1,0,1)
      const diff = vira.getTime()-now.getTime()
      setCountdown({h:Math.floor(diff/3600000)%24,m:Math.floor(diff/60000)%60,s:Math.floor(diff/1000)%60})
    },1000)
    return ()=>clearInterval(id)
  },[])

  useEffect(()=>{
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight}
    resize(); addEventListener('resize',resize)
    const stars = Array.from({length:150},()=>({
      x:Math.random()*innerWidth,y:Math.random()*innerHeight,
      r:Math.random()*1.5+0.3,gold:Math.random()>0.78,
      alpha:Math.random(),tw:Math.random()*0.02+0.005
    }))
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      stars.forEach(s=>{
        s.alpha+=s.tw; if(s.alpha>1||s.alpha<0)s.tw*=-1
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=s.gold?`rgba(245,168,0,${Math.abs(s.alpha)})`:`rgba(255,255,255,${Math.abs(s.alpha)*0.5})`
        ctx.fill()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(animId);removeEventListener('resize',resize)}
  },[])

  useEffect(()=>{
    const canvas = overlayRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let frame = 0
    const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight}
    resize(); addEventListener('resize',resize)

    const snow = Array.from({length:100},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*3+1,speed:Math.random()*1.5+0.3,alpha:Math.random()*0.7+0.3}))
    const confetes = Array.from({length:80},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,w:Math.random()*10+4,h:Math.random()*6+2,speed:Math.random()*3+1,cor:['#FF0044','#9B00FF','#FFD700','#00FF88','#FF6B00','#00BFFF'][Math.floor(Math.random()*6)],rot:Math.random()*360,rotSpeed:Math.random()*4-2}))
    const petalas = Array.from({length:50},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,r:Math.random()*8+3,speed:Math.random()*2+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const baloes = Array.from({length:15},()=>({x:Math.random()*innerWidth,y:innerHeight+Math.random()*200,r:Math.random()*25+15,speed:Math.random()*1.5+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2,cor:['#FF0044','#FFD700','#9B00FF','#00FF88','#FF6B00','#00BFFF','#FF69B4'][Math.floor(Math.random()*7)]}))
    const ovos = Array.from({length:20},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,speed:Math.random()*1+0.3,rx:Math.random()*15+8,ry:Math.random()*20+10,cor:['#FF69B4','#9ACD32','#FFD700','#00BFFF','#FF6B00'][Math.floor(Math.random()*5)],rot:Math.random()*360}))
    const coracoes = Array.from({length:30},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,size:Math.random()*20+8,speed:Math.random()*1.5+0.3,alpha:Math.random()*0.5+0.5,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const fogos: any[] = []
    let fogoTimer = 0

    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      frame++

      if(tema==='natal'){
        snow.forEach(s=>{
          s.y+=s.speed; s.x+=Math.sin(frame*0.01+s.x)*0.3
          if(s.y>canvas.height){s.y=-10;s.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
          ctx.fillStyle=`rgba(255,255,255,${s.alpha})`; ctx.fill()
        })
        for(let i=0;i<5;i++) drawArvore(ctx,canvas.width*0.1+canvas.width*0.2*i,canvas.height,60)
      }

      if(tema==='ano_novo'){
        confetes.forEach(c=>{
          c.y+=c.speed; c.x+=Math.sin(frame*0.02+c.x)*0.5; c.rot+=c.rotSpeed
          if(c.y>canvas.height){c.y=-20;c.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot*Math.PI/180)
          ctx.fillStyle=c.cor; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h); ctx.restore()
        })
        fogoTimer++
        if(fogoTimer>80){fogoTimer=0; fogos.push(criarFogo(canvas))}
        for(let i=fogos.length-1;i>=0;i--){
          const f=fogos[i]
          f.particulas.forEach((p: any)=>{
            p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.alpha-=0.018
            if(p.alpha>0){
              ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2)
              ctx.fillStyle=p.cor+Math.floor(p.alpha*255).toString(16).padStart(2,'0')
              ctx.fill()
            }
          })
          f.vida--; if(f.vida<=0)fogos.splice(i,1)
        }
      }

      if(tema==='carnaval'){
        confetes.forEach(c=>{
          c.y+=c.speed; c.x+=Math.sin(frame*0.03+c.x)*1.5; c.rot+=c.rotSpeed
          if(c.y>canvas.height){c.y=-20;c.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.rot*Math.PI/180)
          ctx.fillStyle=c.cor; ctx.fillRect(-c.w/2,-c.h/2,c.w,c.h); ctx.restore()
        })
        for(let i=0;i<3;i++){
          ctx.beginPath()
          const cores=['rgba(255,0,68,0.4)','rgba(155,0,255,0.4)','rgba(255,215,0,0.4)']
          ctx.strokeStyle=cores[i]; ctx.lineWidth=3
          for(let x=0;x<canvas.width;x+=5){
            const y=canvas.height*0.2+canvas.height*0.15*i+Math.sin(x*0.02+frame*0.05)*40
            x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
          }
          ctx.stroke()
        }
      }

      if(tema==='maes'){
        petalas.forEach(p=>{
          p.y+=p.speed; p.swingPos+=0.02; p.x+=Math.sin(p.swingPos)*p.swing
          if(p.y>canvas.height){p.y=-20;p.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
          ctx.fillStyle='rgba(255,105,180,0.5)'; ctx.fill()
          ctx.beginPath(); ctx.arc(p.x+p.r,p.y,p.r*0.8,0,Math.PI*2)
          ctx.fillStyle='rgba(255,182,193,0.35)'; ctx.fill()
        })
      }

      if(tema==='namorados'){
        coracoes.forEach(c=>{
          c.y+=c.speed; c.swingPos+=0.02; c.x+=Math.sin(c.swingPos)*c.swing
          if(c.y>canvas.height){c.y=-30;c.x=Math.random()*canvas.width}
          drawCoracao(ctx,c.x,c.y,c.size,`rgba(255,0,68,${c.alpha})`)
        })
      }

      if(tema==='pais'){
        for(let i=0;i<5;i++){
          const x=canvas.width*0.1+canvas.width*0.2*i
          const y=60+Math.sin(frame*0.02+i*1.2)*15
          drawGravata(ctx,x,y,0.8)
        }
      }

      if(tema==='pascoa'){
        ovos.forEach(o=>{
          o.y+=o.speed; o.rot+=0.5
          if(o.y>canvas.height){o.y=-30;o.x=Math.random()*canvas.width}
          ctx.save(); ctx.translate(o.x,o.y); ctx.rotate(o.rot*Math.PI/180)
          ctx.beginPath(); ctx.ellipse(0,0,o.rx,o.ry,0,0,Math.PI*2)
          ctx.fillStyle=o.cor+'aa'; ctx.fill()
          ctx.strokeStyle=o.cor; ctx.lineWidth=2; ctx.stroke()
          ctx.restore()
        })
      }

      if(tema==='black_friday'){
        if(frame%50===0) drawRaio(ctx,Math.random()*canvas.width,canvas.height)
        const a=0.3+Math.sin(frame*0.1)*0.2
        ctx.strokeStyle=`rgba(255,0,0,${a})`; ctx.lineWidth=4
        ctx.strokeRect(8,8,canvas.width-16,canvas.height-16)
      }

      if(tema==='aniversario'){
        baloes.forEach(b=>{
          b.y-=b.speed; b.swingPos+=0.02; b.x+=Math.sin(b.swingPos)*b.swing
          if(b.y<-100){b.y=canvas.height+100;b.x=Math.random()*canvas.width}
          drawBalao(ctx,b.x,b.y,b.r,b.cor)
        })
      }

      animId=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(animId);removeEventListener('resize',resize)}
  },[tema])

  const temaSel = TEMAS.find(t=>t.id===tema)!
  const pad = (n: number) => String(n).padStart(2,'0')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#04091C;overflow:hidden}
        .counter{font-family:'Bebas Neue',cursive;font-size:clamp(52px,12vw,110px);line-height:1;background:linear-gradient(135deg,#C88000 0%,#FFD060 40%,#F5A800 60%,#FFD060 80%,#C88000 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:metal-shine 3s linear infinite;letter-spacing:2px;filter:drop-shadow(0 0 30px rgba(245,168,0,.5));}
        @keyframes metal-shine{0%{background-position:0% center}100%{background-position:200% center}}
        .live-dot{animation:blink 1s infinite;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .tema-btn{cursor:pointer;border-radius:10px;padding:8px 12px;border:2px solid transparent;transition:all .2s;font-family:'Barlow',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);white-space:nowrap}
        .tema-btn.on{color:#fff}
        .tema-btn:hover{background:rgba(255,255,255,0.1);color:#fff}
        .bf-text{font-family:'Bebas Neue',cursive;font-size:clamp(20px,5vw,36px);color:#FF0000;animation:bf-pulse 0.5s ease-in-out infinite;letter-spacing:4px;text-shadow:0 0 20px #FF0000}
        @keyframes bf-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(1.02)}}
        .aniv-text{font-family:'Bebas Neue',cursive;font-size:clamp(24px,5vw,42px);background:linear-gradient(135deg,#FFD700,#FF8C00,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:metal-shine 2s linear infinite;background-size:200% auto;}
        .natal-text{font-family:'Bebas Neue',cursive;font-size:clamp(20px,4vw,36px);color:#CC0000;text-shadow:0 0 20px rgba(204,0,0,0.8);letter-spacing:3px}
        .anovo-text{font-family:'Bebas Neue',cursive;font-size:clamp(18px,4vw,32px);color:#FFD700;text-shadow:0 0 20px rgba(255,215,0,0.8);letter-spacing:2px}
        .countdown-num{font-family:'Bebas Neue',cursive;font-size:clamp(32px,7vw,52px);color:#FFD700;filter:drop-shadow(0 0 10px rgba(255,215,0,0.8));}
      `}</style>

      <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      <canvas ref={overlayRef} style={{position:'fixed',inset:0,zIndex:1,pointerEvents:'none'}}/>

      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(4,9,28,0.95)',borderBottom:'1px solid rgba(245,168,0,0.2)',padding:'10px 16px',backdropFilter:'blur(20px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,overflowX:'auto',paddingBottom:2}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:'#F5A800',letterSpacing:2,whiteSpace:'nowrap',marginRight:8}}>PREVIEW</div>
          {TEMAS.map(t=>(
            <button key={t.id} className={`tema-btn ${tema===t.id?'on':''}`} style={{borderColor:tema===t.id?t.cor:'transparent',background:tema===t.id?`rgba(${hexToRgbInline(t.cor)},0.15)`:'rgba(255,255,255,0.05)',color:tema===t.id?'#fff':'rgba(255,255,255,0.4)'}} onClick={()=>setTema(t.id)}>{t.nome}</button>
          ))}
        </div>
      </div>

      <div style={{position:'relative',zIndex:10,minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 16px 16px',fontFamily:"'Barlow',sans-serif",color:'#fff',textAlign:'center'}}>

        {tema==='natal'&&<div className="natal-text" style={{marginBottom:16}}>Feliz Natal</div>}
        {tema==='ano_novo'&&<div className="anovo-text" style={{marginBottom:8}}>Feliz {new Date().getFullYear()+1}</div>}
        {tema==='black_friday'&&<div className="bf-text" style={{marginBottom:16}}>Black Friday</div>}
        {tema==='aniversario'&&<div className="aniv-text" style={{marginBottom:16}}>Feliz Aniversário</div>}
        {tema==='maes'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(20px,4vw,34px)',color:'#FF69B4',textShadow:'0 0 20px rgba(255,105,180,0.6)',marginBottom:16,letterSpacing:2}}>Feliz Dia das Mães</div>}
        {tema==='namorados'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(20px,4vw,34px)',color:'#FF0044',textShadow:'0 0 20px rgba(255,0,68,0.6)',marginBottom:16,letterSpacing:2}}>Feliz Dia dos Namorados</div>}
        {tema==='pais'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(20px,4vw,34px)',color:'#1E90FF',textShadow:'0 0 20px rgba(30,144,255,0.6)',marginBottom:16,letterSpacing:2}}>Feliz Dia dos Pais</div>}
        {tema==='pascoa'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(20px,4vw,34px)',color:'#9ACD32',textShadow:'0 0 20px rgba(154,205,50,0.6)',marginBottom:16,letterSpacing:2}}>Feliz Páscoa</div>}

        {tema==='ano_novo'&&(
          <div style={{display:'flex',gap:8,alignItems:'flex-end',justifyContent:'center',marginBottom:20}}>
            {[{v:countdown.h,l:'horas'},{v:countdown.m,l:'min'},{v:countdown.s,l:'seg'}].map((c,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div className="countdown-num">{pad(c.v)}</div>
                <div style={{fontSize:10,color:'#7A8BB0',letterSpacing:2,textTransform:'uppercase'}}>{c.l}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{fontFamily:"'Barlow',sans-serif",fontSize:'clamp(12px,2.5vw,16px)',fontWeight:700,letterSpacing:5,textTransform:'uppercase',color:'#7A8BB0',marginBottom:8}}>Premio Acumulado</div>

        <div style={{position:'relative',marginBottom:20}}>
          {tema==='black_friday'&&(
            <div style={{position:'absolute',inset:-20,border:'2px solid rgba(255,0,0,0.4)',borderRadius:20,boxShadow:'0 0 30px rgba(255,0,0,0.3)',animation:'bf-pulse 0.5s ease-in-out infinite'}}></div>
          )}
          <div className="counter">R$ 100.000,00</div>
        </div>

        <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(31,204,106,.08)',border:'1px solid rgba(31,204,106,.3)',borderRadius:20,padding:'6px 16px',fontSize:'clamp(10px,2vw,12px)',fontWeight:700,color:'#1FCC6A',letterSpacing:3,textTransform:'uppercase',marginBottom:24}}>
          <span className="live-dot" style={{width:8,height:8,borderRadius:'50%',background:'#1FCC6A',display:'inline-block'}}></span>
          Atualizando ao vivo • Participe e Concorra
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${temaSel.cor}40`,borderRadius:12,padding:'10px 20px',fontSize:13,color:'rgba(255,255,255,0.6)'}}>
          Tema: <strong style={{color:temaSel.cor}}>{temaSel.nome}</strong> — Visual padrão da Capi da Sorte + elementos do tema
        </div>

      </div>
    </>
  )
}
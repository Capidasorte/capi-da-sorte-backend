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

function hexToRgbInline(hex: string) {
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

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
  ctx.strokeStyle='#CC4400'; ctx.lineWidth=1
  for(let i=0;i<3;i++){
    ctx.beginPath(); ctx.moveTo(-size/4+i*size/6,0); ctx.lineTo(-size/6+i*size/6,size/3); ctx.stroke()
  }
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

export default function PreviewTemaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [tema, setTema] = useState('padrao')
  const [countdown, setCountdown] = useState({h:0,m:0,s:0})

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date(); const vira = new Date(now.getFullYear()+1,0,1)
      const diff = vira.getTime()-now.getTime()
      setCountdown({h:Math.floor(diff/3600000)%24,m:Math.floor(diff/60000)%60,s:Math.floor(diff/1000)%60})
    },1000)
    return ()=>clearInterval(id)
  },[])

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!; let animId: number
    const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight}
    resize(); addEventListener('resize',resize)
    const stars = Array.from({length:150},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.5+0.3,gold:Math.random()>0.78,alpha:Math.random(),tw:Math.random()*0.02+0.005}))
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
    const canvas = overlayRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!; let animId: number; let frame = 0
    const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight}
    resize(); addEventListener('resize',resize)

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

    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height); frame++

      if(tema==='natal'){
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

      if(tema==='ano_novo'){
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

      if(tema==='carnaval'){
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
        petalas.forEach(p=>{
          p.y+=p.speed*0.5; p.swingPos+=0.015; p.x+=Math.sin(p.swingPos)*p.swing
          if(p.y>canvas.height){p.y=-20;p.x=Math.random()*canvas.width}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*0.7,0,Math.PI*2)
          ctx.fillStyle='rgba(220,20,60,0.3)'; ctx.fill()
        })
      }

      if(tema==='pais'){
        for(let i=0;i<5;i++){
          const x=canvas.width*0.1+canvas.width*0.2*i
          const y=70+Math.sin(frame*0.02+i*1.2)*15
          drawGravata(ctx,x,y,0.8)
        }
      }

      if(tema==='pascoa'){
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

      if(tema==='black_friday'){
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
        ctx.strokeStyle=`rgba(255,80,0,${bAlpha*0.6})`; ctx.lineWidth=2
        ctx.strokeRect(20,20,canvas.width-40,canvas.height-40)
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
        .bf-text{font-family:'Bebas Neue',cursive;font-size:clamp(28px,6vw,52px);letter-spacing:6px;background:linear-gradient(135deg,#FF0000,#FF4500,#FF0000);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:bf-pulse 0.6s ease-in-out infinite;filter:drop-shadow(0 0 20px rgba(255,0,0,0.8))}
        @keyframes bf-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        .bf-preco{font-family:'Bebas Neue',cursive;font-size:clamp(14px,3vw,22px);color:#FF4500;letter-spacing:2px;animation:bf-pulse 0.8s ease-in-out infinite}
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

        {tema==='natal'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(24px,5vw,42px)',color:'#CC0000',textShadow:'0 0 20px rgba(204,0,0,0.8)',letterSpacing:3,marginBottom:16}}>Feliz Natal</div>}
        {tema==='ano_novo'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(24px,5vw,42px)',color:'#FFD700',textShadow:'0 0 20px rgba(255,215,0,0.8)',letterSpacing:3,marginBottom:8}}>Feliz {new Date().getFullYear()+1}</div>}
        {tema==='black_friday'&&(
          <div style={{marginBottom:16}}>
            <div className="bf-text">Black Friday</div>
            <div className="bf-preco">Ofertas Imperdíveis • Garanta Agora</div>
          </div>
        )}
        {tema==='aniversario'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(24px,5vw,42px)',color:'#FF8C00',textShadow:'0 0 20px rgba(255,140,0,0.8)',letterSpacing:3,marginBottom:16}}>Feliz Aniversário</div>}
        {tema==='maes'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(22px,4vw,36px)',color:'#FF69B4',textShadow:'0 0 15px rgba(255,105,180,0.6)',letterSpacing:2,marginBottom:16}}>Feliz Dia das Mães</div>}
        {tema==='namorados'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(22px,4vw,36px)',color:'#FF0044',textShadow:'0 0 15px rgba(255,0,68,0.6)',letterSpacing:2,marginBottom:16}}>Feliz Dia dos Namorados</div>}
        {tema==='pais'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(22px,4vw,36px)',color:'#1E90FF',textShadow:'0 0 15px rgba(30,144,255,0.6)',letterSpacing:2,marginBottom:16}}>Feliz Dia dos Pais</div>}
        {tema==='pascoa'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(22px,4vw,36px)',color:'#9ACD32',textShadow:'0 0 15px rgba(154,205,50,0.6)',letterSpacing:2,marginBottom:16}}>Feliz Páscoa</div>}
        {tema==='carnaval'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(24px,5vw,42px)',background:'linear-gradient(135deg,#FF0044,#FFD700,#9B00FF,#00FF88)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:4,marginBottom:16}}>Carnaval</div>}

        {tema==='ano_novo'&&(
          <div style={{display:'flex',gap:12,alignItems:'flex-end',justifyContent:'center',marginBottom:20,background:'rgba(255,215,0,0.05)',border:'1px solid rgba(255,215,0,0.2)',borderRadius:16,padding:'14px 24px'}}>
            {[{v:countdown.h,l:'horas'},{v:countdown.m,l:'min'},{v:countdown.s,l:'seg'}].map((c,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(32px,7vw,52px)',color:'#FFD700',filter:'drop-shadow(0 0 10px rgba(255,215,0,0.6))'}}>{pad(c.v)}</div>
                <div style={{fontSize:9,color:'#C0C0C0',letterSpacing:2,textTransform:'uppercase',fontWeight:700}}>{c.l}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{fontFamily:"'Barlow',sans-serif",fontSize:'clamp(12px,2.5vw,16px)',fontWeight:700,letterSpacing:5,textTransform:'uppercase',color:'#7A8BB0',marginBottom:8}}>Premio Acumulado</div>

        <div style={{position:'relative',marginBottom:20}}>
          {tema==='black_friday'&&(
            <>
              <div style={{position:'absolute',inset:-24,border:'3px solid rgba(255,0,0,0.5)',borderRadius:20,boxShadow:'0 0 40px rgba(255,0,0,0.4),inset 0 0 40px rgba(255,0,0,0.1)',animation:'bf-pulse 0.6s ease-in-out infinite'}}></div>
              <div style={{position:'absolute',inset:-12,border:'1px solid rgba(255,69,0,0.3)',borderRadius:16}}></div>
            </>
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
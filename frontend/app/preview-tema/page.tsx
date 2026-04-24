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
    const sy=y-size*0.3-size*0.25*i
    const sw=size*(0.8-i*0.15)
    ctx.beginPath()
    ctx.moveTo(x,sy-size*0.35)
    ctx.lineTo(x-sw/2,sy)
    ctx.lineTo(x+sw/2,sy)
    ctx.closePath()
    ctx.fillStyle=cores[i]+'cc'; ctx.fill()
  }
  const lc=['#FF0000','#FFD700','#00FF00','#0000FF','#FF6B00','#FF69B4']
  for(let i=0;i<14;i++){
    const angle=Math.random()*Math.PI*2
    const r=Math.random()*size*0.35
    const lx=x+Math.cos(angle)*r
    const ly=y-size*0.3+Math.sin(angle)*r*0.5-size*0.1
    ctx.beginPath(); ctx.arc(lx,ly,3,0,Math.PI*2)
    ctx.fillStyle=lc[i%lc.length]
    ctx.shadowColor=lc[i%lc.length]; ctx.shadowBlur=8
    ctx.fill(); ctx.shadowBlur=0
  }
}

function drawTreno(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, frame: number) {
  ctx.save(); ctx.translate(x,y+Math.sin(frame*0.03)*5); ctx.scale(scale,scale)
  // RENAS
  for(let i=0;i<3;i++){
    const rx=-160+i*55
    ctx.fillStyle='#8B4513'
    ctx.beginPath(); ctx.ellipse(rx,10,18,10,0,0,Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(rx,0,7,14,0,0,Math.PI*2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(rx-5,-12,5,4,0,0,Math.PI*2)
    ctx.fillStyle='#A0522D'; ctx.fill()
    // CHIFRES
    ctx.strokeStyle='#8B4513'; ctx.lineWidth=2
    ctx.beginPath(); ctx.moveTo(rx-5,-14); ctx.lineTo(rx-12,-24); ctx.lineTo(rx-8,-20); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(rx-5,-14); ctx.lineTo(rx-2,-22); ctx.stroke()
    if(i===0){
      ctx.beginPath(); ctx.arc(rx,-14,4,0,Math.PI*2)
      ctx.fillStyle='#FF3333'; ctx.fill()
      ctx.shadowColor='#FF0000'; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0
    }
  }
  // CORDAS
  ctx.strokeStyle='rgba(139,69,19,0.6)'; ctx.lineWidth=1.5
  for(let i=0;i<3;i++){
    ctx.beginPath(); ctx.moveTo(-160+i*55,10); ctx.lineTo(-30,5); ctx.stroke()
  }
  // TRENÓ
  ctx.fillStyle='#CC0000'
  ctx.beginPath()
  ctx.roundRect(-30,-20,80,30,8)
  ctx.fill()
  ctx.fillStyle='#AA0000'
  ctx.beginPath(); ctx.roundRect(-25,-15,70,20,6); ctx.fill()
  // RUNNERS
  ctx.strokeStyle='#888'; ctx.lineWidth=3
  ctx.beginPath(); ctx.moveTo(-35,12); ctx.lineTo(55,12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-30,12); ctx.bezierCurveTo(-40,12,-45,18,-35,18); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(50,12); ctx.bezierCurveTo(60,12,65,18,55,18); ctx.stroke()
  // PAPAI NOEL
  ctx.fillStyle='#CC0000'
  ctx.beginPath(); ctx.ellipse(5,-35,14,18,0,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FFD5B0'
  ctx.beginPath(); ctx.arc(5,-46,10,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.ellipse(5,-56,6,4,0,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(5,-36,10,0,Math.PI)
  ctx.fillStyle='white'; ctx.fill()
  // SACO
  ctx.fillStyle='#8B4513'
  ctx.beginPath(); ctx.ellipse(20,-42,10,14,0.3,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawPresente(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cor: string) {
  ctx.fillStyle=cor
  ctx.fillRect(x-size/2,y-size/2,size,size)
  ctx.strokeStyle='gold'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(x,y-size/2); ctx.lineTo(x,y+size/2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x-size/2,y); ctx.lineTo(x+size/2,y); ctx.stroke()
  ctx.strokeStyle='gold'; ctx.lineWidth=1
  ctx.strokeRect(x-size/2,y-size/2,size,size)
  // LAÇO
  ctx.fillStyle='gold'
  ctx.beginPath(); ctx.ellipse(x-5,y-size/2,5,4,-0.5,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(x+5,y-size/2,5,4,0.5,0,Math.PI*2); ctx.fill()
}

function drawMascaraCarnaval(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, cor1: string, cor2: string) {
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale)
  ctx.fillStyle=cor1
  ctx.beginPath()
  ctx.ellipse(-25,0,30,20,0,0,Math.PI*2); ctx.fill()
  ctx.fillStyle=cor2
  ctx.beginPath()
  ctx.ellipse(25,0,30,20,0,0,Math.PI*2); ctx.fill()
  // OLHOS
  ctx.fillStyle='rgba(0,0,0,0.7)'
  ctx.beginPath(); ctx.ellipse(-25,0,12,8,0,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(25,0,12,8,0,0,Math.PI*2); ctx.fill()
  // DECORAÇÃO
  ctx.strokeStyle='gold'; ctx.lineWidth=2
  ctx.beginPath(); ctx.moveTo(-50,0); ctx.lineTo(50,0); ctx.stroke()
  // PLUMAS
  const plumaCores=['#FF0044','#FFD700','#9B00FF','#00FF88']
  for(let i=0;i<8;i++){
    const px=-30+i*8
    ctx.strokeStyle=plumaCores[i%4]; ctx.lineWidth=3
    ctx.beginPath(); ctx.moveTo(px,-20); ctx.lineTo(px,-40+Math.sin(i)*5); ctx.stroke()
    ctx.beginPath(); ctx.arc(px,-42+Math.sin(i)*5,4,0,Math.PI*2)
    ctx.fillStyle=plumaCores[i%4]; ctx.fill()
  }
  // CABO
  ctx.strokeStyle='gold'; ctx.lineWidth=4
  ctx.beginPath(); ctx.moveTo(50,0); ctx.lineTo(80,20); ctx.stroke()
  ctx.restore()
}

function drawCoelhoRodape(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, salto: number) {
  ctx.save(); ctx.translate(x,y-salto); ctx.scale(scale,scale)
  // CORPO
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.ellipse(0,0,18,22,0,0,Math.PI*2); ctx.fill()
  // CABEÇA
  ctx.beginPath(); ctx.arc(0,-28,14,0,Math.PI*2); ctx.fill()
  // ORELHAS
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.ellipse(-8,-48,5,16,-.2,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,-48,5,16,.2,0,Math.PI*2); ctx.fill()
  ctx.fillStyle='#FFB6C1'
  ctx.beginPath(); ctx.ellipse(-8,-48,2.5,12,-.2,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(8,-48,2.5,12,.2,0,Math.PI*2); ctx.fill()
  // OLHOS
  ctx.fillStyle='#333'
  ctx.beginPath(); ctx.arc(-5,-30,2.5,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(5,-30,2.5,0,Math.PI*2); ctx.fill()
  // NARIZ
  ctx.fillStyle='#FF69B4'
  ctx.beginPath(); ctx.arc(0,-24,2,0,Math.PI*2); ctx.fill()
  // RABO
  ctx.fillStyle='white'
  ctx.beginPath(); ctx.arc(0,20,6,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

function drawOvoPascoa(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, cor: string, rot: number) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(rot)
  ctx.beginPath(); ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2)
  ctx.fillStyle=cor+'cc'; ctx.fill()
  ctx.strokeStyle=cor; ctx.lineWidth=2; ctx.stroke()
  // DECORAÇÃO
  ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.ellipse(0,0,rx*0.6,ry*0.4,0,0,Math.PI*2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(-rx,0); ctx.lineTo(rx,0); ctx.stroke()
  ctx.restore()
}

function drawBoloAniversario(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  // BASE DO BOLO
  ctx.fillStyle='#D2691E'
  ctx.beginPath(); ctx.roundRect(x-50,y-20,100,40,8); ctx.fill()
  // CAMADA MEIO
  ctx.fillStyle='#FF69B4'
  ctx.beginPath(); ctx.roundRect(x-40,y-50,80,32,6); ctx.fill()
  // CAMADA TOPO
  ctx.fillStyle='#FF1493'
  ctx.beginPath(); ctx.roundRect(x-30,y-75,60,27,5); ctx.fill()
  // COBERTURA BRANCA
  ctx.fillStyle='white'
  for(let i=0;i<5;i++){
    ctx.beginPath()
    ctx.arc(x-40+i*20,y-50,8,0,Math.PI)
    ctx.fill()
  }
  for(let i=0;i<4;i++){
    ctx.beginPath()
    ctx.arc(x-30+i*20,y-75,6,0,Math.PI)
    ctx.fill()
  }
  // BOLINHAS DECORATIVAS
  const cores=['#FFD700','#FF0044','#9B00FF','#00FF88']
  for(let i=0;i<6;i++){
    ctx.beginPath(); ctx.arc(x-40+i*16,y-35,4,0,Math.PI*2)
    ctx.fillStyle=cores[i%4]; ctx.fill()
  }
  // VELAS
  const velasCores=['#FF0044','#FFD700','#9B00FF','#00FF88','#FF6B00']
  for(let i=0;i<5;i++){
    const vx=x-32+i*16
    const vy=y-75
    ctx.fillStyle=velasCores[i]
    ctx.fillRect(vx-3,vy-18,6,18)
    // CHAMA
    const chamaFlicker=Math.sin(frame*0.2+i)*3
    ctx.fillStyle='#FFD700'
    ctx.beginPath()
    ctx.ellipse(vx,vy-20+chamaFlicker,3,6,0,0,Math.PI*2)
    ctx.fill()
    ctx.fillStyle='#FF6600'
    ctx.beginPath()
    ctx.ellipse(vx,vy-19+chamaFlicker,2,4,0,0,Math.PI*2)
    ctx.fill()
    // BRILHO
    ctx.shadowColor='#FFD700'; ctx.shadowBlur=10+chamaFlicker*2
    ctx.beginPath(); ctx.arc(vx,vy-22+chamaFlicker,2,0,Math.PI*2)
    ctx.fillStyle='white'; ctx.fill(); ctx.shadowBlur=0
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
  ctx.lineTo(0,55); ctx.lineTo(15,40); ctx.lineTo(10,-10); ctx.closePath(); ctx.fill()
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
  while(cy<h){ cy+=Math.random()*40+20; cx+=Math.random()*40-20; ctx.lineTo(cx,cy) }
  ctx.stroke(); ctx.shadowBlur=0
}

function criarFogoDourado(canvas: HTMLCanvasElement) {
  const x=Math.random()*canvas.width
  const y=Math.random()*canvas.height*0.6
  const cor=['#FFD700','#C0C0C0','#FFF8DC','#FFFACD','#E8E8E8'][Math.floor(Math.random()*5)]
  return {
    vida:100,
    particulas:Array.from({length:60},()=>({
      x,y,
      vx:(Math.random()-0.5)*12,
      vy:(Math.random()-0.5)*12,
      alpha:1,cor,
      r:Math.random()*2.5+0.5
    }))
  }
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
    const confetes = Array.from({length:80},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,w:Math.random()*10+4,h:Math.random()*6+2,speed:Math.random()*3+1,cor:['#FFD700','#C0C0C0','#FFF8DC','#E8E8E8','#FFFACD'][Math.floor(Math.random()*5)],rot:Math.random()*360,rotSpeed:Math.random()*4-2}))
    const confetesCarnaval = Array.from({length:80},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,w:Math.random()*10+4,h:Math.random()*6+2,speed:Math.random()*3+1,cor:['#FF0044','#9B00FF','#FFD700','#00FF88','#FF6B00','#00BFFF'][Math.floor(Math.random()*6)],rot:Math.random()*360,rotSpeed:Math.random()*4-2}))
    const petalas = Array.from({length:50},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,r:Math.random()*8+3,speed:Math.random()*2+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const baloes = Array.from({length:15},()=>({x:Math.random()*innerWidth,y:innerHeight+Math.random()*200,r:Math.random()*25+15,speed:Math.random()*1.5+0.3,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2,cor:['#FF0044','#FFD700','#9B00FF','#00FF88','#FF6B00','#00BFFF','#FF69B4'][Math.floor(Math.random()*7)]}))
    const coracoes = Array.from({length:30},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,size:Math.random()*20+8,speed:Math.random()*1.5+0.3,alpha:Math.random()*0.5+0.5,swing:Math.random()*2-1,swingPos:Math.random()*Math.PI*2}))
    const presentes = Array.from({length:15},()=>({x:Math.random()*200+50,y:-Math.random()*300,size:Math.random()*18+10,speed:Math.random()*2+0.5,cor:['#CC0000','#006400','#FFD700','#CC0000','#0000AA'][Math.floor(Math.random()*5)],rot:Math.random()*30-15}))
    const mascaras = Array.from({length:5},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight*0.6+innerHeight*0.1,swing:Math.random()*20-10,swingPos:Math.random()*Math.PI*2,scale:Math.random()*0.4+0.4,cor1:['#FF0044','#9B00FF','#FFD700','#00BFFF'][Math.floor(Math.random()*4)],cor2:['#FF6B00','#00FF88','#FF69B4','#CC0000'][Math.floor(Math.random()*4)]}))
    const coelhos = Array.from({length:5},()=>({x:innerWidth*0.1+Math.random()*innerWidth*0.8,salto:0,saltoDir:1,saltoMax:Math.random()*40+20,scale:Math.random()*0.4+0.5}))
    const ovosPascoa = Array.from({length:25},()=>({x:Math.random()*innerWidth,y:-Math.random()*innerHeight,speed:Math.random()*1+0.3,rx:Math.random()*20+10,ry:Math.random()*28+14,cor:['#FF69B4','#9ACD32','#FFD700','#00BFFF','#FF6B00','#DDA0DD'][Math.floor(Math.random()*6)],rot:Math.random()*360,rotSpeed:Math.random()*2-1}))
    const fogosDourados: any[] = []
    let fogoTimer = 0
    const raiosAtivos: any[] = []
    let raioTimer = 0
    const particulas_bf: any[] = []

    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      frame++

      // ===== NATAL =====
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
          if(p.y>canvas.height){p.y=-30;p.x=Math.random()*200+50}
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180)
          drawPresente(ctx,0,0,p.size,p.cor)
          ctx.restore()
        })
        const trenoX=canvas.width*0.18
        const trenoY=canvas.height*0.35
        drawTreno(ctx,trenoX,trenoY,0.9,frame)
      }

      // ===== ANO NOVO =====
      if(tema==='ano_novo'){
        confetes.forEach(c=>{
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

      // ===== CARNAVAL =====
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
        mascaras.forEach(m=>{
          m.swingPos+=0.02
          const my=m.y+Math.sin(m.swingPos)*m.swing
          drawMascaraCarnaval(ctx,m.x,my,m.scale,m.cor1,m.cor2)
        })
      }

      // ===== DIA DAS MÃES =====
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

      // ===== NAMORADOS =====
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

      // ===== DIA DOS PAIS =====
      if(tema==='pais'){
        for(let i=0;i<5;i++){
          const x=canvas.width*0.1+canvas.width*0.2*i
          const y=70+Math.sin(frame*0.02+i*1.2)*15
          drawGravata(ctx,x,y,0.8)
        }
        const bigStars=[...Array(15)].map((_,i)=>({x:canvas.width*0.05+canvas.width*0.065*i,y:canvas.height*0.08+Math.sin(frame*0.025+i)*25}))
        bigStars.forEach(s=>{
          ctx.beginPath(); ctx.arc(s.x,s.y,3,0,Math.PI*2)
          ctx.fillStyle=`rgba(245,168,0,${0.5+Math.sin(frame*0.05)*0.3})`
          ctx.shadowColor='#F5A800'; ctx.shadowBlur=8
          ctx.fill(); ctx.shadowBlur=0
        })
      }

      // ===== PÁSCOA =====
      if(tema==='pascoa'){
        ovosPascoa.forEach(o=>{
          o.y+=o.speed; o.rot+=o.rotSpeed
          if(o.y>canvas.height){o.y=-40;o.x=Math.random()*canvas.width}
          drawOvoPascoa(ctx,o.x,o.y,o.rx,o.ry,o.cor,o.rot*Math.PI/180)
        })
        coelhos.forEach(c=>{
          c.salto+=c.saltoDir*3
          if(c.salto>=c.saltoMax||c.salto<=0) c.saltoDir*=-1
          drawCoelhoRodape(ctx,c.x,canvas.height-40,c.scale,Math.abs(c.salto))
        })
      }

      // ===== BLACK FRIDAY =====
      if(tema==='black_friday'){
        raioTimer++
        if(raioTimer>30){
          raioTimer=0
          raiosAtivos.push({x:Math.random()*canvas.width,life:15,alpha:1})
          drawRaio(ctx,Math.random()*canvas.width,canvas.height)
        }
        // NÉVOA VERMELHA NOS CANTOS
        const grad=ctx.createRadialGradient(0,0,0,0,0,300)
        grad.addColorStop(0,`rgba(255,0,0,${0.15+Math.sin(frame*0.05)*0.05})`)
        grad.addColorStop(1,'transparent')
        ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height)
        const grad2=ctx.createRadialGradient(canvas.width,canvas.height,0,canvas.width,canvas.height,300)
        grad2.addColorStop(0,`rgba(255,0,0,${0.15+Math.sin(frame*0.05)*0.05})`)
        grad2.addColorStop(1,'transparent')
        ctx.fillStyle=grad2; ctx.fillRect(0,0,canvas.width,canvas.height)
        // BORDAS NEON PULSANDO
        const bAlpha=0.4+Math.sin(frame*0.15)*0.3
        ctx.shadowColor='#FF0000'; ctx.shadowBlur=20
        ctx.strokeStyle=`rgba(255,0,0,${bAlpha})`; ctx.lineWidth=5
        ctx.strokeRect(8,8,canvas.width-16,canvas.height-16)
        ctx.strokeStyle=`rgba(255,80,0,${bAlpha*0.6})`; ctx.lineWidth=2
        ctx.strokeRect(20,20,canvas.width-40,canvas.height-40)
        ctx.shadowBlur=0
        // PARTÍCULAS VERMELHAS
        if(frame%3===0){
          particulas_bf.push({
            x:Math.random()*canvas.width,y:canvas.height+10,
            vx:(Math.random()-0.5)*2,vy:-(Math.random()*3+1),
            alpha:1,size:Math.random()*3+1
          })
        }
        for(let i=particulas_bf.length-1;i>=0;i--){
          const p=particulas_bf[i]
          p.x+=p.vx; p.y+=p.vy; p.alpha-=0.01
          if(p.alpha<=0||p.y<-10){particulas_bf.splice(i,1);continue}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
          ctx.fillStyle=`rgba(255,30,0,${p.alpha})`
          ctx.shadowColor='#FF0000'; ctx.shadowBlur=6
          ctx.fill(); ctx.shadowBlur=0
        }
      }

      // ===== ANIVERSÁRIO =====
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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&family=Great+Vibes&display=swap');
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
        .aniv-text{font-family:'Great Vibes',cursive;font-size:clamp(32px,7vw,60px);background:linear-gradient(135deg,#FFD700,#FF8C00,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:metal-shine 2s linear infinite;background-size:200% auto;filter:drop-shadow(0 0 15px rgba(255,140,0,0.6))}
        .natal-text{font-family:'Great Vibes',cursive;font-size:clamp(28px,6vw,52px);background:linear-gradient(135deg,#CC0000,#FF4444,#CC0000);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 15px rgba(204,0,0,0.7));animation:metal-shine 3s linear infinite;background-size:200% auto}
        .anovo-text{font-family:'Great Vibes',cursive;font-size:clamp(28px,6vw,52px);background:linear-gradient(135deg,#FFD700,#C0C0C0,#FFD700,#FFF8DC,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:metal-shine 2s linear infinite;background-size:300% auto;filter:drop-shadow(0 0 15px rgba(255,215,0,0.7))}
        .countdown-num{font-family:'Bebas Neue',cursive;font-size:clamp(32px,7vw,52px);background:linear-gradient(135deg,#FFD700,#C0C0C0,#FFD700);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 10px rgba(255,215,0,0.6));}
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

        {tema==='natal'&&<div className="natal-text" style={{marginBottom:16}}>Feliz Natal</div>}
        {tema==='ano_novo'&&<div className="anovo-text" style={{marginBottom:8}}>Feliz {new Date().getFullYear()+1}</div>}
        {tema==='black_friday'&&(
          <div style={{marginBottom:16}}>
            <div className="bf-text">Black Friday</div>
            <div className="bf-preco">Ofertas Imperdíveis • Garanta Agora</div>
          </div>
        )}
        {tema==='aniversario'&&<div className="aniv-text" style={{marginBottom:16}}>Feliz Aniversário</div>}
        {tema==='maes'&&<div style={{fontFamily:"'Great Vibes',cursive",fontSize:'clamp(28px,6vw,52px)',background:'linear-gradient(135deg,#FF69B4,#FFB6C1,#FF69B4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',filter:'drop-shadow(0 0 12px rgba(255,105,180,0.6))',marginBottom:16}}>Feliz Dia das Mães</div>}
        {tema==='namorados'&&<div style={{fontFamily:"'Great Vibes',cursive",fontSize:'clamp(28px,6vw,52px)',background:'linear-gradient(135deg,#FF0044,#FF6B6B,#FF0044)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',filter:'drop-shadow(0 0 12px rgba(255,0,68,0.6))',marginBottom:16}}>Feliz Dia dos Namorados</div>}
        {tema==='pais'&&<div style={{fontFamily:"'Great Vibes',cursive",fontSize:'clamp(28px,6vw,52px)',background:'linear-gradient(135deg,#1E90FF,#87CEEB,#1E90FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',filter:'drop-shadow(0 0 12px rgba(30,144,255,0.6))',marginBottom:16}}>Feliz Dia dos Pais</div>}
        {tema==='pascoa'&&<div style={{fontFamily:"'Great Vibes',cursive",fontSize:'clamp(28px,6vw,52px)',background:'linear-gradient(135deg,#9ACD32,#ADFF2F,#9ACD32)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',filter:'drop-shadow(0 0 12px rgba(154,205,50,0.6))',marginBottom:16}}>Feliz Páscoa</div>}
        {tema==='carnaval'&&<div style={{fontFamily:"'Bebas Neue',cursive",fontSize:'clamp(28px,6vw,48px)',background:'linear-gradient(135deg,#FF0044,#FFD700,#9B00FF,#00FF88)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:4,marginBottom:16,filter:'drop-shadow(0 0 12px rgba(155,0,255,0.5))'}}>Carnaval</div>}

        {tema==='ano_novo'&&(
          <div style={{display:'flex',gap:12,alignItems:'flex-end',justifyContent:'center',marginBottom:20,background:'rgba(255,215,0,0.05)',border:'1px solid rgba(255,215,0,0.2)',borderRadius:16,padding:'14px 24px'}}>
            {[{v:countdown.h,l:'horas'},{v:countdown.m,l:'min'},{v:countdown.s,l:'seg'}].map((c,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div className="countdown-num">{pad(c.v)}</div>
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
          {tema==='aniversario'&&(
            <div style={{position:'absolute',top:-160,left:'50%',transform:'translateX(-50%)'}}>
              <BoloCana frame={0}/>
            </div>
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

function BoloCana({frame}: {frame: number}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    let f = 0
    const draw=()=>{
      ctx.clearRect(0,0,120,120)
      drawBoloAniversario(ctx,60,100,f)
      f++; animId=requestAnimationFrame(draw)
    }
    draw()
    return()=>cancelAnimationFrame(animId)
  },[])
  return <canvas ref={canvasRef} width={120} height={120} style={{display:'block'}}/>
}
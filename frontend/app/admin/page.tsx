// PAINEL ADMIN — CAPI DA SORTE
'use client'
import { useEffect, useRef, useState } from 'react'

interface Campanha {
  id: string; nome: string; total_cotas: number; cotas_vendidas: number
  premio_inicial: number; incremento_por_cota: number; status: string
  limite_cotas_por_cpf: number; tempo_reserva_minutos: number
}
interface Transacao {
  id: string; user_nome: string; user_email: string
  quantidade_cotas: number; valor: number; status: string; created_at: string
}
interface Usuario {
  id: string; nome: string; email: string; telefone: string
  created_at: string; ativo: boolean
}
interface CaixaPremiada {
  id: number; premio: string; tipo: 'dinheiro' | 'bilhetes'; revelada: boolean
  ganhador: string; data_revelacao: string
}

const ADMIN_PASSWORD = 'CapiAdmin@2026'

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
]

type Aba = 'dashboard'|'transacoes'|'usuarios'|'financeiro'|'sorteios'|'pacotes'|'campanha'|'caixas'|'logs'|'tema'

export default function Admin() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [auth, setAuth] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [aba, setAba] = useState<Aba>('dashboard')
  const [campanha, setCampanha] = useState<Campanha|null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [temaSelecionado, setTemaSelecionado] = useState('padrao')
  const [msgSalvo, setMsgSalvo] = useState('')
  const [pacotes, setPacotes] = useState([
    { qty:1, valor:'4.99' },
    { qty:5, valor:'22.00' },
    { qty:10, valor:'40.00' },
    { qty:20, valor:'70.00' },
  ])
  const [sorteios, setSorteios] = useState([
    { ordem:'1º Sorteio', data:'2026-04-15', premio:'500', status:'realizado', ganhador:'---' },
    { ordem:'2º Sorteio', data:'2026-04-20', premio:'800', status:'realizado', ganhador:'---' },
    { ordem:'3º Sorteio', data:'2026-04-26', premio:'1200', status:'pendente', ganhador:'' },
    { ordem:'Sorteio Principal', data:'2026-04-30', premio:'', status:'pendente', ganhador:'' },
  ])
  const [caixas, setCaixas] = useState<CaixaPremiada[]>([
    { id:1, premio:'R$ 50,00', tipo:'dinheiro', revelada:false, ganhador:'', data_revelacao:'' },
    { id:2, premio:'R$ 100,00', tipo:'dinheiro', revelada:false, ganhador:'', data_revelacao:'' },
    { id:3, premio:'10 Bilhetes', tipo:'bilhetes', revelada:false, ganhador:'', data_revelacao:'' },
    { id:4, premio:'R$ 25,00', tipo:'dinheiro', revelada:false, ganhador:'', data_revelacao:'' },
    { id:5, premio:'R$ 200,00', tipo:'dinheiro', revelada:false, ganhador:'', data_revelacao:'' },
  ])
  const [novaCaixa, setNovaCaixa] = useState({ premio:'', tipo:'dinheiro' })
  const [totalCaixasCampanha, setTotalCaixasCampanha] = useState('10')
  const [editCampanha, setEditCampanha] = useState({ limite_cotas_por_cpf:'200', tempo_reserva_minutos:'30' })

  // STARS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight }
    resize(); addEventListener('resize',resize)
    const stars = Array.from({length:100},()=>({
      x:Math.random()*innerWidth, y:Math.random()*innerHeight,
      r:Math.random()*1.2+0.2, gold:Math.random()>0.8,
      alpha:Math.random(), tw:Math.random()*0.005+0.002
    }))
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      stars.forEach(s=>{
        s.alpha+=s.tw; if(s.alpha>1||s.alpha<0)s.tw*=-1
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=s.gold?`rgba(245,168,0,${Math.abs(s.alpha)})`:`rgba(255,255,255,${Math.abs(s.alpha)*0.3})`
        ctx.fill()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{cancelAnimationFrame(animId); removeEventListener('resize',resize)}
  },[])

  const login = () => {
    if (senha === ADMIN_PASSWORD) { setAuth(true); setErroSenha(false); carregarDados() }
    else setErroSenha(true)
  }

  const carregarDados = async () => {
    setLoading(true)
    try {
      const campRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/campanha-ativa`)
      if (campRes.ok) { const c = await campRes.json(); setCampanha(c) }
      const token = localStorage.getItem('token')
      if (token) {
        const headers = { 'Authorization': `Bearer ${token}` }
        const [txRes, usRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/transacoes`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios`, { headers }),
        ])
        if (txRes.ok) { const d = await txRes.json(); setTransacoes(d.transacoes||[]) }
        if (usRes.ok) { const d = await usRes.json(); setUsuarios(d.usuarios||[]) }
      }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const salvar = (msg: string) => { setMsgSalvo(msg); setTimeout(()=>setMsgSalvo(''),3000) }
  const fv = (v: number) => v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fd = (d: string) => new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})

  const txConfirm = transacoes.filter(t=>t.status==='paid')
  const txPend = transacoes.filter(t=>t.status==='pending')
  const totalArr = txConfirm.reduce((a,t)=>a+parseFloat(String(t.valor)),0)
  const premioAtual = campanha ? parseFloat(String(campanha.premio_inicial))+(campanha.cotas_vendidas*parseFloat(String(campanha.incremento_por_cota))) : 0
  const pct = campanha ? Math.min(100,(campanha.cotas_vendidas/campanha.total_cotas)*100) : 0
  const usuariosFiltrados = usuarios.filter(u=>u.nome?.toLowerCase().includes(busca.toLowerCase())||u.email?.toLowerCase().includes(busca.toLowerCase()))
  const caixasReveladas = caixas.filter(c=>c.revelada).length
  const caixasDisponiveis = caixas.filter(c=>!c.revelada).length

  function hexToRgb(hex: string) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
    return `${r},${g},${b}`
  }

  const adicionarCaixa = () => {
    if (!novaCaixa.premio) return
    const nova: CaixaPremiada = { id: Date.now(), premio: novaCaixa.premio, tipo: novaCaixa.tipo as any, revelada: false, ganhador: '', data_revelacao: '' }
    setCaixas(prev=>[...prev, nova])
    setNovaCaixa({ premio:'', tipo:'dinheiro' })
    salvar('Caixa premiada adicionada!')
  }

  const removerCaixa = (id: number) => setCaixas(prev=>prev.filter(c=>c.id!==id))

  const ABAS_LIST = [
    {id:'dashboard',label:'Dashboard'},
    {id:'transacoes',label:'Transações'},
    {id:'usuarios',label:'Usuários'},
    {id:'financeiro',label:'Financeiro'},
    {id:'sorteios',label:'Sorteios'},
    {id:'pacotes',label:'Pacotes'},
    {id:'campanha',label:'Campanha'},
    {id:'caixas',label:'Caixas Premiadas'},
    {id:'logs',label:'Logs'},
    {id:'tema',label:'Temas'},
  ]

  if (!auth) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{background:#04091C}input{font-family:'Barlow',sans-serif}input::placeholder{color:rgba(255,255,255,0.2)}`}</style>
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Barlow',sans-serif",position:'relative',zIndex:1,padding:16}}>
        <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(245,168,0,0.2)',borderRadius:20,padding:'40px 32px',width:'100%',maxWidth:380,textAlign:'center'}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:'#F5A800',letterSpacing:4,marginBottom:4}}>CAPI DA SORTE</div>
          <div style={{fontSize:11,color:'#7A8BB0',letterSpacing:3,textTransform:'uppercase',marginBottom:32}}>Painel Administrativo</div>
          <input type="password" placeholder="Senha de acesso" value={senha} onChange={e=>setSenha(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={{width:'100%',padding:'14px 16px',borderRadius:10,background:'rgba(255,255,255,0.05)',border:`1px solid ${erroSenha?'#FF3D5A':'rgba(255,255,255,0.1)'}`,color:'#fff',fontSize:15,marginBottom:12,outline:'none'}}/>
          {erroSenha&&<div style={{color:'#FF6B85',fontSize:13,marginBottom:12}}>Senha incorreta</div>}
          <button onClick={login} style={{width:'100%',padding:'14px',borderRadius:10,background:'linear-gradient(135deg,#FFD060,#F5A800,#C88000)',border:'none',color:'#04091C',fontSize:15,fontWeight:700,cursor:'pointer',letterSpacing:2,textTransform:'uppercase'}}>Acessar</button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}body{background:#04091C}
        .tab{cursor:pointer;padding:8px 14px;border-radius:8px;font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border:1px solid transparent;white-space:nowrap;font-family:'Barlow',sans-serif}
        .tab.on{background:rgba(245,168,0,0.15);border-color:rgba(245,168,0,0.4);color:#F5A800}
        .tab.off{color:rgba(255,255,255,0.3)}
        .tab.off:hover{color:rgba(255,255,255,0.6)}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-bottom:12px}
        .row{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px 16px;margin-bottom:8px}
        .inp{width:100%;padding:10px 14px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:14px;outline:none;font-family:'Barlow',sans-serif;margin-top:4px}
        .inp::placeholder{color:rgba(255,255,255,0.2)}
        .sel{width:100%;padding:10px 14px;border-radius:8px;background:#0A1025;border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:14px;outline:none;font-family:'Barlow',sans-serif;margin-top:4px}
        .btn-g{padding:12px 24px;border-radius:8px;background:linear-gradient(135deg,#FFD060,#F5A800,#C88000);border:none;color:#04091C;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:1px;text-transform:uppercase;font-family:'Barlow',sans-serif}
        .btn-s{padding:10px 20px;border-radius:8px;background:rgba(245,168,0,0.1);border:1px solid rgba(245,168,0,0.3);color:#F5A800;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:1px;font-family:'Barlow',sans-serif}
        .btn-r{padding:8px 14px;border-radius:6px;background:rgba(255,61,90,0.1);border:1px solid rgba(255,61,90,0.3);color:#FF3D5A;font-size:12px;font-weight:700;cursor:pointer;font-family:'Barlow',sans-serif}
        .lbl{font-size:10px;color:#7A8BB0;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;font-family:'Barlow',sans-serif}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
      `}</style>

      <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>

      <div style={{minHeight:'100vh',background:'#04091C',fontFamily:"'Barlow',sans-serif",color:'#fff',position:'relative',zIndex:1}}>

        {/* HEADER */}
        <header style={{background:'rgba(4,9,28,0.95)',borderBottom:'1px solid rgba(245,168,0,0.2)',padding:'0 16px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)'}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#F5A800',letterSpacing:3}}>CAPI ADMIN</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#1FCC6A',animation:'blink 1s infinite'}}></div>
            <span style={{fontSize:11,color:'#1FCC6A',fontWeight:700,letterSpacing:1}}>ONLINE</span>
            <button onClick={()=>setAuth(false)} style={{marginLeft:12,background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:6,color:'rgba(255,255,255,0.3)',fontSize:11,fontWeight:700,padding:'5px 10px',cursor:'pointer'}}>SAIR</button>
          </div>
        </header>

        {/* TABS */}
        <div style={{background:'rgba(4,9,28,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'10px 16px',display:'flex',gap:6,overflowX:'auto',position:'sticky',top:60,zIndex:99,backdropFilter:'blur(10px)'}}>
          {ABAS_LIST.map(a=>(
            <div key={a.id} className={`tab ${aba===a.id?'on':'off'}`} onClick={()=>setAba(a.id as Aba)}>{a.label}</div>
          ))}
        </div>

        <div style={{maxWidth:860,margin:'0 auto',padding:'24px 16px 80px'}}>

          {msgSalvo&&<div style={{background:'rgba(31,204,106,0.15)',border:'1px solid rgba(31,204,106,0.4)',borderRadius:10,padding:'12px 16px',color:'#1FCC6A',fontSize:14,fontWeight:700,marginBottom:16,textAlign:'center'}}>{msgSalvo}</div>}

          {/* DASHBOARD */}
          {aba==='dashboard'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Dashboard</div>
              {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:(
                <>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:16}}>
                    {[
                      {lbl:'Premio Atual',val:`R$ ${fv(premioAtual)}`,cor:'#F5A800'},
                      {lbl:'Total Arrecadado',val:`R$ ${fv(totalArr)}`,cor:'#1FCC6A'},
                      {lbl:'Bilhetes Vendidos',val:campanha?.cotas_vendidas.toLocaleString('pt-BR')||'0',cor:'#fff'},
                      {lbl:'Usuários Cadastrados',val:usuarios.length.toString(),cor:'#fff'},
                      {lbl:'Transações Confirmadas',val:txConfirm.length.toString(),cor:'#1FCC6A'},
                      {lbl:'Transações Pendentes',val:txPend.length.toString(),cor:'#F5A800'},
                    ].map((s,i)=>(
                      <div key={i} className="card" style={{textAlign:'center'}}>
                        <div className="lbl">{s.lbl}</div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color:s.cor}}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  {campanha&&(
                    <div className="card">
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                        <span style={{fontSize:13,color:'#7A8BB0',fontWeight:600}}>Progresso da Campanha</span>
                        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#F5A800'}}>{pct.toFixed(2)}%</span>
                      </div>
                      <div style={{height:10,background:'rgba(255,255,255,0.05)',borderRadius:10,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#C88000,#F5A800,#FFD060)',borderRadius:10}}></div>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#7A8BB0',marginTop:6}}>
                        <span>{campanha.cotas_vendidas.toLocaleString('pt-BR')} vendidos</span>
                        <span>{campanha.total_cotas.toLocaleString('pt-BR')} total</span>
                      </div>
                    </div>
                  )}
                  <button className="btn-s" onClick={carregarDados}>Atualizar Dados</button>
                </>
              )}
            </div>
          )}

          {/* TRANSAÇÕES */}
          {aba==='transacoes'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Transações</div>
              {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:
              transacoes.length===0?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Nenhuma transação</div>:
              transacoes.slice(0,100).map((tx,i)=>(
                <div key={i} className="row">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{tx.user_nome||tx.user_email}</div>
                      <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{tx.quantidade_cotas} bilhetes • {fd(tx.created_at)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#F5A800'}}>R$ {fv(parseFloat(String(tx.valor)))}</div>
                      <div style={{display:'inline-block',background:tx.status==='paid'?'rgba(31,204,106,0.15)':'rgba(245,168,0,0.15)',border:`1px solid ${tx.status==='paid'?'rgba(31,204,106,0.4)':'rgba(245,168,0,0.4)'}`,borderRadius:20,padding:'2px 10px',fontSize:10,fontWeight:700,color:tx.status==='paid'?'#1FCC6A':'#F5A800',letterSpacing:1,textTransform:'uppercase',marginTop:4}}>
                        {tx.status==='paid'?'Confirmado':'Pendente'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* USUÁRIOS */}
          {aba==='usuarios'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:16,color:'#F5A800'}}>Usuários</div>
              <input className="inp" placeholder="Buscar por nome ou email..." value={busca} onChange={e=>setBusca(e.target.value)} style={{marginBottom:16}}/>
              <div style={{fontSize:13,color:'#7A8BB0',marginBottom:12}}>{usuariosFiltrados.length} usuário{usuariosFiltrados.length!==1?'s':''} encontrado{usuariosFiltrados.length!==1?'s':''}</div>
              {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:
              usuariosFiltrados.slice(0,50).map((u,i)=>(
                <div key={i} className="row">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{u.nome}</div>
                      <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{u.email}</div>
                      {u.telefone&&<div style={{fontSize:12,color:'#7A8BB0'}}>{u.telefone}</div>}
                      <div style={{fontSize:11,color:'#4A5B7A',marginTop:2}}>Cadastro: {fd(u.created_at)}</div>
                    </div>
                    <div style={{display:'inline-block',background:u.ativo!==false?'rgba(31,204,106,0.15)':'rgba(255,61,90,0.15)',border:`1px solid ${u.ativo!==false?'rgba(31,204,106,0.4)':'rgba(255,61,90,0.4)'}`,borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,color:u.ativo!==false?'#1FCC6A':'#FF3D5A',letterSpacing:1,textTransform:'uppercase'}}>
                      {u.ativo!==false?'Ativo':'Bloqueado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FINANCEIRO */}
          {aba==='financeiro'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Relatório Financeiro</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:20}}>
                {[
                  {lbl:'Total Arrecadado',val:`R$ ${fv(totalArr)}`,cor:'#1FCC6A'},
                  {lbl:'Premio Acumulado',val:`R$ ${fv(premioAtual)}`,cor:'#F5A800'},
                  {lbl:'Transações Confirmadas',val:txConfirm.length.toString(),cor:'#fff'},
                  {lbl:'Ticket Médio',val:txConfirm.length>0?`R$ ${fv(totalArr/txConfirm.length)}`:'—',cor:'#fff'},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{textAlign:'center'}}>
                    <div className="lbl">{s.lbl}</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:s.cor}}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Resumo por Status</div>
                {[
                  {lbl:'Confirmadas',qtd:txConfirm.length,val:totalArr,cor:'#1FCC6A'},
                  {lbl:'Pendentes',qtd:txPend.length,val:txPend.reduce((a,t)=>a+parseFloat(String(t.valor)),0),cor:'#F5A800'},
                ].map((s,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{s.lbl}</div>
                      <div style={{fontSize:12,color:'#7A8BB0'}}>{s.qtd} transaç{s.qtd===1?'ão':'ões'}</div>
                    </div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:s.cor}}>R$ {fv(s.val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SORTEIOS */}
          {aba==='sorteios'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Controle de Sorteios</div>
              {sorteios.map((s,i)=>(
                <div key={i} className="card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2}}>{s.ordem}</div>
                    <div style={{display:'inline-block',background:s.status==='realizado'?'rgba(31,204,106,0.15)':'rgba(245,168,0,0.15)',border:`1px solid ${s.status==='realizado'?'rgba(31,204,106,0.4)':'rgba(245,168,0,0.4)'}`,borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:s.status==='realizado'?'#1FCC6A':'#F5A800',letterSpacing:1,textTransform:'uppercase'}}>
                      {s.status==='realizado'?'Realizado':'Pendente'}
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    <div>
                      <div className="lbl">Data</div>
                      <input className="inp" type="date" value={s.data} onChange={e=>{const n=[...sorteios];n[i].data=e.target.value;setSorteios(n)}}/>
                    </div>
                    <div>
                      <div className="lbl">Prêmio (R$)</div>
                      <input className="inp" placeholder="Valor do prêmio" value={s.premio} onChange={e=>{const n=[...sorteios];n[i].premio=e.target.value;setSorteios(n)}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div className="lbl">Ganhador (nome ou bilhete)</div>
                    <input className="inp" placeholder="Registrar ganhador..." value={s.ganhador} onChange={e=>{const n=[...sorteios];n[i].ganhador=e.target.value;setSorteios(n)}}/>
                  </div>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <button className="btn-g" onClick={()=>salvar(`${s.ordem} salvo!`)}>Salvar</button>
                    {s.status==='pendente'&&(
                      <button className="btn-s" onClick={()=>{const n=[...sorteios];n[i].status='realizado';setSorteios(n);salvar(`${s.ordem} marcado como realizado!`)}}>Marcar como Realizado</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PACOTES */}
          {aba==='pacotes'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Gestão de Pacotes</div>
              <div style={{fontSize:13,color:'#7A8BB0',marginBottom:16}}>Ajuste os valores dos pacotes de bilhetes. As alterações serão aplicadas nas próximas compras.</div>
              {pacotes.map((p,i)=>(
                <div key={i} className="card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:'#fff',letterSpacing:1}}>{p.qty} bilhete{p.qty>1?'s':''}</div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div>
                        <div className="lbl">Valor (R$)</div>
                        <input className="inp" style={{width:120}} value={p.valor} onChange={e=>{const n=[...pacotes];n[i].valor=e.target.value;setPacotes(n)}}/>
                      </div>
                      <button className="btn-g" style={{marginTop:20}} onClick={()=>salvar(`Pacote de ${p.qty} bilhete${p.qty>1?'s':''} atualizado!`)}>Salvar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CAMPANHA */}
          {aba==='campanha'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Configurações da Campanha</div>
              {campanha?(
                <>
                  <div className="card" style={{marginBottom:16}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Informações Atuais</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      {[
                        {lbl:'Nome',val:campanha.nome},
                        {lbl:'Status',val:campanha.status},
                        {lbl:'Total de Bilhetes',val:campanha.total_cotas.toLocaleString('pt-BR')},
                        {lbl:'Bilhetes Vendidos',val:campanha.cotas_vendidas.toLocaleString('pt-BR')},
                        {lbl:'Prêmio Inicial',val:`R$ ${fv(parseFloat(String(campanha.premio_inicial)))}`},
                        {lbl:'Incremento',val:`R$ ${fv(parseFloat(String(campanha.incremento_por_cota)))} por bilhete`},
                        {lbl:'Prêmio Atual',val:`R$ ${fv(premioAtual)}`},
                        {lbl:'Progresso',val:`${pct.toFixed(2)}%`},
                      ].map((item,i)=>(
                        <div key={i}>
                          <div className="lbl">{item.lbl}</div>
                          <div style={{fontSize:14,color:'#fff',fontWeight:600}}>{item.val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Configurações Editáveis</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                      <div>
                        <div className="lbl">Limite por CPF</div>
                        <input className="inp" type="number" value={editCampanha.limite_cotas_por_cpf} onChange={e=>setEditCampanha(p=>({...p,limite_cotas_por_cpf:e.target.value}))}/>
                      </div>
                      <div>
                        <div className="lbl">Tempo de Reserva (min)</div>
                        <input className="inp" type="number" value={editCampanha.tempo_reserva_minutos} onChange={e=>setEditCampanha(p=>({...p,tempo_reserva_minutos:e.target.value}))}/>
                      </div>
                    </div>
                    <button className="btn-g" onClick={()=>salvar('Configurações salvas!')}>Salvar Configurações</button>
                  </div>
                </>
              ):<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Nenhuma campanha ativa</div>}
            </div>
          )}

          {/* CAIXAS PREMIADAS */}
          {aba==='caixas'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:8,color:'#F5A800'}}>Caixas Premiadas</div>
              <div style={{fontSize:13,color:'#7A8BB0',marginBottom:20}}>Uma caixa por compra. O sistema distribui aleatoriamente os prêmios ao longo da campanha.</div>

              {/* STATS CAIXAS */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                {[
                  {lbl:'Total de Caixas',val:caixas.length.toString(),cor:'#fff'},
                  {lbl:'Reveladas',val:caixasReveladas.toString(),cor:'#1FCC6A'},
                  {lbl:'Disponíveis',val:caixasDisponiveis.toString(),cor:'#F5A800'},
                ].map((s,i)=>(
                  <div key={i} className="card" style={{textAlign:'center'}}>
                    <div className="lbl">{s.lbl}</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:s.cor}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* ADICIONAR CAIXA */}
              <div className="card" style={{marginBottom:20}}>
                <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Adicionar Caixa Premiada</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  <div>
                    <div className="lbl">Prêmio</div>
                    <input className="inp" placeholder="Ex: R$ 50,00 ou 10 Bilhetes" value={novaCaixa.premio} onChange={e=>setNovaCaixa(p=>({...p,premio:e.target.value}))}/>
                  </div>
                  <div>
                    <div className="lbl">Tipo</div>
                    <select className="sel" value={novaCaixa.tipo} onChange={e=>setNovaCaixa(p=>({...p,tipo:e.target.value}))}>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="bilhetes">Bilhetes Bônus</option>
                    </select>
                  </div>
                </div>
                <button className="btn-g" onClick={adicionarCaixa}>Adicionar Caixa</button>
              </div>

              {/* LISTA DE CAIXAS */}
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2,marginBottom:12}}>Caixas Cadastradas</div>
              {caixas.map((c,i)=>(
                <div key={i} className="row">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      {/* CAIXA ICON */}
                      <div style={{width:40,height:40,borderRadius:8,background:c.revelada?'rgba(31,204,106,0.1)':'rgba(245,168,0,0.1)',border:`1px solid ${c.revelada?'rgba(31,204,106,0.3)':'rgba(245,168,0,0.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                        {c.revelada?'📦':'🎁'}
                      </div>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{c.premio}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{c.tipo==='dinheiro'?'Dinheiro':'Bilhetes Bônus'}</div>
                        {c.revelada&&c.ganhador&&<div style={{fontSize:12,color:'#1FCC6A',marginTop:2}}>Ganhador: {c.ganhador}</div>}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <div style={{display:'inline-block',background:c.revelada?'rgba(31,204,106,0.15)':'rgba(245,168,0,0.15)',border:`1px solid ${c.revelada?'rgba(31,204,106,0.4)':'rgba(245,168,0,0.4)'}`,borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,color:c.revelada?'#1FCC6A':'#F5A800',letterSpacing:1,textTransform:'uppercase'}}>
                        {c.revelada?'Revelada':'Disponível'}
                      </div>
                      {!c.revelada&&<button className="btn-r" onClick={()=>removerCaixa(c.id)}>Remover</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LOGS */}
          {aba==='logs'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:20,color:'#F5A800'}}>Logs do Sistema</div>
              <div style={{fontSize:13,color:'#7A8BB0',marginBottom:16}}>Registro de todas as ações realizadas na plataforma.</div>
              {[
                {action:'compra_iniciada',user:'marcos@email.com',ip:'189.x.x.x',detalhe:'5 bilhetes • R$ 22,00',data:'23/04/2026 14:32'},
                {action:'pagamento_confirmado',user:'marcos@email.com',ip:'189.x.x.x',detalhe:'PIX confirmado • R$ 22,00',data:'23/04/2026 14:33'},
                {action:'cadastro',user:'joao@email.com',ip:'200.x.x.x',detalhe:'Novo usuário cadastrado',data:'23/04/2026 13:10'},
                {action:'login',user:'maria@email.com',ip:'177.x.x.x',detalhe:'Login realizado',data:'23/04/2026 12:55'},
              ].map((l,i)=>(
                <div key={i} className="row">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                    <div>
                      <div style={{display:'inline-block',background:'rgba(245,168,0,0.1)',border:'1px solid rgba(245,168,0,0.2)',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700,color:'#F5A800',letterSpacing:1,textTransform:'uppercase',marginBottom:6}}>{l.action}</div>
                      <div style={{fontSize:13,color:'#fff',fontWeight:600}}>{l.user}</div>
                      <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{l.detalhe} • IP: {l.ip}</div>
                    </div>
                    <div style={{fontSize:12,color:'#4A5B7A'}}>{l.data}</div>
                  </div>
                </div>
              ))}
              <div style={{textAlign:'center',padding:20,color:'#4A5B7A',fontSize:13}}>Os logs reais serão carregados quando a rota /admin/logs estiver ativa</div>
            </div>
          )}

          {/* TEMAS */}
          {aba==='tema'&&(
            <div>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:2,marginBottom:8,color:'#F5A800'}}>Temas Visuais</div>
              <div style={{fontSize:13,color:'#7A8BB0',marginBottom:24}}>Elementos decorativos adicionados sobre o visual padrão da Capi da Sorte.</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
                {TEMAS.map(t=>(
                  <div key={t.id} onClick={()=>setTemaSelecionado(t.id)} style={{cursor:'pointer',borderRadius:12,padding:16,border:`2px solid ${temaSelecionado===t.id?t.cor:'rgba(255,255,255,0.08)'}`,background:temaSelecionado===t.id?`rgba(${hexToRgb(t.cor)},0.15)`:'rgba(255,255,255,0.03)',textAlign:'center',transition:'all .2s'}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:t.cor,margin:'0 auto 10px',boxShadow:`0 0 12px ${t.cor}60`}}></div>
                    <div style={{fontSize:11,fontWeight:700,color:temaSelecionado===t.id?'#fff':'#7A8BB0',letterSpacing:1,textTransform:'uppercase'}}>{t.nome}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{marginBottom:20}}>
                <div className="lbl" style={{marginBottom:8}}>Elementos do tema selecionado</div>
                <div style={{fontSize:13,color:'#fff',lineHeight:2,whiteSpace:'pre-line'}}>
                  {temaSelecionado==='padrao'&&'Estrelas douradas animadas\nVisual padrão Capi da Sorte'}
                  {temaSelecionado==='natal'&&'Árvores de natal com luzes coloridas no rodapé\nNeve caindo em toda a tela\nTrenó com Papai Noel perto do contador\nTexto Feliz Natal'}
                  {temaSelecionado==='ano_novo'&&'Fogos de artifício coloridos\nContador regressivo para a virada\nTexto Feliz Ano Novo\nChampagne e estrelas extras'}
                  {temaSelecionado==='carnaval'&&'Confetes coloridos caindo\nMáscaras de carnaval flutuando\nSerpentinas coloridas\nCores vibrantes'}
                  {temaSelecionado==='maes'&&'Pétalas de rosa douradas caindo\nFlores animadas nos cantos\nBorboletas douradas flutuando\nTexto Feliz Dia das Mães'}
                  {temaSelecionado==='namorados'&&'Corações dourados e vermelhos flutuando\nPétalas vermelhas caindo\nFlechas do cupido\nTexto Feliz Dia dos Namorados'}
                  {temaSelecionado==='pais'&&'Gravatas douradas flutuando\nTroféu dourado animado\nEstrelas maiores e brilhantes\nTexto Feliz Dia dos Pais'}
                  {temaSelecionado==='pascoa'&&'Ovos dourados e coloridos flutuando\nCoelhinhos animados\nFlores da primavera\nTexto Feliz Páscoa'}
                  {temaSelecionado==='black_friday'&&'Raios elétricos neon\nContador regressivo agressivo\nTexto BLACK FRIDAY pulsando\nEtiquetas de desconto caindo'}
                </div>
              </div>
              {msgSalvo&&<div style={{background:'rgba(31,204,106,0.15)',border:'1px solid rgba(31,204,106,0.4)',borderRadius:10,padding:'12px 16px',color:'#1FCC6A',fontSize:14,fontWeight:700,marginBottom:16,textAlign:'center'}}>{msgSalvo}</div>}
              <button className="btn-g" style={{width:'100%'}} onClick={()=>{localStorage.setItem('capi_tema',temaSelecionado);salvar('Tema aplicado com sucesso!')}}>Aplicar Tema</button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

function hexToRgb(hex: string) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
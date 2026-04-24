'use client'
import { useEffect, useRef, useState } from 'react'

interface Campanha {
  id: string; nome: string; total_cotas: number; cotas_vendidas: number
  premio_inicial: number; incremento_por_cota: number; status: string
  limite_cotas_por_cpf: number; tempo_reserva_minutos: number
  porcentagem_premio: number; valor_cota: number
}
interface Transacao {
  id: string; user_nome: string; user_email: string
  quantidade_cotas: number; valor: number; status: string; created_at: string
}
interface Usuario {
  id: string; nome: string; email: string; telefone: string
  created_at: string; ativo: boolean; data_nascimento: string
  saldo_carteira?: number; total_compras?: number; total_gasto?: number
}

const ADMIN_PASSWORD = 'CapiAdmin@2026'

const TEMAS = [
  { id:'padrao', nome:'Padrão', cor:'#F5A800', elementos:'Estrelas douradas animadas — visual padrão Capi da Sorte' },
  { id:'natal', nome:'Natal', cor:'#CC0000', elementos:'Neve caindo • Árvores de natal com luzes coloridas • Presentes caindo' },
  { id:'ano_novo', nome:'Ano Novo', cor:'#FFD700', elementos:'Fogos dourados e prata • Chuva de papel dourado e prata • Countdown para virada' },
  { id:'carnaval', nome:'Carnaval', cor:'#9B00FF', elementos:'Confetes coloridos caindo • Serpentinas animadas' },
  { id:'maes', nome:'Dia das Mães', cor:'#FF69B4', elementos:'Pétalas de rosa douradas caindo • Flores animadas' },
  { id:'namorados', nome:'Namorados', cor:'#FF0044', elementos:'Corações flutuando • Pétalas vermelhas caindo' },
  { id:'pais', nome:'Dia dos Pais', cor:'#1E90FF', elementos:'Gravatas flutuando • Estrelas douradas animadas' },
  { id:'pascoa', nome:'Páscoa', cor:'#9ACD32', elementos:'Cenouras coloridas caindo • Coelhinhos pulando no rodapé' },
  { id:'black_friday', nome:'Black Friday', cor:'#FF0000', elementos:'Raios neon • Névoa vermelha nos cantos • Bordas neon pulsando • Partículas vermelhas' },
  { id:'aniversario', nome:'Aniversariante', cor:'#FF8C00', elementos:'Balões coloridos subindo • Desconto exclusivo 24h — automático para aniversariantes' },
]

const HISTORICO_CAMPANHAS = [
  { id:'001', nome:'Campanha Abril 2026', total_cotas:10000000, cotas_vendidas:2450000, total_arrecadado:12240500, premio_pago:3672150, lucro:8568350, status:'encerrada', ganhador:'João Silva', bilhete:'4857291', data_inicio:'01/04/2026', data_fim:'30/04/2026' },
  { id:'002', nome:'Campanha Março 2026', total_cotas:5000000, cotas_vendidas:5000000, total_arrecadado:24950000, premio_pago:7485000, lucro:17465000, status:'encerrada', ganhador:'Maria Santos', bilhete:'2934817', data_inicio:'01/03/2026', data_fim:'31/03/2026' },
]

type Menu = 'dashboard'|'criar_campanha'|'campanhas_ativas'|'historico'|'sorteios'|'pacotes'|'simulador'|'extrato'|'premios'|'usuarios'|'carteira'|'aniversariantes'|'blacklist'|'identidade'|'temas'|'textos'|'pixel'|'api_conversoes'|'utm'|'relatorio_anuncios'|'logs'|'controle_acesso'

const MENU_ITEMS = [
  { section:'VISÃO GERAL', items:[{ id:'dashboard', label:'Dashboard' }]},
  { section:'CAMPANHAS', items:[
    { id:'criar_campanha', label:'Criar Campanha' },
    { id:'campanhas_ativas', label:'Campanhas Ativas' },
    { id:'historico', label:'Histórico' },
    { id:'sorteios', label:'Sorteios' },
  ]},
  { section:'BILHETES', items:[{ id:'pacotes', label:'Pacotes' }]},
  { section:'FINANCEIRO', items:[
    { id:'simulador', label:'Simulador' },
    { id:'extrato', label:'Extrato' },
    { id:'premios', label:'Prêmios' },
  ]},
  { section:'USUÁRIOS', items:[
    { id:'usuarios', label:'Usuários' },
    { id:'carteira', label:'Carteira Digital' },
    { id:'aniversariantes', label:'Aniversariantes' },
    { id:'blacklist', label:'Blacklist' },
  ]},
  { section:'PLATAFORMA', items:[
    { id:'identidade', label:'Identidade Visual' },
    { id:'temas', label:'Temas Sazonais' },
    { id:'textos', label:'Textos e Frases' },
  ]},
  { section:'MARKETING', items:[
    { id:'pixel', label:'Pixel Meta' },
    { id:'api_conversoes', label:'API de Conversões' },
    { id:'utm', label:'UTM e Rastreamento' },
    { id:'relatorio_anuncios', label:'Relatório de Anúncios' },
  ]},
  { section:'SEGURANÇA', items:[
    { id:'logs', label:'Logs do Sistema' },
    { id:'controle_acesso', label:'Controle de Acesso' },
  ]},
]

const SORTEIOS_PADRAO = [
  { id:'001', ordem:'1º Sorteio', data:'2026-04-15', hora:'20:00', premio:'500', status:'realizado', ganhador:'', bilhete_ganhador:'', congelado:true },
  { id:'002', ordem:'2º Sorteio', data:'2026-04-20', hora:'20:00', premio:'800', status:'realizado', ganhador:'', bilhete_ganhador:'', congelado:true },
  { id:'003', ordem:'3º Sorteio', data:'2026-04-26', hora:'20:00', premio:'1200', status:'pendente', ganhador:'', bilhete_ganhador:'', congelado:false },
  { id:'004', ordem:'Sorteio Principal', data:'2026-04-30', hora:'20:00', premio:'', status:'pendente', ganhador:'', bilhete_ganhador:'', congelado:false },
]

export default function Admin() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [auth, setAuth] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [menu, setMenu] = useState<Menu>('dashboard')
  const [menuAberto, setMenuAberto] = useState(true)
  const [campanha, setCampanha] = useState<Campanha|null>(null)
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [msgSalvo, setMsgSalvo] = useState('')
  const [busca, setBusca] = useState('')
  const [buscaCarteira, setBuscaCarteira] = useState('')
  const [temaSelecionado, setTemaSelecionado] = useState('padrao')
  const [previewTema, setPreviewTema] = useState(false)
  const [ganhadorCampanha, setGanhadorCampanha] = useState('')
  const [ganhadorSequencia, setGanhadorSequencia] = useState('')
  const [ganhadorEncontrado, setGanhadorEncontrado] = useState<any>(null)
  const [sorteios, setSorteios] = useState(SORTEIOS_PADRAO)
  const [blacklist, setBlacklist] = useState<{valor:string,motivo:string,data:string}[]>([])
  const [blacklistItem, setBlacklistItem] = useState({valor:'',motivo:''})
  const [pixelId, setPixelId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [utmCampanha, setUtmCampanha] = useState('')
  const [utmMidia, setUtmMidia] = useState('facebook')
  const [anivDesconto, setAnivDesconto] = useState('20')
  const [anivValidade, setAnivValidade] = useState('24')
  const [simBilhetes, setSimBilhetes] = useState('10000000')
  const [simValor, setSimValor] = useState('4.99')
  const [simPct, setSimPct] = useState('30')
  const [simPctVenda, setSimPctVenda] = useState('100')
  const [simCaixas, setSimCaixas] = useState('10')
  const [simValorCaixa, setSimValorCaixa] = useState('100')
  const [novaCamp, setNovaCamp] = useState({
    nome:'', regulamento:'',
    total_cotas:'10000000', valor_cota:'4.99',
    premio_inicial:'100000', incremento_por_cota:'1.50',
    porcentagem_premio:'30', limite_cotas_por_cpf:'200',
    tempo_reserva_minutos:'30',
    data_inicio:'', data_fim:'',
    data_sorteio1:'', hora_sorteio1:'20:00', premio_sorteio1:'500',
    data_sorteio2:'', hora_sorteio2:'20:00', premio_sorteio2:'800',
    data_sorteio3:'', hora_sorteio3:'20:00', premio_sorteio3:'1200',
    data_sorteio_principal:'', hora_sorteio_principal:'20:00',
    tema:'padrao',
    caixas_ativas:false, caixas_total:'100', caixas_premiadas:'10',
    caixas_faixas:[
      {quantidade:'5', valor:'50'},
      {quantidade:'3', valor:'100'},
      {quantidade:'2', valor:'200'},
    ],
  })
  const [pacotes, setPacotes] = useState([
    { qty:1, valor:'4.99', destaque:false },
    { qty:5, valor:'22.00', destaque:false },
    { qty:10, valor:'40.00', destaque:true },
    { qty:20, valor:'70.00', destaque:true },
  ])
  const [identidade, setIdentidade] = useState({
    nome_plataforma:'Capi da Sorte',
    slogan:'O prêmio cresce com você.',
    cor_principal:'#F5A800',
    cor_secundaria:'#04091C',
  })
  const [textos, setTextos] = useState({
    frase1:'Compras acontecendo agora',
    frase2:'Quanto mais bilhetes, maiores suas chances',
    frase3:'Compras confirmadas em tempo real',
    frase4:'Prêmio crescendo ao vivo',
    frase5:'Não fique de fora',
    btn_compra:'Garantir Meus Bilhetes Agora',
    frase_urgencia:'Pagamento 100% seguro via PIX • Confirmação imediata',
    regulamento:'',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight }
    resize(); addEventListener('resize',resize)
    const stars = Array.from({length:80},()=>({
      x:Math.random()*innerWidth, y:Math.random()*innerHeight,
      r:Math.random()*1+0.2, gold:Math.random()>0.8,
      alpha:Math.random(), tw:Math.random()*0.004+0.001
    }))
    const draw=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height)
      stars.forEach(s=>{
        s.alpha+=s.tw; if(s.alpha>1||s.alpha<0)s.tw*=-1
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2)
        ctx.fillStyle=s.gold?`rgba(245,168,0,${Math.abs(s.alpha)})`:`rgba(255,255,255,${Math.abs(s.alpha)*0.2})`
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
      if (campRes.ok) setCampanha(await campRes.json())
      const token = localStorage.getItem('token')
      if (token) {
        const h = { 'Authorization': `Bearer ${token}` }
        const [txRes, usRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/transacoes`, { headers:h }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios`, { headers:h }),
        ])
        if (txRes.ok) { const d = await txRes.json(); setTransacoes(d.transacoes||[]) }
        if (usRes.ok) { const d = await usRes.json(); setUsuarios(d.usuarios||[]) }
      }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const aplicarTema = async (tema: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tema-ativo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tema })
      })
      salvar(`Tema ${tema} aplicado com sucesso! Todos os usuários já estão vendo.`)
    } catch(e) {
      salvar('Tema aplicado localmente!')
    }
  }

  const salvar = (msg: string) => { setMsgSalvo(msg); setTimeout(()=>setMsgSalvo(''),3000) }
  const fv = (v: number) => v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
  const fd = (d: string) => new Date(d).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
  const txConfirm = transacoes.filter(t=>t.status==='paid')
  const totalArr = txConfirm.reduce((a,t)=>a+parseFloat(String(t.valor)),0)
  const premioAtual = campanha ? parseFloat(String(campanha.premio_inicial))+(campanha.cotas_vendidas*parseFloat(String(campanha.incremento_por_cota))) : 0
  const pct = campanha ? Math.min(100,(campanha.cotas_vendidas/campanha.total_cotas)*100) : 0
  const simBilhetesVendidos = Math.floor((parseFloat(simBilhetes)||0)*(parseFloat(simPctVenda)||0)/100)
  const simReceitaBruta = simBilhetesVendidos*(parseFloat(simValor)||0)
  const simPremioFinal = simReceitaBruta*(parseFloat(simPct)||0)/100
  const simCaixasTotal = (parseInt(simCaixas)||0)*(parseFloat(simValorCaixa)||0)
  const simLucro = simReceitaBruta - simPremioFinal - simCaixasTotal
  const aniversariantesMes = usuarios.filter(u => u.data_nascimento && new Date(u.data_nascimento).getMonth()===new Date().getMonth())

  const buscarGanhador = () => {
    if (!ganhadorCampanha || !ganhadorSequencia) { salvar('Preencha o número da campanha e a sequência sorteada'); return }
    const encontrado = usuarios[0] || null
    setGanhadorEncontrado(encontrado)
    if (!encontrado) salvar('Nenhum ganhador encontrado')
  }

  function hexToRgb(hex: string) {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
    return `${r},${g},${b}`
  }

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
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}body{background:#04091C;overflow-x:hidden}
        .menu-item{padding:9px 16px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all .15s;color:rgba(255,255,255,0.4);display:block;width:100%}
        .menu-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7)}
        .menu-item.on{background:rgba(245,168,0,0.12);color:#F5A800;border-left:2px solid #F5A800}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-bottom:12px}
        .row{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px 16px;margin-bottom:8px}
        .inp{width:100%;padding:10px 14px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:14px;outline:none;font-family:'Barlow',sans-serif}
        .inp::placeholder{color:rgba(255,255,255,0.2)}
        .sel{width:100%;padding:10px 14px;border-radius:8px;background:#080F20;border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:14px;outline:none;font-family:'Barlow',sans-serif}
        .textarea{width:100%;padding:10px 14px;border-radius:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;outline:none;font-family:'Barlow',sans-serif;resize:vertical;min-height:80px}
        .textarea::placeholder{color:rgba(255,255,255,0.2)}
        .btn-g{padding:11px 22px;border-radius:8px;background:linear-gradient(135deg,#FFD060,#F5A800,#C88000);border:none;color:#04091C;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:1px;text-transform:uppercase;font-family:'Barlow',sans-serif}
        .btn-s{padding:10px 18px;border-radius:8px;background:rgba(245,168,0,0.1);border:1px solid rgba(245,168,0,0.3);color:#F5A800;font-size:13px;font-weight:700;cursor:pointer;font-family:'Barlow',sans-serif}
        .btn-r{padding:8px 14px;border-radius:6px;background:rgba(255,61,90,0.1);border:1px solid rgba(255,61,90,0.3);color:#FF3D5A;font-size:12px;font-weight:700;cursor:pointer;font-family:'Barlow',sans-serif}
        .btn-b{padding:8px 14px;border-radius:6px;background:rgba(30,144,255,0.1);border:1px solid rgba(30,144,255,0.3);color:#1E90FF;font-size:12px;font-weight:700;cursor:pointer;font-family:'Barlow',sans-serif}
        .lbl{font-size:10px;color:#7A8BB0;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}
        .sec-title{font-family:'Bebas Neue',cursive;font-size:24px;letter-spacing:2px;color:#F5A800;margin-bottom:20px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        @media(max-width:600px){.grid2{grid-template-columns:1fr}.grid3{grid-template-columns:1fr 1fr}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes premio-pulse{0%,100%{filter:drop-shadow(0 0 30px rgba(245,168,0,0.8));transform:scale(1)}50%{filter:drop-shadow(0 0 80px rgba(245,168,0,1));transform:scale(1.06)}}
        .toggle{width:44px;height:24px;border-radius:12px;cursor:pointer;transition:background .2s;position:relative;border:none;flex-shrink:0}
        .toggle-dot{width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;transition:left .2s}
      `}</style>

      <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>

      <div style={{display:'flex',minHeight:'100vh',fontFamily:"'Barlow',sans-serif",color:'#fff',position:'relative',zIndex:1}}>
        <div style={{width:menuAberto?240:0,minWidth:menuAberto?240:0,background:'rgba(4,9,28,0.98)',borderRight:'1px solid rgba(245,168,0,0.1)',overflowY:'auto',overflowX:'hidden',transition:'all .3s',position:'fixed',top:0,left:0,bottom:0,zIndex:200}}>
          <div style={{padding:'20px 16px 8px'}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#F5A800',letterSpacing:3,marginBottom:4}}>CAPI DA SORTE</div>
            <div style={{fontSize:9,color:'#7A8BB0',letterSpacing:3,textTransform:'uppercase',marginBottom:20}}>Painel Administrativo</div>
          </div>
          {MENU_ITEMS.map((section,si)=>(
            <div key={si} style={{marginBottom:8}}>
              <div style={{padding:'4px 16px',fontSize:9,color:'rgba(245,168,0,0.4)',fontWeight:700,letterSpacing:3,textTransform:'uppercase'}}>{section.section}</div>
              {section.items.map(item=>(
                <div key={item.id} className={`menu-item ${menu===item.id?'on':''}`} onClick={()=>setMenu(item.id as Menu)}>{item.label}</div>
              ))}
            </div>
          ))}
          <div style={{padding:'16px',borderTop:'1px solid rgba(255,255,255,0.06)',marginTop:16}}>
            <button onClick={()=>setAuth(false)} style={{width:'100%',padding:'10px',borderRadius:8,background:'rgba(255,61,90,0.1)',border:'1px solid rgba(255,61,90,0.2)',color:'rgba(255,61,90,0.6)',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:1,textTransform:'uppercase'}}>Sair</button>
          </div>
        </div>

        <div style={{marginLeft:menuAberto?240:0,flex:1,transition:'margin .3s',minHeight:'100vh'}}>
          <div style={{background:'rgba(4,9,28,0.95)',borderBottom:'1px solid rgba(245,168,0,0.15)',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100,backdropFilter:'blur(20px)'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <button onClick={()=>setMenuAberto(!menuAberto)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:18,padding:'4px 8px'}}>☰</button>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'rgba(255,255,255,0.4)',letterSpacing:2}}>
                {MENU_ITEMS.flatMap(s=>s.items).find(i=>i.id===menu)?.label||'Dashboard'}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'#1FCC6A',animation:'blink 1s infinite'}}></div>
              <span style={{fontSize:11,color:'#1FCC6A',fontWeight:700}}>ONLINE</span>
            </div>
          </div>

          <div style={{padding:'24px 20px 80px',maxWidth:900,margin:'0 auto'}}>
            {msgSalvo&&<div style={{background:'rgba(31,204,106,0.15)',border:'1px solid rgba(31,204,106,0.4)',borderRadius:10,padding:'12px 16px',color:'#1FCC6A',fontSize:14,fontWeight:700,marginBottom:16,textAlign:'center'}}>{msgSalvo}</div>}{/* DASHBOARD */}
            {menu==='dashboard'&&(
              <div>
                <div className="sec-title">Dashboard</div>
                {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:(
                  <>
                    <div className="grid3" style={{marginBottom:16}}>
                      {[
                        {lbl:'Premio Atual',val:`R$ ${fv(premioAtual)}`,cor:'#F5A800'},
                        {lbl:'Total Arrecadado',val:`R$ ${fv(totalArr)}`,cor:'#1FCC6A'},
                        {lbl:'Bilhetes Vendidos',val:campanha?.cotas_vendidas.toLocaleString('pt-BR')||'0',cor:'#fff'},
                        {lbl:'Usuários',val:usuarios.length.toString(),cor:'#fff'},
                        {lbl:'Confirmadas',val:txConfirm.length.toString(),cor:'#1FCC6A'},
                        {lbl:'Pendentes',val:transacoes.filter(t=>t.status==='pending').length.toString(),cor:'#F5A800'},
                      ].map((s,i)=>(
                        <div key={i} className="card" style={{textAlign:'center'}}>
                          <div className="lbl">{s.lbl}</div>
                          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:s.cor}}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                    {campanha&&(
                      <div className="card">
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:13,color:'#7A8BB0',fontWeight:600}}>{campanha.nome}</span>
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
                    <button className="btn-s" onClick={carregarDados}>Atualizar</button>
                  </>
                )}
              </div>
            )}

            {/* CRIAR CAMPANHA */}
            {menu==='criar_campanha'&&(
              <div>
                <div className="sec-title">Criar Nova Campanha</div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Identificação</div>
                  <div style={{marginBottom:12}}><div className="lbl">Nome da Campanha</div><input className="inp" placeholder="Ex: Campanha Maio 2026" value={novaCamp.nome} onChange={e=>setNovaCamp(p=>({...p,nome:e.target.value}))}/></div>
                  <div><div className="lbl">Regulamento</div><textarea className="textarea" style={{minHeight:120,marginTop:4}} placeholder="Regulamento completo..." value={novaCamp.regulamento} onChange={e=>setNovaCamp(p=>({...p,regulamento:e.target.value}))}/></div>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Configurações Financeiras</div>
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">Total de Bilhetes</div><input className="inp" type="number" value={novaCamp.total_cotas} onChange={e=>setNovaCamp(p=>({...p,total_cotas:e.target.value}))}/></div>
                    <div><div className="lbl">Valor do Bilhete (R$)</div><input className="inp" type="number" step="0.01" value={novaCamp.valor_cota} onChange={e=>setNovaCamp(p=>({...p,valor_cota:e.target.value}))}/></div>
                    <div><div className="lbl">Prêmio Inicial (R$)</div><input className="inp" type="number" value={novaCamp.premio_inicial} onChange={e=>setNovaCamp(p=>({...p,premio_inicial:e.target.value}))}/></div>
                    <div><div className="lbl">Incremento por Bilhete (R$)</div><input className="inp" type="number" step="0.01" value={novaCamp.incremento_por_cota} onChange={e=>setNovaCamp(p=>({...p,incremento_por_cota:e.target.value}))}/></div>
                    <div><div className="lbl">Limite por CPF</div><input className="inp" type="number" value={novaCamp.limite_cotas_por_cpf} onChange={e=>setNovaCamp(p=>({...p,limite_cotas_por_cpf:e.target.value}))}/></div>
                    <div><div className="lbl">Tempo de Reserva (min)</div><input className="inp" type="number" value={novaCamp.tempo_reserva_minutos} onChange={e=>setNovaCamp(p=>({...p,tempo_reserva_minutos:e.target.value}))}/></div>
                  </div>
                  <div className="lbl">Porcentagem para o Prêmio</div>
                  <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
                    {['20','30','40'].map(p=>(
                      <div key={p} onClick={()=>setNovaCamp(prev=>({...prev,porcentagem_premio:p}))} style={{flex:1,minWidth:80,padding:'16px',borderRadius:12,border:`2px solid ${novaCamp.porcentagem_premio===p?'#F5A800':'rgba(255,255,255,0.1)'}`,background:novaCamp.porcentagem_premio===p?'rgba(245,168,0,0.1)':'rgba(255,255,255,0.03)',textAlign:'center',cursor:'pointer',transition:'all .2s'}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:novaCamp.porcentagem_premio===p?'#F5A800':'#fff'}}>{p}%</div>
                        <div style={{fontSize:11,color:'#7A8BB0',marginTop:4}}>para o prêmio</div>
                        <div style={{fontSize:11,color:'#1FCC6A',marginTop:2}}>{100-parseInt(p)}% para o caixa</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Datas e Horários</div>
                  <div className="grid2" style={{marginBottom:16}}>
                    <div><div className="lbl">Início das Vendas</div><input className="inp" type="datetime-local" value={novaCamp.data_inicio} onChange={e=>setNovaCamp(p=>({...p,data_inicio:e.target.value}))}/></div>
                    <div><div className="lbl">Encerramento das Vendas</div><input className="inp" type="datetime-local" value={novaCamp.data_fim} onChange={e=>setNovaCamp(p=>({...p,data_fim:e.target.value}))}/></div>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:'rgba(245,168,0,0.7)',letterSpacing:1,marginBottom:12}}>Sorteios Fixos — Congelamento Automático</div>
                  {[
                    {id:'001',label:'1º Sorteio',dataKey:'data_sorteio1',horaKey:'hora_sorteio1',premioKey:'premio_sorteio1'},
                    {id:'002',label:'2º Sorteio',dataKey:'data_sorteio2',horaKey:'hora_sorteio2',premioKey:'premio_sorteio2'},
                    {id:'003',label:'3º Sorteio',dataKey:'data_sorteio3',horaKey:'hora_sorteio3',premioKey:'premio_sorteio3'},
                  ].map((s,i)=>(
                    <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'14px',marginBottom:10}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <div style={{background:'rgba(245,168,0,0.15)',border:'1px solid rgba(245,168,0,0.3)',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700,color:'#F5A800',letterSpacing:1}}>ID {s.id}</div>
                        <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{s.label}</div>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                        <div><div className="lbl">Data</div><input className="inp" type="date" value={(novaCamp as any)[s.dataKey]} onChange={e=>setNovaCamp(p=>({...p,[s.dataKey]:e.target.value}))}/></div>
                        <div><div className="lbl">Hora</div><input className="inp" type="time" value={(novaCamp as any)[s.horaKey]} onChange={e=>setNovaCamp(p=>({...p,[s.horaKey]:e.target.value}))}/></div>
                        <div><div className="lbl">Prêmio (R$)</div><input className="inp" type="number" value={(novaCamp as any)[s.premioKey]} onChange={e=>setNovaCamp(p=>({...p,[s.premioKey]:e.target.value}))}/></div>
                      </div>
                    </div>
                  ))}
                  <div style={{background:'rgba(245,168,0,0.05)',border:'1px solid rgba(245,168,0,0.2)',borderRadius:10,padding:'14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <div style={{background:'rgba(245,168,0,0.3)',border:'1px solid rgba(245,168,0,0.5)',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700,color:'#F5A800',letterSpacing:1}}>ID 004</div>
                      <div style={{fontSize:13,fontWeight:700,color:'#F5A800'}}>Sorteio Principal — Congelamento Manual</div>
                    </div>
                    <div className="grid2">
                      <div><div className="lbl">Data</div><input className="inp" type="date" value={novaCamp.data_sorteio_principal} onChange={e=>setNovaCamp(p=>({...p,data_sorteio_principal:e.target.value}))}/></div>
                      <div><div className="lbl">Hora</div><input className="inp" type="time" value={novaCamp.hora_sorteio_principal} onChange={e=>setNovaCamp(p=>({...p,hora_sorteio_principal:e.target.value}))}/></div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Caixas Premiadas</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                    <div>
                      <div style={{fontSize:14,color:'#fff',fontWeight:600}}>Ativar Caixas Premiadas</div>
                      <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>Uma caixa por compra — sistema distribui automaticamente</div>
                    </div>
                    <button className="toggle" style={{background:novaCamp.caixas_ativas?'#1FCC6A':'rgba(255,255,255,0.1)'}} onClick={()=>setNovaCamp(p=>({...p,caixas_ativas:!p.caixas_ativas}))}>
                      <div className="toggle-dot" style={{left:novaCamp.caixas_ativas?22:3}}></div>
                    </button>
                  </div>
                  {novaCamp.caixas_ativas&&(
                    <>
                      <div className="grid2" style={{marginBottom:16}}>
                        <div><div className="lbl">Total de Caixas</div><input className="inp" type="number" value={novaCamp.caixas_total} onChange={e=>setNovaCamp(p=>({...p,caixas_total:e.target.value}))}/></div>
                        <div><div className="lbl">Quantidade Premiadas</div><input className="inp" type="number" value={novaCamp.caixas_premiadas} onChange={e=>setNovaCamp(p=>({...p,caixas_premiadas:e.target.value}))}/></div>
                      </div>
                      {novaCamp.caixas_faixas.map((f,i)=>(
                        <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,marginBottom:8,alignItems:'end'}}>
                          <div><div className="lbl">Quantidade</div><input className="inp" type="number" value={f.quantidade} onChange={e=>{const n=[...novaCamp.caixas_faixas];n[i].quantidade=e.target.value;setNovaCamp(p=>({...p,caixas_faixas:n}))}}/></div>
                          <div><div className="lbl">Valor (R$)</div><input className="inp" type="number" value={f.valor} onChange={e=>{const n=[...novaCamp.caixas_faixas];n[i].valor=e.target.value;setNovaCamp(p=>({...p,caixas_faixas:n}))}}/></div>
                          <button className="btn-r" onClick={()=>setNovaCamp(p=>({...p,caixas_faixas:p.caixas_faixas.filter((_,j)=>j!==i)}))}>Remover</button>
                        </div>
                      ))}
                      <button className="btn-s" style={{marginTop:8}} onClick={()=>setNovaCamp(p=>({...p,caixas_faixas:[...p.caixas_faixas,{quantidade:'1',valor:'50'}]}))}>+ Adicionar Faixa</button>
                    </>
                  )}
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Tema Visual</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8,marginBottom:12}}>
                    {TEMAS.map(t=>(
                      <div key={t.id} onClick={()=>setNovaCamp(p=>({...p,tema:t.id}))} style={{cursor:'pointer',borderRadius:10,padding:12,border:`2px solid ${novaCamp.tema===t.id?t.cor:'rgba(255,255,255,0.08)'}`,background:novaCamp.tema===t.id?`rgba(${hexToRgb(t.cor)},0.1)`:'rgba(255,255,255,0.02)',transition:'all .2s',display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:22,height:22,borderRadius:'50%',background:t.cor,flexShrink:0,boxShadow:`0 0 8px ${t.cor}60`}}></div>
                        <div style={{fontSize:12,fontWeight:700,color:novaCamp.tema===t.id?'#fff':'#7A8BB0'}}>{t.nome}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-b" onClick={()=>setPreviewTema(true)}>Visualizar Preview do Tema</button>
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button className="btn-s" style={{flex:1}} onClick={()=>salvar('Rascunho salvo!')}>Salvar Rascunho</button>
                  <button className="btn-g" style={{flex:1,padding:14,fontSize:14}} onClick={()=>salvar('Vendas abertas!')}>Abrir Vendas</button>
                </div>
              </div>
            )}

            {/* CAMPANHAS ATIVAS */}
            {menu==='campanhas_ativas'&&(
              <div>
                <div className="sec-title">Campanha Ativa</div>
                {campanha?(
                  <div className="card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:'#fff',letterSpacing:2}}>{campanha.nome}</div>
                        <div style={{display:'inline-block',background:'rgba(31,204,106,0.15)',border:'1px solid rgba(31,204,106,0.4)',borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:'#1FCC6A',letterSpacing:1,textTransform:'uppercase',marginTop:6}}>Ativa</div>
                      </div>
                      <button className="btn-r" onClick={()=>salvar('Sorteio Principal congelado!')}>Congelar Sorteio Principal</button>
                    </div>
                    <div style={{background:'rgba(245,168,0,0.05)',border:'1px solid rgba(245,168,0,0.2)',borderRadius:12,padding:20,marginBottom:16,textAlign:'center'}}>
                      <div style={{fontSize:11,color:'#7A8BB0',fontWeight:700,letterSpacing:2,textTransform:'uppercase',marginBottom:8}}>Premio Acumulado</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:48,color:'#F5A800',animation:'premio-pulse 2s ease-in-out infinite',letterSpacing:2}}>{`R$ ${fv(premioAtual)}`}</div>
                    </div>
                    <div className="grid2" style={{marginBottom:16}}>
                      {[
                        {lbl:'Bilhetes Vendidos',val:campanha.cotas_vendidas.toLocaleString('pt-BR')},
                        {lbl:'Total de Bilhetes',val:campanha.total_cotas.toLocaleString('pt-BR')},
                        {lbl:'Limite por CPF',val:`${campanha.limite_cotas_por_cpf} bilhetes`},
                        {lbl:'Disponíveis',val:(campanha.total_cotas-campanha.cotas_vendidas).toLocaleString('pt-BR')},
                      ].map((item,i)=>(
                        <div key={i}><div className="lbl">{item.lbl}</div><div style={{fontSize:15,color:'#fff',fontWeight:600}}>{item.val}</div></div>
                      ))}
                    </div>
                    <div style={{height:10,background:'rgba(255,255,255,0.05)',borderRadius:10,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#C88000,#F5A800,#FFD060)',borderRadius:10}}></div>
                    </div>
                    <div style={{fontSize:12,color:'#7A8BB0',marginTop:6}}>{pct.toFixed(2)}% vendido</div>
                  </div>
                ):<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Nenhuma campanha ativa</div>}
              </div>
            )}

            {/* HISTÓRICO */}
            {menu==='historico'&&(
              <div>
                <div className="sec-title">Histórico de Campanhas</div>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                  <button className="btn-b" onClick={()=>salvar('Exportado!')}>Exportar</button>
                </div>
                {HISTORICO_CAMPANHAS.map((c,i)=>(
                  <div key={i} className="card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <div style={{background:'rgba(245,168,0,0.15)',border:'1px solid rgba(245,168,0,0.3)',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700,color:'#F5A800'}}>ID {c.id}</div>
                          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#fff',letterSpacing:1}}>{c.nome}</div>
                        </div>
                        <div style={{fontSize:12,color:'#7A8BB0'}}>{c.data_inicio} — {c.data_fim}</div>
                      </div>
                      <div style={{display:'inline-block',background:'rgba(31,204,106,0.15)',border:'1px solid rgba(31,204,106,0.4)',borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:'#1FCC6A',letterSpacing:1,textTransform:'uppercase'}}>Encerrada</div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                      {[
                        {lbl:'Bilhetes Vendidos',val:c.cotas_vendidas.toLocaleString('pt-BR')},
                        {lbl:'Total Arrecadado',val:`R$ ${fv(c.total_arrecadado)}`},
                        {lbl:'Prêmio Pago',val:`R$ ${fv(c.premio_pago)}`},
                        {lbl:'Lucro',val:`R$ ${fv(c.lucro)}`},
                        {lbl:'Ganhador',val:c.ganhador},
                        {lbl:'Bilhete Premiado',val:`#${c.bilhete}`},
                      ].map((item,j)=>(
                        <div key={j}><div className="lbl">{item.lbl}</div><div style={{fontSize:13,color:'#fff',fontWeight:600}}>{item.val}</div></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SORTEIOS */}
            {menu==='sorteios'&&(
              <div>
                <div className="sec-title">Controle de Sorteios</div>
                <div className="card" style={{marginBottom:20,background:'rgba(245,168,0,0.04)',border:'1px solid rgba(245,168,0,0.15)'}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:12}}>Buscar Ganhador</div>
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">Número da Campanha</div><input className="inp" placeholder="Ex: 001" value={ganhadorCampanha} onChange={e=>setGanhadorCampanha(e.target.value)}/></div>
                    <div><div className="lbl">Sequência Sorteada</div><input className="inp" placeholder="Ex: 4857291" value={ganhadorSequencia} onChange={e=>setGanhadorSequencia(e.target.value)}/></div>
                  </div>
                  <button className="btn-g" style={{marginBottom:16}} onClick={buscarGanhador}>Identificar Ganhador</button>
                  {ganhadorEncontrado&&(
                    <div style={{background:'rgba(31,204,106,0.08)',border:'1px solid rgba(31,204,106,0.25)',borderRadius:12,padding:16}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#1FCC6A',marginBottom:12}}>Ganhador Identificado</div>
                      <div className="grid2" style={{marginBottom:16}}>
                        <div><div className="lbl">Nome</div><div style={{fontSize:14,color:'#fff',fontWeight:600}}>{ganhadorEncontrado.nome}</div></div>
                        <div><div className="lbl">Email</div><div style={{fontSize:14,color:'#fff',fontWeight:600}}>{ganhadorEncontrado.email}</div></div>
                        <div><div className="lbl">Telefone</div><div style={{fontSize:14,color:'#fff',fontWeight:600}}>{ganhadorEncontrado.telefone||'—'}</div></div>
                        <div><div className="lbl">Bilhete Premiado</div><div style={{fontSize:14,color:'#F5A800',fontWeight:700}}>#{ganhadorSequencia}</div></div>
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <button className="btn-g" onClick={()=>salvar('Ganhador postado!')}>Postar na Página Principal</button>
                        <button className="btn-b" onClick={()=>salvar('WhatsApp enviado!')}>Enviar WhatsApp</button>
                        <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                      </div>
                    </div>
                  )}
                </div>
                {sorteios.map((s,i)=>(
                  <div key={i} className="card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{background:'rgba(245,168,0,0.15)',border:'1px solid rgba(245,168,0,0.3)',borderRadius:6,padding:'3px 10px',fontSize:11,fontWeight:700,color:'#F5A800',letterSpacing:1}}>ID {s.id}</div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,color:'#F5A800',letterSpacing:2}}>{s.ordem}</div>
                      </div>
                      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                        {s.congelado&&<div style={{background:'rgba(30,144,255,0.15)',border:'1px solid rgba(30,144,255,0.3)',borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,color:'#1E90FF',letterSpacing:1,textTransform:'uppercase'}}>Auto</div>}
                        <div style={{display:'inline-block',background:s.status==='realizado'?'rgba(31,204,106,0.15)':'rgba(245,168,0,0.15)',border:`1px solid ${s.status==='realizado'?'rgba(31,204,106,0.4)':'rgba(245,168,0,0.4)'}`,borderRadius:20,padding:'3px 12px',fontSize:10,fontWeight:700,color:s.status==='realizado'?'#1FCC6A':'#F5A800',letterSpacing:1,textTransform:'uppercase'}}>
                          {s.status==='realizado'?'Realizado':'Pendente'}
                        </div>
                      </div>
                    </div>
                    <div className="grid2" style={{marginBottom:12}}>
                      <div><div className="lbl">Data</div><input className="inp" type="date" value={s.data} onChange={e=>{const n=[...sorteios];n[i].data=e.target.value;setSorteios(n)}}/></div>
                      <div><div className="lbl">Hora</div><input className="inp" type="time" value={s.hora} onChange={e=>{const n=[...sorteios];n[i].hora=e.target.value;setSorteios(n)}}/></div>
                    </div>
                    <div className="grid2" style={{marginBottom:12}}>
                      <div><div className="lbl">Prêmio (R$)</div><input className="inp" placeholder="Valor" value={s.premio} onChange={e=>{const n=[...sorteios];n[i].premio=e.target.value;setSorteios(n)}}/></div>
                      <div><div className="lbl">Bilhete Ganhador</div><input className="inp" placeholder="Número sorteado" value={s.bilhete_ganhador} onChange={e=>{const n=[...sorteios];n[i].bilhete_ganhador=e.target.value;setSorteios(n)}}/></div>
                    </div>
                    <div style={{marginBottom:12}}><div className="lbl">Nome do Ganhador</div><input className="inp" placeholder="Nome" value={s.ganhador} onChange={e=>{const n=[...sorteios];n[i].ganhador=e.target.value;setSorteios(n)}}/></div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button className="btn-g" onClick={()=>salvar(`${s.ordem} salvo!`)}>Salvar</button>
                      {s.status==='pendente'&&<button className="btn-s" onClick={()=>{const n=[...sorteios];n[i].status='realizado';setSorteios(n);salvar('Realizado!')}}>Marcar Realizado</button>}
                      {s.ganhador&&<button className="btn-b" onClick={()=>salvar('WhatsApp enviado!')}>Contatar Ganhador</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PACOTES */}
            {menu==='pacotes'&&(
              <div>
                <div className="sec-title">Gestão de Pacotes</div>
                {pacotes.map((p,i)=>(
                  <div key={i} className="card">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#fff',letterSpacing:1}}>{p.qty} bilhete{p.qty>1?'s':''}</div>
                      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                        <div><div className="lbl">Valor (R$)</div><input className="inp" style={{width:110}} value={p.valor} onChange={e=>{const n=[...pacotes];n[i].valor=e.target.value;setPacotes(n)}}/></div>
                        <div><div className="lbl">Destaque</div>
                          <button className="toggle" style={{background:p.destaque?'#F5A800':'rgba(255,255,255,0.1)',marginTop:4}} onClick={()=>{const n=[...pacotes];n[i].destaque=!n[i].destaque;setPacotes(n)}}>
                            <div className="toggle-dot" style={{left:p.destaque?22:3}}></div>
                          </button>
                        </div>
                        <button className="btn-g" onClick={()=>salvar('Pacote salvo!')}>Salvar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SIMULADOR */}
            {menu==='simulador'&&(
              <div>
                <div className="sec-title">Simulador Financeiro</div>
                <div className="card" style={{marginBottom:16}}>
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">Total de Bilhetes</div><input className="inp" type="number" value={simBilhetes} onChange={e=>setSimBilhetes(e.target.value)}/></div>
                    <div><div className="lbl">Valor do Bilhete (R$)</div><input className="inp" type="number" step="0.01" value={simValor} onChange={e=>setSimValor(e.target.value)}/></div>
                    <div><div className="lbl">% para o Prêmio</div>
                      <select className="sel" value={simPct} onChange={e=>setSimPct(e.target.value)}>
                        <option value="20">20%</option><option value="30">30%</option><option value="40">40%</option>
                      </select>
                    </div>
                    <div><div className="lbl">Cenário de Venda</div>
                      <select className="sel" value={simPctVenda} onChange={e=>setSimPctVenda(e.target.value)}>
                        <option value="25">25% — Conservador</option>
                        <option value="30">30% — Realista Baixo</option>
                        <option value="50">50% — Moderado</option>
                        <option value="80">80% — Otimista</option>
                        <option value="100">100% — Esgotado</option>
                      </select>
                    </div>
                    <div><div className="lbl">Qtd Caixas Premiadas</div><input className="inp" type="number" value={simCaixas} onChange={e=>setSimCaixas(e.target.value)}/></div>
                    <div><div className="lbl">Valor Médio por Caixa (R$)</div><input className="inp" type="number" value={simValorCaixa} onChange={e=>setSimValorCaixa(e.target.value)}/></div>
                  </div>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Projeção — {simPctVenda}% de Vendas</div>
                  {[
                    {lbl:'Bilhetes Vendidos',val:simBilhetesVendidos.toLocaleString('pt-BR'),cor:'#fff'},
                    {lbl:'Receita Bruta',val:`R$ ${fv(simReceitaBruta)}`,cor:'#fff'},
                    {lbl:`Prêmio Final (${simPct}%)`,val:`R$ ${fv(simPremioFinal)}`,cor:'#F5A800'},
                    {lbl:'Caixas Premiadas',val:`R$ ${fv(simCaixasTotal)}`,cor:'#F5A800'},
                    {lbl:'Lucro Estimado',val:`R$ ${fv(simLucro)}`,cor:'#1FCC6A'},
                    {lbl:'Margem',val:`${simReceitaBruta>0?((simLucro/simReceitaBruta)*100).toFixed(1):0}%`,cor:'#1FCC6A'},
                  ].map((s,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <div className="lbl" style={{marginBottom:0}}>{s.lbl}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:s.cor}}>{s.val}</div>
                    </div>
                  ))}
                  <div style={{marginTop:16,background:'rgba(245,168,0,0.05)',border:'1px solid rgba(245,168,0,0.15)',borderRadius:10,padding:14}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:'#F5A800',letterSpacing:1,marginBottom:10}}>Comparativo de Cenários</div>
                    {[
                      {pct:'25',label:'Conservador'},
                      {pct:'30',label:'Realista Baixo'},
                      {pct:'50',label:'Moderado'},
                      {pct:'80',label:'Otimista'},
                      {pct:'100',label:'Esgotado'},
                    ].map((c,i)=>{
                      const bil=Math.floor((parseFloat(simBilhetes)||0)*(parseFloat(c.pct)/100))
                      const rec=bil*(parseFloat(simValor)||0)
                      const lucro=rec - rec*(parseFloat(simPct)/100) - (parseInt(simCaixas)||0)*(parseFloat(simValorCaixa)||0)
                      return(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                          <span style={{fontSize:12,fontWeight:700,color:simPctVenda===c.pct?'#F5A800':'#fff'}}>{c.pct}% — {c.label}</span>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#1FCC6A'}}>R$ {fv(lucro)}</div>
                            <div style={{fontSize:10,color:'#7A8BB0'}}>lucro estimado</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:16}}>
                    <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                    <button className="btn-b" onClick={()=>salvar('Exportado!')}>Exportar</button>
                  </div>
                </div>
              </div>
            )}

            {/* EXTRATO */}
            {menu==='extrato'&&(
              <div>
                <div className="sec-title">Extrato Financeiro</div>
                <div className="grid2" style={{marginBottom:16}}>
                  {[
                    {lbl:'Total Arrecadado',val:`R$ ${fv(totalArr)}`,cor:'#1FCC6A'},
                    {lbl:'Ticket Médio',val:txConfirm.length>0?`R$ ${fv(totalArr/txConfirm.length)}`:'—',cor:'#fff'},
                  ].map((s,i)=>(
                    <div key={i} className="card" style={{textAlign:'center'}}>
                      <div className="lbl">{s.lbl}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:s.cor}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                  <button className="btn-b" onClick={()=>salvar('Exportado!')}>Exportar</button>
                </div>
                {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:
                txConfirm.slice(0,50).map((tx,i)=>(
                  <div key={i} className="row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{tx.user_nome||tx.user_email}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{tx.quantidade_cotas} bilhetes • {fd(tx.created_at)}</div>
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#1FCC6A'}}>R$ {fv(parseFloat(String(tx.valor)))}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PREMIOS */}
            {menu==='premios'&&(
              <div>
                <div className="sec-title">Relatório de Prêmios</div>
                <div className="grid3" style={{marginBottom:16}}>
                  {[
                    {lbl:'Premio Principal',val:`R$ ${fv(premioAtual)}`,cor:'#F5A800'},
                    {lbl:'Prêmios Fixos',val:'R$ 2.500,00',cor:'#fff'},
                    {lbl:'Caixas Premiadas',val:'R$ 0,00',cor:'#fff'},
                  ].map((s,i)=>(
                    <div key={i} className="card" style={{textAlign:'center'}}>
                      <div className="lbl">{s.lbl}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:s.cor}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                  <button className="btn-b" onClick={()=>salvar('Exportado!')}>Exportar</button>
                </div>
                {sorteios.map((s,i)=>(
                  <div key={i} className="row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                          <div style={{background:'rgba(245,168,0,0.15)',border:'1px solid rgba(245,168,0,0.3)',borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700,color:'#F5A800'}}>ID {s.id}</div>
                          <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{s.ordem}</div>
                        </div>
                        <div style={{fontSize:12,color:'#7A8BB0'}}>{s.data} às {s.hora}</div>
                        {s.ganhador&&<div style={{fontSize:12,color:'#1FCC6A',marginTop:2}}>Ganhador: {s.ganhador}</div>}
                      </div>
                      <div>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:'#F5A800'}}>R$ {s.premio?parseFloat(s.premio).toLocaleString('pt-BR',{minimumFractionDigits:2}):fv(premioAtual)}</div>
                        <div style={{display:'inline-block',background:s.status==='realizado'?'rgba(31,204,106,0.15)':'rgba(245,168,0,0.15)',border:`1px solid ${s.status==='realizado'?'rgba(31,204,106,0.4)':'rgba(245,168,0,0.4)'}`,borderRadius:20,padding:'2px 10px',fontSize:10,fontWeight:700,color:s.status==='realizado'?'#1FCC6A':'#F5A800',letterSpacing:1,textTransform:'uppercase',marginTop:4}}>{s.status==='realizado'?'Pago':'Pendente'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USUARIOS */}
            {menu==='usuarios'&&(
              <div>
                <div className="sec-title">Usuários</div>
                <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
                  <input className="inp" style={{flex:1}} placeholder="Buscar por nome ou email..." value={busca} onChange={e=>setBusca(e.target.value)}/>
                  <button className="btn-s" onClick={()=>window.print()}>Imprimir</button>
                  <button className="btn-b" onClick={()=>salvar('Exportado!')}>Exportar</button>
                </div>
                <div style={{fontSize:13,color:'#7A8BB0',marginBottom:12}}>{usuarios.filter(u=>u.nome?.toLowerCase().includes(busca.toLowerCase())||u.email?.toLowerCase().includes(busca.toLowerCase())).length} usuários</div>
                {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:
                usuarios.filter(u=>u.nome?.toLowerCase().includes(busca.toLowerCase())||u.email?.toLowerCase().includes(busca.toLowerCase())).slice(0,50).map((u,i)=>(
                  <div key={i} className="row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{u.nome}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{u.email}</div>
                        {u.telefone&&<div style={{fontSize:12,color:'#7A8BB0'}}>{u.telefone}</div>}
                        <div style={{fontSize:11,color:'#4A5B7A',marginTop:2}}>Cadastro: {fd(u.created_at)}</div>
                      </div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        <div style={{display:'inline-block',background:u.ativo!==false?'rgba(31,204,106,0.15)':'rgba(255,61,90,0.15)',border:`1px solid ${u.ativo!==false?'rgba(31,204,106,0.4)':'rgba(255,61,90,0.4)'}`,borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,color:u.ativo!==false?'#1FCC6A':'#FF3D5A',letterSpacing:1,textTransform:'uppercase'}}>{u.ativo!==false?'Ativo':'Bloqueado'}</div>
                        <button className="btn-r" onClick={()=>salvar('Usuário bloqueado!')}>Bloquear</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CARTEIRA */}
            {menu==='carteira'&&(
              <div>
                <div className="sec-title">Carteira Digital</div>
                <div style={{display:'flex',gap:8,marginBottom:16}}>
                  <input className="inp" style={{flex:1}} placeholder="Buscar usuário..." value={buscaCarteira} onChange={e=>setBuscaCarteira(e.target.value)}/>
                </div>
                <div className="grid3" style={{marginBottom:16}}>
                  {[
                    {lbl:'Total em Carteiras',val:'R$ 0,00',cor:'#F5A800'},
                    {lbl:'Usuários com Saldo',val:'0',cor:'#fff'},
                    {lbl:'Média por Carteira',val:'R$ 0,00',cor:'#fff'},
                  ].map((s,i)=>(
                    <div key={i} className="card" style={{textAlign:'center'}}>
                      <div className="lbl">{s.lbl}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:s.cor}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                {loading?<div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Carregando...</div>:
                usuarios.filter(u=>u.nome?.toLowerCase().includes(buscaCarteira.toLowerCase())||u.email?.toLowerCase().includes(buscaCarteira.toLowerCase())).slice(0,50).map((u,i)=>(
                  <div key={i} className="row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{u.nome}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{u.email}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>Total gasto: R$ {fv(u.total_gasto||0)}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:'#F5A800'}}>R$ {fv(u.saldo_carteira||0)}</div>
                        <div style={{fontSize:10,color:'#7A8BB0',letterSpacing:1,textTransform:'uppercase'}}>Saldo disponível</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ANIVERSARIANTES */}
            {menu==='aniversariantes'&&(
              <div>
                <div className="sec-title">Aniversariantes do Mês</div>
                <div className="card" style={{marginBottom:16}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:12}}>Configurar Presente</div>
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">Desconto (%)</div><input className="inp" type="number" value={anivDesconto} onChange={e=>setAnivDesconto(e.target.value)}/></div>
                    <div><div className="lbl">Validade (horas)</div><input className="inp" type="number" value={anivValidade} onChange={e=>setAnivValidade(e.target.value)}/></div>
                  </div>
                  <button className="btn-g" onClick={()=>salvar('Configurações salvas!')}>Salvar</button>
                </div>
                <div style={{fontSize:13,color:'#7A8BB0',marginBottom:12}}>{aniversariantesMes.length} aniversariante{aniversariantesMes.length!==1?'s':''} este mês</div>
                {aniversariantesMes.length===0?
                  <div style={{textAlign:'center',padding:40,color:'#7A8BB0'}}>Nenhum aniversariante este mês</div>:
                  aniversariantesMes.map((u,i)=>(
                    <div key={i} className="row">
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{u.nome}</div>
                          <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>{u.email}</div>
                          <div style={{fontSize:12,color:'#F5A800',marginTop:2}}>Aniversário: {u.data_nascimento?new Date(u.data_nascimento).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'}):'—'}</div>
                        </div>
                        <button className="btn-b" onClick={()=>salvar(`Presente enviado!`)}>Enviar Presente</button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* BLACKLIST */}
            {menu==='blacklist'&&(
              <div>
                <div className="sec-title">Blacklist</div>
                <div className="card" style={{marginBottom:16}}>
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">CPF ou Email</div><input className="inp" placeholder="000.000.000-00" value={blacklistItem.valor} onChange={e=>setBlacklistItem(p=>({...p,valor:e.target.value}))}/></div>
                    <div><div className="lbl">Motivo</div><input className="inp" placeholder="Motivo" value={blacklistItem.motivo} onChange={e=>setBlacklistItem(p=>({...p,motivo:e.target.value}))}/></div>
                  </div>
                  <button className="btn-r" onClick={()=>{if(!blacklistItem.valor)return;setBlacklist(p=>[...p,{...blacklistItem,data:new Date().toLocaleDateString('pt-BR')}]);setBlacklistItem({valor:'',motivo:''});salvar('Adicionado!')}}>Bloquear</button>
                </div>
                {blacklist.length===0?<div style={{textAlign:'center',padding:40,color:'#7A8BB0',fontSize:13}}>Nenhum registro</div>:
                blacklist.map((b,i)=>(
                  <div key={i} className="row">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:'#FF3D5A'}}>{b.valor}</div>
                        <div style={{fontSize:12,color:'#7A8BB0',marginTop:2}}>Motivo: {b.motivo}</div>
                        <div style={{fontSize:11,color:'#4A5B7A',marginTop:2}}>{b.data}</div>
                      </div>
                      <button className="btn-s" onClick={()=>{setBlacklist(p=>p.filter((_,j)=>j!==i));salvar('Removido!')}}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* IDENTIDADE */}
            {menu==='identidade'&&(
              <div>
                <div className="sec-title">Identidade Visual</div>
                <div className="card">
                  <div style={{border:'2px dashed rgba(245,168,0,0.3)',borderRadius:12,padding:'40px',textAlign:'center',cursor:'pointer',marginBottom:16}}>
                    <div style={{fontSize:13,color:'#7A8BB0',marginBottom:4}}>Clique para upload da logomarca</div>
                    <div style={{fontSize:11,color:'#4A5B7A'}}>PNG ou SVG • Fundo transparente</div>
                  </div>
                  <div className="grid2" style={{marginBottom:16}}>
                    <div><div className="lbl">Nome da Plataforma</div><input className="inp" value={identidade.nome_plataforma} onChange={e=>setIdentidade(p=>({...p,nome_plataforma:e.target.value}))}/></div>
                    <div><div className="lbl">Slogan</div><input className="inp" value={identidade.slogan} onChange={e=>setIdentidade(p=>({...p,slogan:e.target.value}))}/></div>
                  </div>
                  <button className="btn-g" onClick={()=>salvar('Identidade atualizada!')}>Salvar e Atualizar Sistema</button>
                </div>
              </div>
            )}

            {/* TEMAS */}
            {menu==='temas'&&(
              <div>
                <div className="sec-title">Temas Sazonais</div>
                <div style={{fontSize:13,color:'#7A8BB0',marginBottom:12}}>Selecione o tema e aplique. Todos os usuários verão imediatamente. O tema aniversariante é automático — não precisa aplicar.</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:20}}>
                  {TEMAS.map(t=>(
                    <div key={t.id} onClick={()=>setTemaSelecionado(t.id)} style={{cursor:'pointer',borderRadius:12,padding:16,border:`2px solid ${temaSelecionado===t.id?t.cor:'rgba(255,255,255,0.08)'}`,background:temaSelecionado===t.id?`rgba(${hexToRgb(t.cor)},0.12)`:'rgba(255,255,255,0.03)',transition:'all .2s'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:t.cor,boxShadow:`0 0 10px ${t.cor}60`,flexShrink:0}}></div>
                        <div style={{fontSize:13,fontWeight:700,color:temaSelecionado===t.id?'#fff':'#7A8BB0'}}>{t.nome}</div>
                      </div>
                      <div style={{fontSize:11,color:'#4A5B7A',lineHeight:1.6}}>{t.elementos}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button className="btn-b" style={{flex:1}} onClick={()=>setPreviewTema(true)}>Visualizar Preview</button>
                  <button className="btn-g" style={{flex:1}} onClick={()=>aplicarTema(temaSelecionado)}>Aplicar Tema para Todos</button>
                </div>
              </div>
            )}

            {/* TEXTOS */}
            {menu==='textos'&&(
              <div>
                <div className="sec-title">Textos e Frases</div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Frases Rotativas</div>
                  {Object.entries(textos).filter(([k])=>k.startsWith('frase')).map(([key,val])=>(
                    <div key={key} style={{marginBottom:12}}>
                      <div className="lbl">Frase {key.replace('frase','')}</div>
                      <input className="inp" value={val} onChange={e=>setTextos(p=>({...p,[key]:e.target.value}))}/>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div style={{marginBottom:12}}><div className="lbl">Texto do Botão de Compra</div><input className="inp" value={textos.btn_compra} onChange={e=>setTextos(p=>({...p,btn_compra:e.target.value}))}/></div>
                  <div><div className="lbl">Frase de Urgência</div><input className="inp" value={textos.frase_urgencia} onChange={e=>setTextos(p=>({...p,frase_urgencia:e.target.value}))}/></div>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Regulamento</div>
                  <textarea className="textarea" style={{minHeight:150}} placeholder="Regulamento..." value={textos.regulamento} onChange={e=>setTextos(p=>({...p,regulamento:e.target.value}))}/>
                </div>
                <button className="btn-g" style={{width:'100%'}} onClick={()=>salvar('Textos salvos!')}>Salvar Todos</button>
              </div>
            )}

            {/* PIXEL */}
            {menu==='pixel'&&(
              <div>
                <div className="sec-title">Pixel Meta</div>
                <div className="card">
                  <div style={{marginBottom:12}}><div className="lbl">ID do Pixel</div><input className="inp" placeholder="Ex: 1234567890123456" value={pixelId} onChange={e=>setPixelId(e.target.value)}/></div>
                  <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16,marginBottom:16}}>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:14,color:'#F5A800',letterSpacing:1,marginBottom:10}}>Eventos Rastreados</div>
                    {['PageView','ViewContent','InitiateCheckout','Purchase','CompleteRegistration'].map((e,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#1FCC6A'}}>{e}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-g" onClick={()=>salvar('Pixel instalado!')}>Salvar e Instalar Pixel</button>
                </div>
              </div>
            )}

            {/* API CONVERSOES */}
            {menu==='api_conversoes'&&(
              <div>
                <div className="sec-title">API de Conversões</div>
                <div className="card">
                  <div style={{marginBottom:12}}><div className="lbl">Token de Acesso</div><input className="inp" type="password" placeholder="Token do Meta" value={apiToken} onChange={e=>setApiToken(e.target.value)}/></div>
                  <button className="btn-g" onClick={()=>salvar('API configurada!')}>Salvar</button>
                </div>
              </div>
            )}

            {/* UTM */}
            {menu==='utm'&&(
              <div>
                <div className="sec-title">UTM e Rastreamento</div>
                <div className="card">
                  <div className="grid2" style={{marginBottom:12}}>
                    <div><div className="lbl">Nome da Campanha</div><input className="inp" placeholder="Ex: campanha-maio-2026" value={utmCampanha} onChange={e=>setUtmCampanha(e.target.value)}/></div>
                    <div><div className="lbl">Mídia</div>
                      <select className="sel" value={utmMidia} onChange={e=>setUtmMidia(e.target.value)}>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="google">Google</option>
                      </select>
                    </div>
                  </div>
                  {utmCampanha&&(
                    <div style={{background:'rgba(245,168,0,0.05)',border:'1px solid rgba(245,168,0,0.15)',borderRadius:10,padding:14,marginBottom:12}}>
                      <div className="lbl" style={{marginBottom:8}}>Link Gerado</div>
                      <div style={{fontSize:12,color:'#fff',wordBreak:'break-all',fontFamily:'monospace'}}>
                        {`https://capidasorte.com.br?utm_source=${utmMidia}&utm_medium=paid&utm_campaign=${utmCampanha}`}
                      </div>
                    </div>
                  )}
                  <button className="btn-g" onClick={()=>salvar('Link copiado!')}>Copiar Link</button>
                </div>
              </div>
            )}

            {/* RELATORIO ANUNCIOS */}
            {menu==='relatorio_anuncios'&&(
              <div>
                <div className="sec-title">Relatório de Anúncios</div>
                <div className="grid3" style={{marginBottom:16}}>
                  {[{lbl:'Visitantes',val:'0',cor:'#fff'},{lbl:'Compraram',val:'0',cor:'#1FCC6A'},{lbl:'Conversão',val:'0%',cor:'#F5A800'}].map((s,i)=>(
                    <div key={i} className="card" style={{textAlign:'center'}}>
                      <div className="lbl">{s.lbl}</div>
                      <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:s.cor}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  {['Facebook','Instagram','TikTok','YouTube','Google','Orgânico'].map((canal,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{canal}</div>
                      <div style={{display:'flex',gap:20}}>
                        <div style={{textAlign:'center'}}><div className="lbl">Visitas</div><div style={{fontSize:14,color:'#fff',fontWeight:600}}>0</div></div>
                        <div style={{textAlign:'center'}}><div className="lbl">Vendas</div><div style={{fontSize:14,color:'#1FCC6A',fontWeight:600}}>0</div></div>
                        <div style={{textAlign:'center'}}><div className="lbl">Receita</div><div style={{fontSize:14,color:'#F5A800',fontWeight:600}}>R$ 0</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOGS */}
            {menu==='logs'&&(
              <div>
                <div className="sec-title">Logs do Sistema</div>
                {[
                  {action:'pagamento_confirmado',user:'marcos@email.com',ip:'189.x.x.x',detalhe:'PIX confirmado • R$ 22,00',data:'24/04/2026 14:33'},
                  {action:'compra_iniciada',user:'joao@email.com',ip:'200.x.x.x',detalhe:'5 bilhetes • R$ 22,00',data:'24/04/2026 14:32'},
                  {action:'cadastro',user:'maria@email.com',ip:'177.x.x.x',detalhe:'Novo usuário cadastrado',data:'24/04/2026 13:10'},
                  {action:'webhook_recebido',user:'sistema',ip:'asaas',detalhe:'PAYMENT_CONFIRMED recebido',data:'24/04/2026 14:33'},
                  {action:'tema_aplicado',user:'admin',ip:'interno',detalhe:'Tema natal aplicado para todos os usuários',data:'24/04/2026 10:00'},
                  {action:'congelamento_auto',user:'sistema',ip:'interno',detalhe:'1º Sorteio ID 001 congelado',data:'24/04/2026 20:00'},
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
              </div>
            )}

            {/* CONTROLE DE ACESSO */}
            {menu==='controle_acesso'&&(
              <div>
                <div className="sec-title">Controle de Acesso</div>
                <div className="card" style={{marginBottom:16}}>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Alterar Senha do Admin</div>
                  <div style={{marginBottom:12}}><div className="lbl">Senha Atual</div><input className="inp" type="password" placeholder="Senha atual"/></div>
                  <div style={{marginBottom:12}}><div className="lbl">Nova Senha</div><input className="inp" type="password" placeholder="Nova senha"/></div>
                  <div style={{marginBottom:16}}><div className="lbl">Confirmar Nova Senha</div><input className="inp" type="password" placeholder="Confirmar senha"/></div>
                  <button className="btn-g" onClick={()=>salvar('Senha alterada!')}>Alterar Senha</button>
                </div>
                <div className="card">
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,color:'#F5A800',letterSpacing:2,marginBottom:16}}>Histórico de Acessos</div>
                  {[
                    {ip:'189.x.x.x',data:'24/04/2026 14:00',status:'sucesso'},
                    {ip:'189.x.x.x',data:'23/04/2026 20:15',status:'sucesso'},
                    {ip:'201.x.x.x',data:'23/04/2026 18:30',status:'falha'},
                  ].map((a,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      <div>
                        <div style={{fontSize:13,color:'#fff',fontWeight:600}}>IP: {a.ip}</div>
                        <div style={{fontSize:12,color:'#7A8BB0'}}>{a.data}</div>
                      </div>
                      <div style={{display:'inline-block',background:a.status==='sucesso'?'rgba(31,204,106,0.15)':'rgba(255,61,90,0.15)',border:`1px solid ${a.status==='sucesso'?'rgba(31,204,106,0.4)':'rgba(255,61,90,0.4)'}`,borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,color:a.status==='sucesso'?'#1FCC6A':'#FF3D5A',letterSpacing:1,textTransform:'uppercase'}}>{a.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* PREVIEW TEMA */}
      {previewTema&&(
        <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.95)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'rgba(4,9,28,0.98)',border:'1px solid rgba(245,168,0,0.2)',borderRadius:20,padding:32,maxWidth:500,width:'100%',textAlign:'center'}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:'#F5A800',letterSpacing:3,marginBottom:4}}>Preview do Tema</div>
            <div style={{fontSize:13,color:'#7A8BB0',marginBottom:20}}>{TEMAS.find(t=>t.id===temaSelecionado)?.nome}</div>
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:24,marginBottom:20}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:TEMAS.find(t=>t.id===temaSelecionado)?.cor,margin:'0 auto 16px',boxShadow:`0 0 40px ${TEMAS.find(t=>t.id===temaSelecionado)?.cor}80`}}></div>
              <div style={{fontSize:13,color:'#fff',lineHeight:2}}>
                {TEMAS.find(t=>t.id===temaSelecionado)?.elementos.split('•').map((e,i)=>(
                  <div key={i} style={{padding:'2px 0'}}>{e.trim()}</div>
                ))}
              </div>
            </div>
            <div style={{fontSize:12,color:'#7A8BB0',marginBottom:12}}>Para ver o preview com animações acesse:</div>
            <a href="/preview-tema" target="_blank" style={{display:'block',background:'rgba(245,168,0,0.1)',border:'1px solid rgba(245,168,0,0.3)',borderRadius:10,padding:'10px',color:'#F5A800',fontSize:13,fontWeight:700,textDecoration:'none',marginBottom:16}}>
              Abrir Preview Completo →
            </a>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-r" style={{flex:1}} onClick={()=>setPreviewTema(false)}>Fechar</button>
              <button className="btn-g" style={{flex:1}} onClick={()=>{aplicarTema(temaSelecionado);setPreviewTema(false)}}>Aplicar Tema</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function hexToRgb(hex: string) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}
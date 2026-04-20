// PÁGINA CADASTRO — CRIAR CONTA
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    genero: '',
    email: '',
    telefone: '',
    senha: '',
    confirmar_senha: ''
  })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [aceito, setAceito] = useState(false)

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14)
  }

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15)
  }

  const handleSubmit = async () => {
    setErro('')
    if (!form.nome || !form.cpf || !form.data_nascimento || !form.genero || !form.email || !form.telefone || !form.senha) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }
    if (form.senha !== form.confirmar_senha) {
      setErro('As senhas não coincidem')
      return
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres')
      return
    }
    if (!aceito) {
      setErro('Você precisa aceitar o regulamento para continuar')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf.replace(/\D/g, ''),
          data_nascimento: form.data_nascimento,
          genero: form.genero,
          email: form.email,
          telefone: form.telefone.replace(/\D/g, ''),
          senha: form.senha,
          accepted_terms: aceito
        })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = '/'
      } else {
        setErro(data.error || data.message || 'Erro ao realizar cadastro')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }
        .input-field {
          width:100%;
          padding:14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:10px;
          color:#fff;
          font-size:15px;
          font-family:'Barlow',sans-serif;
          outline:none;
          transition:border .2s;
        }
        .input-field:focus { border-color:#F5A800; }
        .input-field::placeholder { color:#4A5B7A; }
        .select-field {
          width:100%;
          padding:14px 16px;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:10px;
          color:#fff;
          font-size:15px;
          font-family:'Barlow',sans-serif;
          outline:none;
          transition:border .2s;
          cursor:pointer;
          appearance:none;
        }
        .select-field:focus { border-color:#F5A800; }
        .select-field option { background:#0D1F3C; color:#fff; }
        .btn-cadastrar {
          width:100%;
          padding:18px;
          border:none;
          border-radius:12px;
          cursor:pointer;
          font-family:'Barlow',sans-serif;
          font-size:16px;
          font-weight:700;
          letter-spacing:2px;
          text-transform:uppercase;
          background:linear-gradient(135deg,#FFD060,#F5A800,#C88000);
          color:#04091C;
          transition:all .2s;
          box-shadow:0 8px 32px rgba(245,168,0,.3);
          margin-top:8px;
        }
        .btn-cadastrar:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(245,168,0,.5); }
        .btn-cadastrar:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .label { font-size:13px; color:#7A8BB0; font-weight:600; margin-bottom:6px; letter-spacing:1px; display:block; }
        .checkbox-wrap { display:flex; align-items:flex-start; gap:12px; cursor:pointer; }
        .checkbox-wrap input { width:18px; height:18px; min-width:18px; cursor:pointer; accent-color:#F5A800; margin-top:2px; }
        .eye-wrap { position:relative; }
        .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#7A8BB0; padding:0; }
      `}</style>

      <div style={{ minHeight:'100vh', background:'#04091C', padding:'20px 16px 60px', fontFamily:"'Barlow',sans-serif" }}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>

          <div style={{ textAlign:'center', padding:'32px 0 32px' }}>
            <Link href="/" style={{ textDecoration:'none' }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:36, color:'#F5A800', letterSpacing:4, filter:'drop-shadow(0 0 16px rgba(245,168,0,0.4))' }}>
                CAPI DA SORTE
              </div>
            </Link>
            <div style={{ fontSize:13, color:'#7A8BB0', letterSpacing:3, textTransform:'uppercase', marginTop:8, fontWeight:600 }}>
              Criar Conta
            </div>
          </div>

          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(245,168,0,0.15)', borderRadius:20, padding:'28px 24px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

              <div>
                <label className="label">Nome completo *</label>
                <input className="input-field" type="text" placeholder="Seu nome completo" value={form.nome} onChange={e => setForm({...form, nome:e.target.value})} />
              </div>

              <div>
                <label className="label">CPF *</label>
                <input className="input-field" type="text" placeholder="000.000.000-00" value={form.cpf} onChange={e => setForm({...form, cpf:formatCPF(e.target.value)})} />
              </div>

              <div>
                <label className="label">Data de nascimento *</label>
                <input className="input-field" type="date" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento:e.target.value})} style={{ colorScheme:'dark' }} />
              </div>

              <div>
                <label className="label">Gênero *</label>
                <select className="select-field" value={form.genero} onChange={e => setForm({...form, genero:e.target.value})}>
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outros</option>
                </select>
              </div>

              <div>
                <label className="label">E-mail *</label>
                <input className="input-field" type="email" placeholder="seu@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
              </div>

              <div>
                <label className="label">WhatsApp *</label>
                <input className="input-field" type="tel" placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm({...form, telefone:formatTelefone(e.target.value)})} />
              </div>

              <div>
                <label className="label">Senha *</label>
                <div className="eye-wrap">
                  <input className="input-field" type="password" id="senha" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => setForm({...form, senha:e.target.value})} style={{ paddingRight:48 }} />
                  <button className="eye-btn" type="button" onClick={() => {
                    const el = document.getElementById('senha') as HTMLInputElement
                    el.type = el.type === 'password' ? 'text' : 'password'
                  }}>👁</button>
                </div>
              </div>

              <div>
                <label className="label">Confirmar senha *</label>
                <div className="eye-wrap">
                  <input className="input-field" type="password" id="confirmar_senha" placeholder="Repita a senha" value={form.confirmar_senha} onChange={e => setForm({...form, confirmar_senha:e.target.value})} style={{ paddingRight:48 }} />
                  <button className="eye-btn" type="button" onClick={() => {
                    const el = document.getElementById('confirmar_senha') as HTMLInputElement
                    el.type = el.type === 'password' ? 'text' : 'password'
                  }}>👁</button>
                </div>
              </div>

              <label className="checkbox-wrap">
                <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} />
                <span style={{ fontSize:13, color:'#7A8BB0', lineHeight:1.5 }}>
                  Li e aceito o regulamento da Capi da Sorte. Declaro que tenho mais de 18 anos e que os dados informados são verdadeiros.
                </span>
              </label>

              {erro && (
                <div style={{ background:'rgba(255,61,90,0.1)', border:'1px solid rgba(255,61,90,0.3)', borderRadius:10, padding:'12px 16px', color:'#FF3D5A', fontSize:13, fontWeight:600 }}>
                  {erro}
                </div>
              )}

              <button className="btn-cadastrar" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Minha Conta'}
              </button>

            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#7A8BB0' }}>
            Já tem uma conta?{' '}
            <Link href="/login" style={{ color:'#F5A800', fontWeight:700, textDecoration:'none' }}>
              Entrar
            </Link>
          </div>

          <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:'#2A3B5A' }}>
            © 2026 Capi da Sorte • Todos os direitos reservados
          </div>

        </div>
      </div>
    </>
  )
}
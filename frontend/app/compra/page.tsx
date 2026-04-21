'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Campanha {
  id: string
  nome: string
  premio_atual: number
}

interface Pagamento {
  pix_copia_cola: string
  qr_code_image: string
  payment_id: string
}

interface User {
  id: string
  nome: string
  email: string
}

export default function Compra() {
  const [campanha, setCampanha] = useState<Campanha | null>(null)
  const [pacoteSelecionado, setPacoteSelecionado] = useState(5)
  const [loading, setLoading] = useState(false)
  const [pagamento, setPagamento] = useState<Pagamento | null>(null)
  const [status, setStatus] = useState<'escolha' | 'pix' | 'confirmado'>('escolha')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pacotes = [
    { qty: 1, valor: 5, label: null, economia: null },
    { qty: 5, valor: 22, label: 'POPULAR', economia: 3 },
    { qty: 10, valor: 40, label: null, economia: 10 },
    { qty: 20, valor: 70, label: 'MELHOR VALOR', economia: 30 },
  ]

  const pkgAtual = pacotes.find(p => p.qty === pacoteSelecionado) || pacotes[1]

  // Carrega usuário e campanha
  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      window.location.href = '/login'
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = '/login'
      return
    }

    carregarCampanha()
  }, [])

  // Polling automático para verificar pagamento PIX
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

        if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') {
          setStatus('confirmado')
        }
      } catch (err) {
        console.error('Erro no polling de pagamento:', err)
      }
    }, 4000) // verifica a cada 4 segundos

    return () => clearInterval(interval)
  }, [status, pagamento?.payment_id])

  const carregarCampanha = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/campanha-ativa`)
      if (res.ok) {
        const data = await res.json()
        setCampanha(data)
      }
    } catch {
      setError('Erro ao carregar a campanha ativa.')
    }
  }

  const handleComprar = async () => {
    setError(null)
    const token = localStorage.getItem('token')

    if (!token || !campanha) {
      setError('Sessão expirada. Faça login novamente.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase/iniciar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaign_id: campanha.id,
          quantidade: pkgAtual.qty
        })
      })

      const data = await res.json()

      if (res.ok) {
        setPagamento(data)
        setStatus('pix')
      } else {
        setError(data.error || 'Não foi possível gerar o PIX.')
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = () => {
    if (pagamento?.pix_copia_cola) {
      navigator.clipboard.writeText(pagamento.pix_copia_cola)
      alert('✅ Código PIX copiado!')
    }
  }

  const valorPorBilhete = (pkgAtual.valor / pkgAtual.qty).toFixed(2).replace('.', ',')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#04091C; }

        .pkg {
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .pkg:hover {
          border-color: #F5A800 !important;
          transform: translateY(-4px);
        }

        .btn-pix {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #FFD060, #F5A800, #C88000);
          color: #04091C;
          box-shadow: 0 8px 32px rgba(245, 168, 0, 0.3);
          transition: all 0.2s;
        }
        .btn-pix:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-copiar {
          width: 100%;
          padding: 14px;
          border: 2px solid #F5A800;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          font-weight: 700;
          background: transparent;
          color: #F5A800;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .btn-verificar {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          font-weight: 700;
          background: #1FCC6A;
          color: #fff;
          transition: all 0.2s;
          margin-top: 12px;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#04091C', padding: '20px 16px 80px', fontFamily: "'Barlow', sans-serif", color: '#fff' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ 
                fontFamily: "'Bebas Neue', cursive", 
                fontSize: 38, 
                color: '#F5A800', 
                letterSpacing: 4, 
                filter: 'drop-shadow(0 0 16px rgba(245,168,0,0.5))' 
              }}>
                CAPI DA SORTE
              </div>
            </Link>
          </div>

          {/* Erro */}
          {error && (
            <div style={{
              background: 'rgba(255, 61, 90, 0.15)',
              border: '1px solid #FF3D5A',
              color: '#FF6B85',
              padding: '14px 16px',
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          {/* TELA DE ESCOLHA */}
          {status === 'escolha' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: '#7A8BB0', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                  GARANTIR BILHETES
                </div>
                {user && (
                  <div style={{ fontSize: 17, color: '#fff', marginTop: 8, fontWeight: 700 }}>
                    Olá, {user.nome?.split(' ')[0]}!
                  </div>
                )}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,168,0,0.15)', borderRadius: 20, padding: '24px' }}>

                <div style={{ fontSize: 14, color: '#7A8BB0', fontWeight: 600, marginBottom: 16, letterSpacing: 1 }}>
                  Escolha seu pacote:
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                  {pacotes.map((pkg) => (
                    <div
                      key={pkg.qty}
                      className="pkg"
                      onClick={() => setPacoteSelecionado(pkg.qty)}
                      style={{
                        border: `2px solid ${pacoteSelecionado === pkg.qty ? '#F5A800' : 'rgba(255,255,255,0.12)'}`,
                        background: pacoteSelecionado === pkg.qty ? 'rgba(245,168,0,0.14)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 14,
                        padding: '18px 10px',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      {pkg.label && (
                        <div style={{
                          position: 'absolute',
                          top: -12,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#F5A800',
                          color: '#04091C',
                          fontSize: 9,
                          fontWeight: 900,
                          padding: '4px 10px',
                          borderRadius: 8,
                          whiteSpace: 'nowrap'
                        }}>
                          {pkg.label}
                        </div>
                      )}

                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: '#fff', lineHeight: 1 }}>
                        {pkg.qty}
                      </div>
                      <div style={{ fontSize: 13, color: '#7A8BB0' }}>bilhete{pkg.qty > 1 ? 's' : ''}</div>

                      <div style={{ fontSize: 17, fontWeight: 700, color: '#F5A800', marginTop: 10 }}>
                        R$ {pkg.valor.toFixed(2).replace('.', ',')}
                      </div>

                      {pkg.economia && (
                        <div style={{ fontSize: 11, color: '#1FCC6A', fontWeight: 700, marginTop: 4 }}>
                          economia R$ {pkg.economia}
                        </div>
                      )}

                      <div style={{ fontSize: 12, color: '#7A8BB0', marginTop: 8 }}>
                        R$ { (pkg.valor / pkg.qty).toFixed(2).replace('.', ',') } cada
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ 
                  background: 'rgba(245,168,0,0.08)', 
                  border: '1px solid rgba(245,168,0,0.25)', 
                  borderRadius: 12, 
                  padding: '18px', 
                  textAlign: 'center',
                  marginBottom: 20 
                }}>
                  <div style={{ fontSize: 13, color: '#7A8BB0' }}>Total a pagar</div>
                  <div style={{ 
                    fontFamily: "'Bebas Neue', cursive", 
                    fontSize: 54, 
                    color: '#F5A800', 
                    lineHeight: 1,
                    marginTop: 4 
                  }}>
                    R$ {pkgAtual.valor.toFixed(2).replace('.', ',')}
                  </div>
                </div>

                <button 
                  className="btn-pix" 
                  onClick={handleComprar} 
                  disabled={loading || !campanha}
                >
                  {loading ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
                </button>

                {!campanha && (
                  <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#FF3D5A' }}>
                    Nenhuma campanha ativa no momento.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TELA DO PIX */}
          {status === 'pix' && pagamento && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: '#7A8BB0', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                  PAGAMENTO VIA PIX
                </div>
                <div style={{ fontSize: 15, color: '#fff', marginTop: 8 }}>
                  Escaneie ou copie o código
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(245,168,0,0.15)', 
                borderRadius: 20, 
                padding: '28px 24px',
                textAlign: 'center' 
              }}>

                {pagamento.qr_code_image && (
                  <div style={{ 
                    background: '#fff', 
                    borderRadius: 16, 
                    padding: 20, 
                    display: 'inline-block',
                    marginBottom: 20,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4)'
                  }}>
                    <Image 
                      src={pagamento.qr_code_image} 
                      alt="QR Code PIX" 
                      width={220} 
                      height={220}
                      style={{ borderRadius: 8 }}
                      unoptimized
                    />
                  </div>
                )}

                <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', cursive", color: '#F5A800', marginBottom: 6 }}>
                  R$ {pkgAtual.valor.toFixed(2).replace('.', ',')}
                </div>

                <div style={{ fontSize: 13, color: '#7A8BB0', marginBottom: 20 }}>
                  Pague via PIX • Seus bilhetes serão liberados automaticamente
                </div>

                {pagamento.pix_copia_cola && (
                  <button className="btn-copiar" onClick={copiarCodigo}>
                    Copiar Código PIX
                  </button>
                )}

                <button className="btn-verificar" disabled>
                  Aguardando confirmação automática...
                </button>

                <div style={{ fontSize: 12, color: '#4A5B7A', marginTop: 20 }}>
                  Confirmação automática em até 60 segundos após o pagamento
                </div>
              </div>
            </div>
          )}

          {/* TELA DE CONFIRMAÇÃO */}
          {status === 'confirmado' && (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
              <div style={{ 
                fontFamily: "'Bebas Neue', cursive", 
                fontSize: 42, 
                color: '#1FCC6A', 
                marginBottom: 12 
              }}>
                Pagamento Confirmado!
              </div>
              <div style={{ fontSize: 17, color: '#fff', marginBottom: 8 }}>
                Seus bilhetes foram garantidos com sucesso!
              </div>
              <div style={{ fontSize: 14, color: '#7A8BB0', marginBottom: 40 }}>
                Você receberá seus números no WhatsApp em instantes
              </div>

              <Link 
                href="/" 
                style={{ 
                  display: 'block', 
                  padding: '18px', 
                  borderRadius: 12, 
                  background: 'linear-gradient(135deg, #FFD060, #F5A800)', 
                  color: '#04091C', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  textDecoration: 'none', 
                  letterSpacing: 2, 
                  textTransform: 'uppercase' 
                }}
              >
                Voltar para o Início
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 50, fontSize: 11, color: '#2A3B5A' }}>
            © 2026 Capi da Sorte • Todos os direitos reservados
          </div>

        </div>
      </div>
    </>
  )
}
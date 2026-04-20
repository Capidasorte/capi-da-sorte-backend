import { NextRequest, NextResponse } from 'next/server'

const SENHA_ACESSO = 'capidasorte2026'

export async function POST(request: NextRequest) {
  const { senha } = await request.json()

  if (senha === SENHA_ACESSO) {
    const response = NextResponse.json({ ok: true })
    response.cookies.set('acesso_capi', SENHA_ACESSO, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })
    return response
  }

  return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
}
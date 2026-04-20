import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SENHA_ACESSO = 'capidasorte2026'

export function middleware(request: NextRequest) {
  const senha = request.cookies.get('acesso_capi')?.value

  if (senha === SENHA_ACESSO) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()

  if (url.pathname === '/acesso') {
    return NextResponse.next()
  }

  url.pathname = '/acesso'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
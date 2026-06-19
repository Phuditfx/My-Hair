import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes logic
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register') || 
                      request.nextUrl.pathname.startsWith('/forgot-password') || 
                      request.nextUrl.pathname.startsWith('/update-password')

  if (!user && !isAuthRoute) {
    // If user is not logged in and not on auth route, redirect to login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('Employee_Profile')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const role = profile?.role || 'pending'
    
    // Redirect pending users away from app routes
    const isPendingRoute = request.nextUrl.pathname.startsWith('/pending')
    if (role === 'pending' && !isPendingRoute && !isAuthRoute) {
      const pendingUrl = request.nextUrl.clone()
      pendingUrl.pathname = '/pending'
      return NextResponse.redirect(pendingUrl)
    }

    // Redirect non-pending users away from pending route
    if (role !== 'pending' && isPendingRoute) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
    }

    // Redirect logged-in users away from auth routes
    if (isAuthRoute) {
      if (role === 'pending') {
        const pendingUrl = request.nextUrl.clone()
        pendingUrl.pathname = '/pending'
        return NextResponse.redirect(pendingUrl)
      } else {
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
      }
    }
  }

  return supabaseResponse
}

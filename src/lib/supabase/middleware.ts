import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const FALLBACK_URL = 'https://ewyyaxexigubtwhgfhjn.supabase.co';
  const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eXlheGV4aWd1YnR3aGdmaGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MjQxOTcsImV4cCI6MjA5NzEwMDE5N30.uG-fjN5PBDBzyhuyj_EuzNDG2l3XB5rOb0TBQAW56TM';

  let supabaseUrl = FALLBACK_URL;
  let anonKey = FALLBACK_KEY;

  const supabase = createServerClient(
    supabaseUrl,
    anonKey,
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
                      request.nextUrl.pathname.startsWith('/register')

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

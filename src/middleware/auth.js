const supabase = require('../db')

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.session
    const refreshToken = req.cookies?.refresh

    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    let user = null

    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError) {
      if (!refreshToken) return res.status(401).json({ error: 'Session expired. Please log in again.' })

      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
      if (refreshError || !refreshData?.session) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' })
      }

      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      }
      res.cookie('session', refreshData.session.access_token, { ...cookieOpts, maxAge: 60 * 60 * 1000 })
      res.cookie('refresh', refreshData.session.refresh_token, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 })
      user = refreshData.user
    } else {
      user = userData.user
    }

    if (!user) return res.status(401).json({ error: 'Invalid session' })

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'Profile not found. Please complete setup.' })
    }

    if (!profile.tos_agreed) {
      return res.status(403).json({ error: 'tos_required' })
    }

    if (profile.is_suspended) {
      res.clearCookie('session')
      res.clearCookie('refresh')
      return res.status(403).json({ error: 'suspended', message: 'Your account has been suspended. Contact support for assistance.' })
    }

    req.user = { id: user.id, email: user.email, profile }
    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

// Same as authMiddleware but skips the tos_agreed check — used for the agree-tos endpoint itself
const authMiddlewareNoTos = async (req, res, next) => {
  try {
    const token = req.cookies?.session
    const refreshToken = req.cookies?.refresh

    if (!token) return res.status(401).json({ error: 'Not authenticated' })

    let user = null
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError) {
      if (!refreshToken) return res.status(401).json({ error: 'Session expired. Please log in again.' })
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
      if (refreshError || !refreshData?.session) return res.status(401).json({ error: 'Session expired. Please log in again.' })
      const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
      res.cookie('session', refreshData.session.access_token, { ...cookieOpts, maxAge: 60 * 60 * 1000 })
      res.cookie('refresh', refreshData.session.refresh_token, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 * 1000 })
      user = refreshData.user
    } else {
      user = userData.user
    }

    if (!user) return res.status(401).json({ error: 'Invalid session' })

    const { data: profile, error: profileError } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()
    if (profileError || !profile) return res.status(401).json({ error: 'Profile not found. Please complete setup.' })

    req.user = { id: user.id, email: user.email, profile }
    next()
  } catch (err) {
    console.error('Auth middleware error:', err.message)
    res.status(401).json({ error: 'Authentication failed' })
  }
}

const adminMiddleware = async (req, res, next) => {
  if (!req.user?.profile?.is_admin) {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { authMiddleware, authMiddlewareNoTos, adminMiddleware }

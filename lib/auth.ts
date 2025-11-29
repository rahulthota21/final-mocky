import { supabase } from './supabase'

export const signUp = async (email: string, password: string, name: string, role: 'recruiter' | 'student') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role
        }
      }
    })

    if (error) throw error

    if (data.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          user_id: data.user.id,
          email,
          name,
          role
        })

      if (dbError) throw dbError

      return { 
        data: { 
          user: data.user,
          profile: {
            user_id: data.user.id,
            email,
            name,
            role
          }
        }, 
        error: null 
      }
    }

    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', data.user.id)
        .single()

      if (profileError) throw profileError

      return { data: { ...data, profile }, error: null }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()
        
      if (profileError) return { user: null, error: profileError }
      
      return { user: profile, error: null }
    }

    return { user: null, error: null }
  } catch (error) {
    return { user: null, error }
  }
}
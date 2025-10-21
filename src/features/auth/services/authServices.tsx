import { googleLogout } from '@react-oauth/google'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { supabase } from '@/shared/lib/supabase'
import type { User, UserType } from '@/features/auth/contexts/UserContext'
import { saveCachedImage } from '@/shared/utils/fileUtils'

export interface GoogleProfile {
  googleIdToken: string
  email: string
  user_name: string
  user_type?: UserType
  profile_picture_url?: string
}

interface LoginResponse {
  token?: string | null
  user: User | null
  error: string | null
}

export const authServices = {
  /**
   * Sign in an existing user with email and password
   */
  GetOrRegisterAccount: async (
    profile: GoogleProfile
  ): Promise<LoginResponse> => {
    try {
      console.log('[authServices] GetOrRegisterAccount called with:', profile)

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: profile.googleIdToken
        })

      if (signInError) return { user: null, error: signInError.message }

      const session = signInData.session
      const supabaseUser = signInData.user
      if (!session || !supabaseUser)
        return { user: null, token: null, error: 'No session returned' }

      const authoritativeEmail = supabaseUser.email ?? profile?.email ?? null

      if (!authoritativeEmail) {
        return {
          user: null,
          token: null,
          error: 'No email available from identity provider'
        }
      }

      if (profile?.user_type && profile.user_type !== 'User') {
        await supabase.auth.updateUser({
          data: { app_metadata: { role: profile.user_type } }
        })
      }

      // Download and save profile picture if available
      let localProfilePicturePath: string | null = null
      if (profile?.profile_picture_url) {
        const savedFileName = await saveCachedImage(
          profile.profile_picture_url,
          'profilePicture',
          'cache/images'
        )
        if (savedFileName) {
          localProfilePicturePath = `cache/images/${savedFileName}`
        }
      }

      const newUserRow = {
        user_id: supabaseUser.id,
        user_name:
          profile?.user_name ?? supabaseUser.user_metadata?.name ?? 'New User',
        email: authoritativeEmail,
        profile_picture_url:
          profile?.profile_picture_url ??
          supabaseUser.user_metadata?.avatar_url ??
          null,
        user_type: profile?.user_type ?? 'User',
        last_login: new Date().toISOString()
      }

      const { data: userRow, error: upsertErr } = await supabase
        .from('user_table')
        .upsert(newUserRow, { onConflict: 'user_id' })
        .select()
        .single()

      if (upsertErr)
        return { user: null, token: null, error: upsertErr.message }

      return { user: userRow, token: session.access_token, error: null }
    } catch (error) {
      console.error('[authServices] Register exception:', error)
      return { user: null, token: null, error: 'Registration failed' }
    }
  },

  /**
   * Logout the current user
   */
  Logout: async (): Promise<{ error: string | null }> => {
    try {
      // 1. Sign out from Supabase
      const { error: supabaseError } = await supabase.auth.signOut()

      if (supabaseError) {
        console.error('[authServices] Logout supabase error:', supabaseError)
        return { error: supabaseError.message }
      }
      try {
        googleLogout()
      } catch (googleError) {
        console.log(
          '[authServices] Google logout not needed or failed:',
          googleError
        )
      }
      try {
        await SocialLogin.logout({ provider: 'google' })
      } catch (socialError) {
        console.log(
          '[authServices] Social logout not needed or failed:',
          socialError
        )
      }
      return { error: null }
    } catch (error) {
      console.error('[authServices] Logout exception:', error)
      return { error: 'Logout failed' }
    }
  }
}

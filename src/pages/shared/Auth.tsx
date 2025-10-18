import React, { useCallback, useState } from 'react'
import { IonPage, IonContent, IonToast, IonButton } from '@ionic/react'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import { usePreloadNavigation } from '@/hooks/usePreloadNavigation'
import LoadingScreen from './LoadingScreen'
import type { CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import AdminBuilding from '@/assets/umak-admin-building.jpg'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { Capacitor } from '@capacitor/core'
// import { Preferences } from '@capacitor/preferences'

const Auth: React.FC = () => {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { navigateWithPreload, loading } = usePreloadNavigation()
  const isWeb = Capacitor.getPlatform() === 'web'

  const handleSocialLogin = useCallback(async () => {
    try {
      const googleMobileClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      await SocialLogin.initialize({
        google: {
          webClientId: googleMobileClientId || '',
          mode: 'online'
        }
      })
      const res = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['profile', 'email'] }
      })
      console.log('Social login response:', res)
      navigateWithPreload('/user/home')
    } catch (error) {
      console.error('Social login failed:', error)
      setToastMessage('Google sign-in failed.')
      setShowToast(true)
    }
  }, [])

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received')
      }
      // The credential is a JWT token from Google
      const token = credentialResponse.credential
      const decoded = jwtDecode<{
        email: string
        name: string
        picture: string
        sub: string
      }>(token)

      console.log('User info:', decoded)
      // TODO: Send this token to your backend for verification
      // Example:
      // const response = await fetch('YOUR_BACKEND_URL/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token })
      // })
      // const data = await response.json()

      // For now, store the token locally
      //   await Preferences.set({
      //     key: 'authToken',
      //     value: token
      //   })

      // Optional: Decode and store user info
      // const decoded = jwtDecode(token)
      // await Preferences.set({
      //   key: 'userInfo',
      //   value: JSON.stringify(decoded)
      // })

      // Navigate to home
      googleLogout()
      navigateWithPreload('/user/home')
    } catch (error) {
      console.error('Google sign-in error:', error)
      setToastMessage('Sign-in failed. Please try again.')
      setShowToast(true)
    }
  }

  const handleGoogleError = () => {
    console.error('Google sign-in failed')
    setToastMessage('Sign-in failed. Please try again.')
    setShowToast(true)
  }

  return (
    <IonPage>
      {/* Loading overlay while preloading user/home in background */}
      {loading && <LoadingScreen />}

      {/* Full-bleed background image */}
      <IonContent fullscreen className='relative !bg-transparent'>
        <img
          src={AdminBuilding}
          aria-hidden='true'
          className='absolute inset-0 object-cover w-full h-full'
        />
        <div
          className='absolute inset-0 bg-gradient-to-b from-umak-blue to-[rgba(0,0,0,0.6)]'
          aria-hidden
        />

        {/* centered stack */}
        <div className='relative z-[1] min-h-screen flex flex-col items-center p-7 text-center'>
          <p className='text-white text-5xl font-extrabold font-default-font tracking-tight mb-3 mt-20'>
            UMatch
          </p>

          <p className='text-white font-default-font text-sm font-regular leading-snug'>
            A place where you look for your <br /> lost and found items
          </p>
          {/* Google Login Button */}
          {isWeb ? (
            <div className='mt-15'>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme='filled_blue'
                size='large'
                text='continue_with'
                shape='square'
                logo_alignment='center'
              />
            </div>
          ) : (
            <div className='mt-15'>
              <IonButton onClick={handleSocialLogin}>
                Login with Google
              </IonButton>
            </div>
          )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          position='top'
          color='danger'
        />
      </IonContent>
    </IonPage>
  )
}

export default Auth

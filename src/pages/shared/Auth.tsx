import React, { useCallback, useState, useEffect } from 'react'
import {
  IonPage,
  IonToast,
  IonImg,
  IonText,
  IonIcon,
  useIonViewDidEnter,
  useIonViewDidLeave
} from '@ionic/react'
import { GoogleLogin, googleLogout } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { arrowForward } from 'ionicons/icons'
import { jwtDecode } from 'jwt-decode'
import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'
import { useNavigation } from '@/hooks/useNavigation'
import AdminBuilding from '@/assets/umak-admin-building.jpg'
import UmakSeal from '@/assets/umak-seal.png'
import OhsoLogo from '@/assets/umak-ohso.png'
import './styles/auth.css'

const Auth: React.FC = () => {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { navigate } = useNavigation()
  const isWeb = Capacitor.getPlatform() === 'web'

  //preloads images
  useEffect(() => {
    const images = [AdminBuilding, UmakSeal, OhsoLogo]
    images.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, [])

  useIonViewDidLeave(() => {
    console.log('Ionic says: left the page')
  })

  useIonViewDidEnter(() => {
    console.log('Ionic says: entered the page')
  })

  const handleSocialLogin = useCallback(async () => {
    try {
      const googleMobileClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      await SocialLogin.initialize({
        google: { webClientId: googleMobileClientId || '', mode: 'online' }
      })
      await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['profile', 'email'] }
      })
      navigate('/user/home', 'auth')
    } catch (error) {
      console.error('Social login failed:', error)
      setToastMessage('Google sign-in failed.')
      setShowToast(true)
    }
  }, [navigate])

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential)
        throw new Error('No credential received')
      const token = credentialResponse.credential
      jwtDecode(token) // optional: keep decode for future use
      googleLogout()
      navigate('/user/home', 'auth')
    } catch (error) {
      console.error('Google sign-in error:', error)
      setToastMessage('Sign-in failed. Please try again.')
      setShowToast(true)
    }
  }

  const handleGoogleError = () => {
    setToastMessage('Sign-in failed. Please try again.')
    setShowToast(true)
  }

  return (
    <IonPage>
      {/* 1) PARENT CONTAINER (no padding) */}
      <div className='flex flex-col h-screen w-full relative overflow-hidden'>
        {/* 2) CHILD #1 — TOP (50% height) : background image with gradient */}
        <div className='relative h-2/3 overflow-hidden'>
          <img
            src={AdminBuilding}
            className='absolute inset-0 h-full w-130 scale-150 object-cover object-center -translate-y-25'
            aria-hidden='true'
          />
          <div className='absolute inset-0 bg-gradient-to-b from-umak-blue/90 to-black/60' />
        </div>

        {/* 2) CHILD #2 — BOTTOM (50% height) : content container */}
        <div className='h-1/2 bottom-0 bg-white absolute w-full rounded-tr-4xl rounded-tl-4xl bg-gradient-to-b from-white/90 to-umak-blue/15'>
          {/* 4) FLEX + JUSTIFY-EVENLY for three sections */}
          <div className='h-full flex flex-col justify-evenly mx-10'>
            {/* 3a) PICTURES CONTAINER */}
            <div className='flex items-center justify-center gap-6'>
              <div className='flex justify-center items-center'>
                <IonImg
                  src={UmakSeal}
                  alt='University of Makati'
                  style={{ width: 120, height: 120 }}
                />
              </div>
              <div className='flex justify-center items-center'>
                <IonImg
                  src={OhsoLogo}
                  alt='UMAK OHSO'
                  style={{ width: 120, height: 120 }}
                />
              </div>
            </div>
            {/* 3b) TEXT CONTAINER */}
            <div className='text-center'>
              <p className='font-default-default text-5xl font-bold tracking-tight text-umak-blue'>
                UMatch
              </p>
              <IonText className='font-default-default text-lg leading-snug font-default-font text-slate-900'>
                <p className='mt-2'>
                  A place where you look for your
                  <br />
                  lost and found items
                </p>
              </IonText>
            </div>

            {/* 3c) BUTTONS CONTAINER */}
            <div className='w-full flex justify-center'>
              {isWeb ? (
                <div className='w-full flex justify-center'>
                  <div className='w-full google-login-button'>
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
                </div>
              ) : (
                <button
                  className='w-full flex justify-center items-center bg-umak-blue! text-white font-default-font! p-4! rounded-lg!'
                  onClick={handleSocialLogin}
                >
                  <p className='mr-3 font-default-font!'>
                    SIGN IN WITH UMAK EMAIL
                  </p>
                  <IonIcon icon={arrowForward} slot='end' />
                </button>
              )}
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          position='top'
          color='danger'
        />
      </div>
    </IonPage>
  )
}

export default Auth

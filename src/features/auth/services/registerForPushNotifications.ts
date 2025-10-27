import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from '@/shared/lib/supabase'

export async function registerForPushNotifications (userId: string ) {
  // register (Capacitor will prompt for permission if needed)
  await PushNotifications.requestPermissions()
  await PushNotifications.register()

  PushNotifications.addListener('registration', async tokenObj => {
    const token = tokenObj.value
    console.log('FCM token:', token)
    // send to your DB (upsert so it updates if changed)
    await supabase.from('device_tokens').upsert({
      user_id: userId,
      token,
      platform: navigator.userAgent.includes('Android') ? 'android' : 'ios',
      updated_at: new Date().toISOString()
    })
  })

  PushNotifications.addListener('registrationError', err => {
    console.error('Registration error', err)
  })

  PushNotifications.addListener('pushNotificationReceived', notif => {
    console.log('pushReceived', notif)
  })
}

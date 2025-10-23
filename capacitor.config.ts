import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.umatch.app',
  appName: 'UMatch',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  server: {
    cleartext: true,
    url: 'http://192.168.1.94:5173/'
  },
  plugins: {
    pushNotifications: {
      presentationOptions: ['alert', 'badge', 'sound']
    }
  }
}

export default config

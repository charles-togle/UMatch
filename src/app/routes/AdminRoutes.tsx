import { Route } from 'react-router-dom'
import { IonTabs, IonRouterOutlet } from '@ionic/react'
import Toolbar from '@/shared/components/Toolbar'
import { home, settings, time, helpCircle } from 'ionicons/icons'
import StaffManagement from '@/features/admin/pages/StaffManagement'
import AddRole from '@/features/admin/pages/AddRole'
import AuditTrail from '@/features/admin/pages/AuditTrail'
import Notifications from '@/features/user/pages/Notifications'

export default function AdminRoutes () {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path='/admin/notifications' render={() => <Notifications />} />
        <Route path='/admin/dashboard' render={() => <>Dashboard</>} />
        <Route path='/admin/audit-trail' render={() => <AuditTrail />} />
        <Route
          path='/admin/staff-management'
          render={() => <StaffManagement />}
        />
        <Route path='/admin/staff/add' render={() => <AddRole />} />
        <Route path='/admin/announce' render={() => <>Announce</>} />
      </IonRouterOutlet>
      <Toolbar
        toolbarItems={[
          {
            icon: home,
            route: '/admin/dashboard',
            text: 'Dashboard'
          },
          {
            icon: time,
            route: '/admin/audit-trail',
            text: 'Audit Trail'
          },
          {
            icon: helpCircle,
            route: '/admin/staff-management',
            text: 'Staff Management'
          },
          {
            icon: settings,
            route: '/admin/announce',
            text: 'Announce'
          }
        ]}
      />
    </IonTabs>
  )
}

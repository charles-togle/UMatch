// components/ProtectedRoute.tsx
import type { ReactNode } from "react";
import { useIonRouter } from "@ionic/react";

export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: ReactNode;
}) {
  const router = useIonRouter();
  const user = { role: "user" };

  if (!user) {
    router.push("/login", "forward", "replace");
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    router.push("/unauthorized", "forward", "replace");
    return null;
  }

  return <>{children}</>;
}

'use client'
import { useAuth } from '@/context/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true);


  useEffect(() => {
    // The AuthProvider is now responsible for the initial check.
    // This effect handles the case where the user state changes (e.g., logout).
    if (user === null) {
      router.replace('/login')
    } else {
      setIsChecking(false);
    }
  }, [user, router])

  if (isChecking) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );
  }

  // If we have a user, we can render the children.
  return <>{children}</>;
}

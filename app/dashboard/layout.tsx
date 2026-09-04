'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNav } from '@/components/dashboard/TopNav';

import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, getIdToken } = useFirebaseAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<{ plan: string; credits: number }>({ plan: 'BASIC', credits: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as any);
        } else {
          const defaultProfile = {
            plan: 'FREE',
            credits: 0,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
          };
          await setDoc(userRef, defaultProfile);
          setProfile(defaultProfile);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userInfo = {
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email,
    image: user.photoURL,
    plan: profile.plan,
    credits: profile.credits,
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={userInfo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav user={userInfo} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

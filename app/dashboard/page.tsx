'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

interface Notice {
  id: string;
  title: string;
  noticeType: string;
  status: string;
  uploadedAt: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  credits: number;
}

export default function DashboardPage() {
  const { user, getIdToken } = useFirebaseAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0, credits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        if (typeof window !== 'undefined') {
          try {
            const localDrafts = JSON.parse(localStorage.getItem('legal_drafts_history') || '[]');
            const formatted = localDrafts.map((d: any) => ({
              id: d.id,
              title: d.title,
              noticeType: d.noticeType,
              status: 'COMPLETED',
              uploadedAt: d.date,
            }));
            setNotices(formatted);
            setStats({
              total: formatted.length,
              completed: formatted.length,
              pending: 0,
              credits: 10,
            });
          } catch {}
        }
        setLoading(false);
        return;
      }
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const noticesRef = collection(db, 'notices');
        const q = query(noticesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedNotices: Notice[] = [];
        let completedCount = 0;
        let pendingCount = 0;
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const notice = {
            id: doc.id,
            title: data.title || '',
            noticeType: data.noticeType || '',
            status: data.status || 'PENDING',
            uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || data.uploadedAt || new Date().toISOString(),
          };
          fetchedNotices.push(notice);
          if (notice.status === 'COMPLETED') completedCount++;
          else if (notice.status === 'GENERATING' || notice.status === 'PENDING') pendingCount++;
        });

        // Sort by uploadedAt descending
        fetchedNotices.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        setNotices(fetchedNotices);
        setStats({
          total: fetchedNotices.length,
          completed: completedCount,
          pending: pendingCount,
          credits: 0,
        });
      } catch (e) {
        console.error('Error fetching notices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {displayName} 👋</p>
        </div>
        <Link href="/dashboard/notices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Notice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Notices', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Notices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices yet. Upload your first legal notice to get started.</p>
              <Link href="/dashboard/notices/new">
                <Button className="mt-4">Upload First Notice</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${
                      notice.status === 'COMPLETED' ? 'bg-green-500' :
                      notice.status === 'GENERATING' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium">{notice.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notice.noticeType} • {new Date(notice.uploadedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/notices/detail?id=${notice.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

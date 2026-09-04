'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';

interface Notice {
  id: string;
  title: string;
  noticeType: string;
  status: string;
  uploadedAt: string;
}

export default function NoticesPage() {
  const { user, getIdToken } = useFirebaseAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      if (!user) return;
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const noticesRef = collection(db, 'notices');
        const q = query(noticesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedNotices: Notice[] = [];
        
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
        });

        // Sort by uploadedAt descending
        fetchedNotices.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        setNotices(fetchedNotices);
      } catch (e) {
        console.error('Error fetching notices:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Notices</h1>
          <p className="text-muted-foreground">All your legal notice responses</p>
        </div>
        <Link href="/dashboard/notices/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Notice</Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Loading notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices yet.</p>
              <Link href="/dashboard/notices/new">
                <Button className="mt-4">Upload Your First Notice</Button>
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
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
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

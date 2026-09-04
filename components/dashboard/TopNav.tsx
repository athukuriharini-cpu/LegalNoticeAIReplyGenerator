import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export function TopNav({ user }: { user: any }) {
  return (
    <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
      <div>
        <h2 className="font-semibold">Legal Notice Response Generator</h2>
        <p className="text-xs text-muted-foreground">AI-powered legal drafts for Indian SMEs</p>
      </div>
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { X, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const NotificationBanner = () => {
  const { data: notifications } = useNotifications();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('dismissedNotifications');
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const activeNotifications = notifications?.filter(
    (notification) => !dismissedIds.includes(notification.id)
  );

  if (!activeNotifications || activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md space-y-2">
      {activeNotifications.slice(0, 3).map((notification) => (
        <Card
          key={notification.id}
          className="p-4 shadow-lg border-primary/20 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground">
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(notification.id)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

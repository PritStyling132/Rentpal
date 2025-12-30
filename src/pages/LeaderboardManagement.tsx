import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/hooks/use-toast';
import { Trophy, RefreshCw, UserPlus } from 'lucide-react';

const LeaderboardManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bulkUserIds, setBulkUserIds] = useState('');
  const [isAddingBulk, setIsAddingBulk] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchVisibility();
  }, [isAdmin, navigate]);

  const fetchVisibility = async () => {
    try {
      const response = await api.get('/admin/section-visibility/leaderboard');
      const data = response.data;
      if (data) {
        setIsVisible(data.isVisible);
      }
    } catch (error) {
      console.error('Error fetching visibility:', error);
    }
  };

  const handleVisibilityToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await api.put('/admin/section-visibility/leaderboard', { isVisible: checked });

      setIsVisible(checked);
      toast({
        title: 'Success',
        description: `Leaderboard section ${checked ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncTopProfiles = async () => {
    setIsSyncing(true);
    try {
      await api.post('/admin/leaderboard/sync-top-profiles');

      toast({
        title: 'Success',
        description: 'Top profiles synced from leaderboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync top profiles',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkAddMembers = async () => {
    if (!bulkUserIds.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter user IDs',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingBulk(true);
    try {
      const userIds = bulkUserIds
        .split('\n')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      const response = await api.post('/admin/leaderboard/bulk-add', { userIds });
      const result = response.data;

      toast({
        title: 'Success',
        description: `Added ${result.addedCount || userIds.length} members to top profiles`,
      });
      setBulkUserIds('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add members',
        variant: 'destructive',
      });
    } finally {
      setIsAddingBulk(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                🏆 Leaderboard Management
              </h1>
              <p className="text-muted-foreground">
                Control leaderboard visibility and sync top profiles
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="space-y-6">
            {/* Visibility Control */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="leaderboard-visible" className="text-lg font-semibold">
                    Show Leaderboard Section
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Toggle to show or hide the leaderboard on the homepage
                  </p>
                </div>
                <Switch
                  id="leaderboard-visible"
                  checked={isVisible}
                  onCheckedChange={handleVisibilityToggle}
                  disabled={isLoading}
                />
              </div>
            </Card>

            {/* Sync Top Profiles */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Sync Top Profiles
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update the "Top 10 Profiles" section with current leaderboard leaders
                  </p>
                </div>
                <Button
                  onClick={handleSyncTopProfiles}
                  disabled={isSyncing}
                  variant="default"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </Card>

            {/* Bulk Add Members */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Bulk Add Leaderboard Members
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add multiple users to top profiles by entering their user IDs (one per line)
                  </p>
                </div>
                <Textarea
                  placeholder="Enter user IDs (one per line)&#10;e.g.,&#10;550e8400-e29b-41d4-a716-446655440000&#10;6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                  value={bulkUserIds}
                  onChange={(e) => setBulkUserIds(e.target.value)}
                  rows={6}
                />
                <Button
                  onClick={handleBulkAddMembers}
                  disabled={isAddingBulk || !bulkUserIds.trim()}
                  variant="default"
                  className="w-full"
                >
                  <UserPlus className={`w-4 h-4 mr-2 ${isAddingBulk ? 'animate-spin' : ''}`} />
                  {isAddingBulk ? 'Adding...' : 'Add Members to Top Profiles'}
                </Button>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">How it works:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Users earn streak points by logging in daily</li>
                <li>• If a user doesn't login for a day, their streak resets to 0</li>
                <li>• Leaderboard ranks users by their current streak</li>
                <li>• Top 10 profiles section automatically syncs on user login</li>
                <li>• You can manually sync using the button above</li>
                <li>• Use bulk add to manually add specific users to top profiles</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardManagement;

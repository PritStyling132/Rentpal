import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useSectionVisibility } from '@/hooks/useTopProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Trophy, Medal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';

const Leaderboard = () => {
  const [page, setPage] = useState(0);
  const limit = 50;
  const { data: visibility } = useSectionVisibility('leaderboard');
  const { data: leaderboardData, isLoading } = useLeaderboard(limit, page * limit);

  if (!visibility?.is_visible) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-muted-foreground">
              Leaderboard is currently not available.
            </p>
          </div>
        </div>
      </>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                🏆 Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Top users ranked by their activity streaks
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {leaderboardData?.data.map((user) => (
                    <Card 
                      key={user.id}
                      className={`transition-all hover:shadow-lg ${
                        user.rank <= 3 ? 'border-primary' : ''
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 text-center">
                              {getRankIcon(user.rank) || (
                                <span className="text-2xl font-bold text-muted-foreground">
                                  #{user.rank}
                                </span>
                              )}
                            </div>
                            <Avatar className="w-16 h-16 border-4 border-gradient-primary">
                              <AvatarImage 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                                alt={user.name} 
                              />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {user.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Longest streak: {user.longest_streak} days
                            </p>
                          </div>

                          <div className="flex items-center gap-2 bg-gradient-primary rounded-full px-4 py-2">
                            <Flame className="w-5 h-5 text-accent" />
                            <span className="text-xl font-bold text-foreground">
                              {user.current_streak}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {leaderboardData && leaderboardData.data.length >= limit && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setPage(page + 1)}
                      variant="outline"
                      size="lg"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;

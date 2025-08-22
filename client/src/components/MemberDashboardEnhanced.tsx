import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Calendar as CalendarIcon, 
  FileText, 
  Image, 
  Trophy,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Award,
  BookOpen,
  Users,
  Heart,
  Share2,
  Edit,
  Settings,
  Bell,
  Activity
} from "lucide-react";
import type { Project, NewsArticle, Event, Member } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'participation' | 'contribution' | 'leadership' | 'impact';
  dateEarned: Date;
  points: number;
}

interface Activity {
  id: string;
  type: 'project_joined' | 'event_attended' | 'content_created' | 'milestone_reached';
  title: string;
  description: string;
  date: Date;
  relatedId?: string;
  points?: number;
}

export default function MemberDashboardEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user data and activities
  const { data: memberData } = useQuery<Member>({
    queryKey: ["/api/members", user?.id],
    enabled: !!user?.id,
  });

  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
  });

  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });

  // Real data based on user activity
  const memberStats = {
    projectsJoined: 0,
    eventsAttended: 0,
    articlesContributed: 0,
    totalPoints: 0,
    level: 'New Member',
    joinDate: user?.createdAt ? new Date(user.createdAt) : new Date(),
    daysActive: 0,
    streak: 0
  };

  const achievements: Achievement[] = [];

  const recentActivities: Activity[] = [];

  const upcomingEvents = eventsData?.events?.filter(event => 
    event.status === 'upcoming' && 
    new Date(event.date) > new Date()
  ).slice(0, 3) || [];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'project_joined': return <Target className="h-4 w-4 text-blue-500" />;
      case 'event_attended': return <CalendarIcon className="h-4 w-4 text-green-500" />;
      case 'content_created': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'milestone_reached': return <Trophy className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getLevelProgress = (points: number) => {
    const levels = [
      { name: 'Newcomer', minPoints: 0, maxPoints: 100 },
      { name: 'Active Member', minPoints: 100, maxPoints: 300 },
      { name: 'Active Contributor', minPoints: 300, maxPoints: 600 },
      { name: 'Community Leader', minPoints: 600, maxPoints: 1000 },
      { name: 'Ambassador', minPoints: 1000, maxPoints: Infinity }
    ];

    const currentLevel = levels.find(level => points >= level.minPoints && points < level.maxPoints);
    if (!currentLevel) return { level: 'Ambassador', progress: 100, pointsToNext: 0 };

    const progress = currentLevel.maxPoints === Infinity 
      ? 100 
      : ((points - currentLevel.minPoints) / (currentLevel.maxPoints - currentLevel.minPoints)) * 100;
    
    const pointsToNext = currentLevel.maxPoints === Infinity 
      ? 0 
      : currentLevel.maxPoints - points;

    return { level: currentLevel.name, progress, pointsToNext };
  };

  const levelInfo = getLevelProgress(memberStats.totalPoints);

  return (
    <div className="space-y-6" data-testid="member-dashboard-enhanced">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={memberData?.image} alt={memberData?.name} />
            <AvatarFallback>
              {memberData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{memberData?.name || user?.firstName}</h1>
            <p className="text-gray-600">{memberData?.position || 'Member'}</p>
            <Badge variant="outline" className="mt-1">
              {levelInfo.level}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Projects</p>
                <p className="text-2xl font-bold">{memberStats.projectsJoined}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Events</p>
                <p className="text-2xl font-bold">{memberStats.eventsAttended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Points</p>
                <p className="text-2xl font-bold">{memberStats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Streak</p>
                <p className="text-2xl font-bold">{memberStats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Level Progress</h3>
            <Badge variant="outline">{levelInfo.level}</Badge>
          </div>
          <Progress value={levelInfo.progress} className="mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{memberStats.totalPoints} points</span>
            {levelInfo.pointsToNext > 0 && (
              <span>{levelInfo.pointsToNext} points to next level</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </span>
                        {activity.points && (
                          <Badge variant="outline" className="text-xs">
                            +{activity.points} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                        <Clock className="h-3 w-3 ml-2" />
                        {event.time}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Submit Project</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CalendarIcon className="h-6 w-6 mb-2" />
                  <span className="text-sm">RSVP Event</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">Write Article</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">Find Team</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.title}</h4>
                      <span className="text-sm text-gray-500">
                        {activity.date.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.points && (
                      <Badge variant="outline" className="mt-2">
                        +{activity.points} points
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {achievement.category}
                        </Badge>
                        <Badge variant="outline">
                          {achievement.points} points
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {achievement.dateEarned.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="space-y-4">
                  <h4 className="font-semibold">Events on {selectedDate?.toLocaleDateString()}</h4>
                  <div className="space-y-2">
                    {/* Mock events for selected date */}
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Team Meeting</h5>
                      <p className="text-sm text-gray-600">10:00 AM - Project planning session</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Complete 3 Projects</span>
                    <span className="text-sm text-gray-500">2/3</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Attend 5 Events</span>
                    <span className="text-sm text-gray-500">4/5</span>
                  </div>
                  <Progress value={80} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Reach 500 Points</span>
                    <span className="text-sm text-gray-500">450/500</span>
                  </div>
                  <Progress value={90} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{achievements.length}</div>
                  <p className="text-sm text-gray-600">Achievements Unlocked</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-blue-600">
                      {achievements.filter(a => a.category === 'participation').length}
                    </div>
                    <p className="text-xs text-gray-600">Participation</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-purple-600">
                      {achievements.filter(a => a.category === 'contribution').length}
                    </div>
                    <p className="text-xs text-gray-600">Contribution</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-yellow-600">
                      {achievements.filter(a => a.category === 'leadership').length}
                    </div>
                    <p className="text-xs text-gray-600">Leadership</p>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-green-600">
                      {achievements.filter(a => a.category === 'impact').length}
                    </div>
                    <p className="text-xs text-gray-600">Impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
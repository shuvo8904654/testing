import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, TrendingUp, Activity, Award, MessageSquare, Calendar, 
  Star, Target, Zap, BarChart3, UserCheck, Clock 
} from 'lucide-react';
import type { Member, User } from '@shared/schema';

interface EngagementMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  averageEngagementScore: number;
  topContributors: Member[];
  engagementTrends: { period: string; score: number }[];
  categoryParticipation: { category: string; count: number }[];
}

interface EnhancedMember extends Member {
  engagementScore?: number;
  lastActive?: Date;
  projectsParticipated?: number;
  eventsAttended?: number;
  articlesWritten?: number;
  engagementLevel?: 'high' | 'medium' | 'low' | 'inactive';
  joinedDaysAgo?: number;
  contributionRank?: number;
}

export default function MemberEngagementTracker() {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [sortBy, setSortBy] = useState('engagement');

  // Fetch members and engagement data
  const { data: membersData, isLoading } = useQuery<EnhancedMember[]>({
    queryKey: ['/api/members'],
  });

  const { data: engagementData } = useQuery<EngagementMetrics>({
    queryKey: ['/api/analytics/engagement'],
  });

  const members = membersData || [];
  const analytics = engagementData;

  // Filter and sort members
  const getFilteredMembers = () => {
    let filtered = members.filter(member => {
      if (selectedLevel !== 'all' && member.engagementLevel !== selectedLevel) {
        return false;
      }
      return true;
    });

    // Apply sorting
    switch (sortBy) {
      case 'engagement':
        filtered.sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0));
        break;
      case 'projects':
        filtered.sort((a, b) => (b.projectsParticipated || 0) - (a.projectsParticipated || 0));
        break;
      case 'events':
        filtered.sort((a, b) => (b.eventsAttended || 0) - (a.eventsAttended || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const aDate = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const bDate = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  };

  const filteredMembers = getFilteredMembers();

  const getEngagementColor = (level?: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEngagementIcon = (level?: string) => {
    switch (level) {
      case 'high': return <Star className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const calculateEngagementProgress = (score: number) => {
    return Math.min(100, Math.max(0, score));
  };

  const formatLastActive = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="loading">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-24 bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="engagement-tracker">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold" data-testid="total-members">
                    {analytics.totalMembers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-eco-green" data-testid="active-members">
                    {analytics.activeMembers}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-eco-green" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-youth-blue" data-testid="new-members">
                    {analytics.newMembersThisMonth}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-youth-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Engagement</p>
                  <p className="text-2xl font-bold text-purple-600" data-testid="avg-engagement">
                    {analytics.averageEngagementScore}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Contributors */}
      {analytics?.topContributors && analytics.topContributors.length > 0 && (
        <Card className="border-2 border-eco-green/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.topContributors.slice(0, 3).map((member, index) => (
                <Card key={member.id} className="relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-yellow-600">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardContent className="p-4 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={member.profileImageUrl || member.image} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1" data-testid={`top-contributor-${index}`}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{member.position}</p>
                    <Badge className={getEngagementColor((member as EnhancedMember).engagementLevel)}>
                      {(member as EnhancedMember).engagementScore || 0}% Engagement
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Member Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Engagement Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger data-testid="level-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Engagement</SelectItem>
                  <SelectItem value="medium">Medium Engagement</SelectItem>
                  <SelectItem value="low">Low Engagement</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger data-testid="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engagement Score</SelectItem>
                  <SelectItem value="projects">Projects Participated</SelectItem>
                  <SelectItem value="events">Events Attended</SelectItem>
                  <SelectItem value="recent">Last Active</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger data-testid="period-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="members-grid">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          filteredMembers.map((member, index) => {
            const engagementScore = member.engagementScore || 0;
            
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" data-testid={`member-name-${index}`}>
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600">{member.position}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <Badge className={getEngagementColor(member.engagementLevel)}>
                        {getEngagementIcon(member.engagementLevel)}
                        <span className="ml-1">{member.engagementLevel || 'N/A'}</span>
                      </Badge>
                      {member.contributionRank && (
                        <Badge variant="outline" className="text-xs">
                          Rank #{member.contributionRank}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm font-bold" data-testid={`engagement-score-${index}`}>
                        {engagementScore}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateEngagementProgress(engagementScore)} 
                      className="w-full"
                      data-testid={`engagement-progress-${index}`}
                    />
                  </div>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-blue-600" data-testid={`projects-${index}`}>
                        {member.projectsParticipated || 0}
                      </p>
                      <p className="text-xs text-gray-600">Projects</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-green-600" data-testid={`events-${index}`}>
                        {member.eventsAttended || 0}
                      </p>
                      <p className="text-xs text-gray-600">Events</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-purple-600" data-testid={`articles-${index}`}>
                        {member.articlesWritten || 0}
                      </p>
                      <p className="text-xs text-gray-600">Articles</p>
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Last active:</span>
                    <span data-testid={`last-active-${index}`}>
                      {formatLastActive(member.lastActive)}
                    </span>
                  </div>

                  {/* Member since */}
                  {member.joinedDaysAgo !== undefined && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Member for:</span>
                      <span data-testid={`member-since-${index}`}>
                        {member.joinedDaysAgo} days
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
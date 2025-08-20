import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Event } from '@shared/schema';

interface EventAnalytics {
  totalEvents: number;
  upcomingEvents: number;
  capacityUtilization: number;
  popularCategories: { category: string; count: number }[];
  urgentEvents: number;
}

interface EnhancedEvent extends Event {
  registrationCount?: number;
  capacityPercentage?: number;
  waitlistCount?: number;
}

export default function EnhancedEventManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  // Fetch events data
  const { data: eventsData, isLoading } = useQuery<{events: EnhancedEvent[], analytics: EventAnalytics}>({
    queryKey: ['/api/events'],
  });

  const events = eventsData?.events || [];
  const analytics = eventsData?.analytics;

  // Filter events
  const getFilteredEvents = () => {
    return events.filter(event => {
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && event.status !== selectedStatus) return false;
      if (selectedUrgency !== 'all' && event.urgency !== selectedUrgency) return false;
      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Update event status mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: any }) => {
      return await apiRequest('PATCH', `/api/events/${eventId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: 'Event Updated',
        description: 'Event has been successfully updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'soon': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'past': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Calendar className="h-4 w-4" />;
      case 'ongoing': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysUntil = (date: Date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="space-y-6" data-testid="event-manager">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold" data-testid="total-events">
                    {analytics.totalEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-eco-green" data-testid="upcoming-events">
                    {analytics.upcomingEvents}
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
                  <p className="text-sm text-gray-600">Capacity Utilization</p>
                  <p className="text-2xl font-bold text-youth-blue" data-testid="capacity-util">
                    {analytics.capacityUtilization}%
                  </p>
                </div>
                <Users className="h-8 w-8 text-youth-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent Events</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="urgent-events">
                    {analytics.urgentEvents}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Event Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Urgency</label>
              <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                <SelectTrigger data-testid="urgency-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="soon">Soon</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4" data-testid="events-list">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new event.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event, index) => {
            const daysUntil = calculateDaysUntil(event.date);
            const capacityPercentage = event.capacityPercentage || 0;
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Event Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(event.status)}
                        <h3 className="text-lg font-semibold" data-testid={`event-title-${index}`}>
                          {event.title}
                        </h3>
                        {event.urgency && (
                          <Badge className={getUrgencyColor(event.urgency)} data-testid={`urgency-${index}`}>
                            {event.urgency}
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{formatDate(event.date)}</span>
                          {daysUntil >= 0 && (
                            <Badge variant="outline" className="text-xs">
                              {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{event.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {event.category}
                        </Badge>
                        <Badge variant="outline">
                          {event.status}
                        </Badge>
                        {event.registrationRequired && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Registration Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Capacity Tracking */}
                    {event.maxParticipants && (
                      <div className="lg:w-64 space-y-3">
                        <div className="text-center">
                          <p className="text-sm font-medium">Capacity</p>
                          <p className="text-2xl font-bold" data-testid={`capacity-${index}`}>
                            {event.registrationCount || 0} / {event.maxParticipants}
                          </p>
                        </div>

                        <Progress 
                          value={capacityPercentage} 
                          className="w-full"
                          data-testid={`capacity-progress-${index}`}
                        />

                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{capacityPercentage.toFixed(0)}% filled</span>
                          <span className={capacityPercentage >= 90 ? 'text-red-600 font-medium' : ''}>
                            {event.maxParticipants - (event.registrationCount || 0)} spots left
                          </span>
                        </div>

                        {event.waitlistCount && event.waitlistCount > 0 && (
                          <div className="text-center">
                            <Badge variant="secondary" data-testid={`waitlist-${index}`}>
                              {event.waitlistCount} on waitlist
                            </Badge>
                          </div>
                        )}

                        {capacityPercentage >= 90 && (
                          <Badge className="w-full justify-center bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Nearly Full
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 lg:w-32">
                      <Select
                        value={event.status}
                        onValueChange={(value) => 
                          updateEventMutation.mutate({
                            eventId: event.id,
                            updates: { status: value }
                          })
                        }
                      >
                        <SelectTrigger data-testid={`status-update-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid={`view-details-${index}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
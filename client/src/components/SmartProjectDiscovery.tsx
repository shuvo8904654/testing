import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, Zap, TrendingUp, Clock, Target, Leaf, Lightbulb, GraduationCap } from 'lucide-react';
import type { Project } from '@shared/schema';

interface ProjectFilters {
  search: string;
  category: string;
  status: string;
  impactLevel: string;
  priorityRange: number[];
  sortBy: 'priority' | 'impact' | 'newest' | 'alphabetical';
}

interface SmartRecommendation {
  project: Project;
  score: number;
  reasons: string[];
}

export default function SmartProjectDiscovery() {
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    category: 'all',
    status: 'all',
    impactLevel: 'all',
    priorityRange: [0, 100],
    sortBy: 'priority',
  });

  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  // Fetch projects data
  const { data: projectsData, isLoading } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ['/api/projects'],
  });

  const projects = projectsData?.projects || [];

  // Smart filtering logic
  const getFilteredProjects = () => {
    let filtered = projects.filter(project => {
      // Search filter
      if (filters.search && !project.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !project.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // Impact level filter
      if (filters.impactLevel !== 'all' && project.impactLevel !== filters.impactLevel) {
        return false;
      }

      // Priority range filter
      const priority = project.priorityScore || 0;
      if (priority < filters.priorityRange[0] || priority > filters.priorityRange[1]) {
        return false;
      }

      return true;
    });

    // Apply sorting
    switch (filters.sortBy) {
      case 'priority':
        filtered.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
        break;
      case 'impact':
        filtered.sort((a, b) => {
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return (impactOrder[b.impactLevel as keyof typeof impactOrder] || 0) - 
                 (impactOrder[a.impactLevel as keyof typeof impactOrder] || 0);
        });
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  };

  // Generate smart recommendations
  useEffect(() => {
    const generateRecommendations = () => {
      const recs: SmartRecommendation[] = projects.map(project => {
        const reasons: string[] = [];
        let score = 50; // Base score

        // High priority projects
        if ((project.priorityScore || 0) >= 80) {
          score += 20;
          reasons.push('High priority project');
        }

        // High impact projects
        if (project.impactLevel === 'high') {
          score += 15;
          reasons.push('High impact potential');
        }

        // Recently created projects
        const daysOld = project.daysActive || 0;
        if (daysOld <= 7) {
          score += 10;
          reasons.push('New project');
        }

        // Environmental category boost
        if (project.category === 'environmental') {
          score += 10;
          reasons.push('Environmental focus');
        }

        // Active status boost
        if (project.status === 'active') {
          score += 15;
          reasons.push('Currently active');
        }

        // Educational projects for youth
        if (project.category === 'educational') {
          score += 8;
          reasons.push('Educational value');
        }

        return { project, score, reasons };
      }).sort((a, b) => b.score - a.score).slice(0, 3);

      setRecommendations(recs);
    };

    if (projects.length > 0) {
      generateRecommendations();
    }
  }, [projects]);

  const filteredProjects = getFilteredProjects();

  const getProjectIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'environmental':
        return <Leaf className="h-5 w-5 text-eco-green" />;
      case 'technology':
        return <Lightbulb className="h-5 w-5 text-youth-blue" />;
      case 'educational':
        return <GraduationCap className="h-5 w-5 text-yellow-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="loading">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-32 bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="project-discovery">
      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-eco-green border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-eco-green" />
              Smart Recommendations
            </CardTitle>
            <p className="text-sm text-gray-600">
              AI-powered project suggestions based on priority, impact, and relevance
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card key={rec.project.id} className="relative overflow-hidden border-eco-green/30">
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-eco-green">
                      {rec.score}% Match
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getProjectIcon(rec.project.category)}
                      <h3 className="font-semibold text-sm" data-testid={`rec-title-${index}`}>
                        {rec.project.title}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {rec.project.description}
                    </p>
                    <div className="space-y-1">
                      {rec.reasons.slice(0, 2).map((reason, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Smart Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger data-testid="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Impact Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Level</label>
              <Select
                value={filters.impactLevel}
                onValueChange={(value) => setFilters(prev => ({ ...prev, impactLevel: value }))}
              >
                <SelectTrigger data-testid="impact-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="low">Low Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Priority Score: {filters.priorityRange[0]} - {filters.priorityRange[1]}
              </label>
              <Slider
                value={filters.priorityRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priorityRange: value }))}
                max={100}
                step={5}
                className="w-full"
                data-testid="priority-slider"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority Score</SelectItem>
                  <SelectItem value="impact">Impact Level</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({
                search: '',
                category: 'all',
                status: 'all',
                impactLevel: 'all',
                priorityRange: [0, 100],
                sortBy: 'priority',
              })}
              data-testid="clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getProjectIcon(project.category)}
                    <span className="text-sm font-medium text-gray-600">
                      {project.category || 'General'}
                    </span>
                  </div>
                  {project.priorityScore && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {project.priorityScore}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-2" data-testid={`project-title-${index}`}>
                  {project.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {project.impactLevel && (
                    <Badge className={getImpactColor(project.impactLevel)}>
                      {project.impactLevel} impact
                    </Badge>
                  )}
                  {project.daysActive && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.daysActive}d active
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
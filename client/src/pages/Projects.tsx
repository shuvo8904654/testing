import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Lightbulb, GraduationCap, Calendar, Handshake } from "lucide-react";
import type { Project } from "@shared/schema";

export default function Projects() {
  const { data: projectsData, isLoading } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
  });

  const projects = projectsData?.projects || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  const getProjectIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'environment':
        return <Leaf className="text-eco-green text-2xl" />;
      case 'innovation':
        return <Lightbulb className="text-youth-blue text-2xl" />;
      case 'education':
        return <GraduationCap className="text-yellow-600 text-2xl" />;
      default:
        return <Leaf className="text-eco-green text-2xl" />;
    }
  };

  const getProjectBgColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'environment':
        return 'bg-gradient-to-br from-eco-green/5 to-eco-green/10';
      case 'innovation':
        return 'bg-gradient-to-br from-youth-blue/5 to-youth-blue/10';
      case 'education':
        return 'bg-gradient-to-br from-yellow-400/5 to-yellow-400/10';
      default:
        return 'bg-gradient-to-br from-eco-green/5 to-eco-green/10';
    }
  };

  const getIconBgColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'environment':
        return 'bg-eco-green/20';
      case 'innovation':
        return 'bg-youth-blue/20';
      case 'education':
        return 'bg-yellow-400/20';
      default:
        return 'bg-eco-green/20';
    }
  };

  return (
    <div className="py-20 bg-white" data-testid="projects-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="page-title">Our Impact</h1>
          <p className="text-xl text-gray-600">
            Transforming communities through action-oriented projects and events
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {projects.map((project, index) => (
            <Card 
              key={project.id} 
              className={`hover-scale ${getProjectBgColor(project.category)}`}
              data-testid={`project-card-${index}`}
            >
              <CardContent className="p-8">
                <div className={`${getIconBgColor(project.category)} p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                  {getProjectIcon(project.category)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`project-title-${index}`}>
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-6" data-testid={`project-description-${index}`}>
                  {project.description}
                </p>
                <div className="flex items-center justify-between">
                  <span 
                    className={`text-sm font-medium ${
                      project.category.toLowerCase() === 'environment' ? 'text-eco-green' :
                      project.category.toLowerCase() === 'innovation' ? 'text-youth-blue' :
                      'text-yellow-600'
                    }`}
                    data-testid={`project-status-${index}`}
                  >
                    {project.completedAt}
                  </span>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                    data-testid={`project-badge-${index}`}
                  >
                    {project.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center" data-testid="upcoming-events-title">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg" data-testid="event-card-olympiad">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-eco-green text-white p-3 rounded-lg mr-4">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900" data-testid="event-title-olympiad">3ZERO Youth Olympiad 2024</h3>
                    <p className="text-gray-600 text-sm" data-testid="event-date-olympiad">December 15-17, 2024</p>
                  </div>
                </div>
                <p className="text-gray-600" data-testid="event-description-olympiad">
                  Three-day event featuring competitions, workshops, and networking sessions for young changemakers.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg" data-testid="event-card-campaign">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-youth-blue text-white p-3 rounded-lg mr-4">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900" data-testid="event-title-campaign">Community Impact Campaign</h3>
                    <p className="text-gray-600 text-sm" data-testid="event-date-campaign">January 2025</p>
                  </div>
                </div>
                <p className="text-gray-600" data-testid="event-description-campaign">
                  Month-long campaign focusing on poverty alleviation and sustainable livelihood creation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

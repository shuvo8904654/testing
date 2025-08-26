import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Mail, 
  Linkedin, 
  Facebook,
  Globe,
  User,
  Award,
  Target,
  Activity
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import type { Member, Project, NewsArticle } from "@shared/schema";

export default function MemberProfile() {
  const [, params] = useRoute("/member/:username");
  const [, setLocation] = useLocation();

  // For now, we'll get member by ID. In a real app, you'd have a username-based endpoint
  const { data: members, isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Find member by username or fallback to name-based matching
  const member = members?.find(m => 
    (m.username && m.username.toLowerCase() === params?.username?.toLowerCase()) ||
    (!m.username && m.name.toLowerCase().replace(/\s+/g, '') === params?.username?.toLowerCase())
  );

  // Fetch member's contributions
  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
    enabled: !!member,
  });

  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
    enabled: !!member,
  });

  // Filter contributions by member (this would be more sophisticated in a real app)
  const memberProjects = projectsData?.projects?.filter(p => 
    p.createdBy === member?.id || p.title.toLowerCase().includes(member?.name.toLowerCase() || '')
  ) || [];

  const memberArticles = newsData?.articles?.filter(a => 
    a.author === member?.name || a.createdBy === member?.id
  ) || [];

  if (membersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Member Not Found</h1>
          <p className="text-gray-600 mb-8">The member profile you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/members")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
        </div>
      </div>
    );
  }

  const joinDate = member.createdAt ? new Date(member.createdAt) : new Date();
  const username = member.username || member.name.toLowerCase().replace(/\s+/g, '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/members")}
            className="text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="text-center pb-6">
                <div className="relative inline-block mb-6">
                  <img
                    src={member.profileImageUrl || '/placeholder-avatar.png'}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder-avatar.png') {
                        target.src = '/placeholder-avatar.png';
                      }
                    }}
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      {member.status === 'approved' ? 'Active' : member.status}
                    </Badge>
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h1>
                <p className="text-lg text-blue-600 font-medium mb-4">{member.role}</p>
                
                <div className="flex items-center justify-center text-gray-500 text-sm mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {format(joinDate, 'MMMM yyyy')}</span>
                </div>

                {/* Social Links */}
                <div className="flex justify-center space-x-3 mb-6 flex-wrap gap-2">
                  {member.social?.linkedin && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(member.social!.linkedin, '_blank')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                  )}
                  {member.social?.facebook && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(member.social!.facebook, '_blank')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                  )}
                  {member.website && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(member.website, '_blank')}
                      className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `mailto:${member.email}`}
                    className="text-gray-600 border-gray-600 hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>

                <Separator className="mb-6" />

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Target className="w-4 h-4 mr-2" />
                      <span>Projects</span>
                    </div>
                    <span className="font-semibold text-gray-900">{memberProjects.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Activity className="w-4 h-4 mr-2" />
                      <span>Articles</span>
                    </div>
                    <span className="font-semibold text-gray-900">{memberArticles.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span>Status</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {member.status === 'approved' ? 'Active Member' : 'Pending'}
                    </span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">About</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {member.bio}
                </p>
              </CardContent>
            </Card>

            {/* Projects Section */}
            {memberProjects.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
                  <p className="text-gray-600">Initiatives and projects by {member.name.split(' ')[0]}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {memberProjects.map((project, index) => (
                      <div key={project.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                          {project.status && (
                            <Badge variant={project.status === 'approved' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{project.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                          {project.category && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="capitalize">{project.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Articles Section */}
            {memberArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Articles</h2>
                  <p className="text-gray-600">Stories and insights shared by {member.name.split(' ')[0]}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {memberArticles.map((article, index) => (
                      <div key={article.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                              <a href={`/news/${article.id}`}>{article.title}</a>
                            </h3>
                            {article.excerpt && (
                              <p className="text-gray-600 mt-2 leading-relaxed">{article.excerpt}</p>
                            )}
                          </div>
                          {article.category && (
                            <Badge variant="outline" className="ml-4">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{format(new Date(article.createdAt), 'MMM d, yyyy')}</span>
                          {article.readCount !== undefined && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{article.readCount} reads</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {memberProjects.length === 0 && memberArticles.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No contributions yet</h3>
                  <p className="text-gray-600">
                    {member.name.split(' ')[0]} hasn't shared any projects or articles yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
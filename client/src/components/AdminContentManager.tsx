import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Image, 
  FileText, 
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { 
  insertProjectSchema, 
  insertNewsArticleSchema, 
  insertEventSchema, 
  insertGalleryImageSchema,
  eventFormSchema,
  type InsertProject,
  type InsertNewsArticle,
  type InsertEvent,
  type InsertGalleryImage,
  type EventFormData
} from "@shared/validation";
import type { Project, NewsArticle, Event, GalleryImage, Member } from "@shared/schema";

export default function AdminContentManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("projects");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch data
  const { data: projectsData } = useQuery<{projects: Project[], analytics: any}>({
    queryKey: ["/api/projects"],
  });
  
  const { data: newsData } = useQuery<{articles: NewsArticle[], analytics: any}>({
    queryKey: ["/api/news"],
  });
  
  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });
  
  const { data: galleryData } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  // Fetch pending content that needs admin approval
  const { data: pendingContent } = useQuery<{
    projects: Project[],
    news: NewsArticle[],
    members: Member[],
    gallery: GalleryImage[]
  }>({
    queryKey: ["/api/pending-content"],
  });

  const projects = projectsData?.projects || [];
  const articles = newsData?.articles || [];
  const events = eventsData?.events || [];
  const gallery = galleryData || [];
  
  // Combine approved content with pending content for admin review
  const allProjects = [...projects, ...(pendingContent?.projects || [])];
  const allArticles = [...articles, ...(pendingContent?.news || [])];
  const allGallery = [...gallery, ...(pendingContent?.gallery || [])];
  const pendingMembers = pendingContent?.members || [];

  // Analytics overview
  const analytics = {
    totalProjects: allProjects.length,
    totalArticles: allArticles.length,
    totalEvents: events.length,
    totalImages: allGallery.length,
    totalMembers: (members?.length || 0) + pendingMembers.length,
    pendingApprovals: [
      ...(pendingContent?.projects || []),
      ...(pendingContent?.news || []),
      ...(pendingContent?.gallery || []),
      ...pendingMembers
    ].length
  };

  return (
    <div className="space-y-6" data-testid="admin-content-manager">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Projects</p>
                <p className="text-2xl font-bold">{analytics.totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Articles</p>
                <p className="text-2xl font-bold">{analytics.totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Events</p>
                <p className="text-2xl font-bold">{analytics.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-2xl font-bold">{analytics.totalImages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm font-medium">Members</p>
                <p className="text-2xl font-bold">{analytics.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">{analytics.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Management</span>
            <CreateContentDialog 
              activeTab={activeTab}
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="projects" data-testid="tab-projects">Projects</TabsTrigger>
              <TabsTrigger value="news" data-testid="tab-news">News</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
              <TabsTrigger value="registrations" data-testid="tab-registrations">Event Registrations</TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery">Gallery</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">Pending Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              <ProjectsManager projects={allProjects} />
            </TabsContent>
            
            <TabsContent value="news" className="space-y-4">
              <NewsManager articles={allArticles} />
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <EventsManager events={events} />
            </TabsContent>
            
            <TabsContent value="registrations" className="space-y-4">
              <EventRegistrationManager />
            </TabsContent>
            
            <TabsContent value="gallery" className="space-y-4">
              <GalleryManager images={allGallery} />
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <PendingContentManager pendingContent={pendingContent} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Projects Manager Component
function ProjectsManager({ projects }: { projects: Project[] }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Project deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/approve-content/project/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Project approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/reject-content/project/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Project rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Projects ({projects.length})</h3>
        <Button size="sm" data-testid="button-add-project">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
      
      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{project.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                    {project.category && (
                      <Badge variant="outline">{project.category}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {project.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveMutation.mutate(project.id.toString())}
                        disabled={approveMutation.isPending}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => rejectMutation.mutate(project.id.toString())}
                        disabled={rejectMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteMutation.mutate(project.id.toString())}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No projects yet. Create your first project to get started.
          </div>
        )}
      </div>
    </div>
  );
}

// News Manager Component
function NewsManager({ articles }: { articles: NewsArticle[] }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/news/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Article deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/approve-content/news/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Article approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/reject-content/news/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Article rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">News Articles ({articles.length})</h3>
        <Button size="sm" data-testid="button-add-article">
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </Button>
      </div>
      
      <div className="grid gap-4">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{article.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                    {article.category && (
                      <Badge variant="outline">{article.category}</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {article.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveMutation.mutate(article.id.toString())}
                        disabled={approveMutation.isPending}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => rejectMutation.mutate(article.id.toString())}
                        disabled={rejectMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteMutation.mutate(article.id.toString())}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No articles yet. Create your first article to share news and updates.
          </div>
        )}
      </div>
    </div>
  );
}

// Events Manager Component
function EventsManager({ events }: { events: Event[] }) {
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Event deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Events ({events.length})</h3>
        <Button size="sm" data-testid="button-add-event">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>
      
      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={event.status === 'upcoming' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                    <Badge variant="outline">{event.category}</Badge>
                    {event.registrationRequired && (
                      <Badge variant="secondary" className="text-xs">Registration Required</Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                  )}
                  {event.maxParticipants && (
                    <p className="text-xs text-gray-500 mt-1">👥 Max {event.maxParticipants} participants</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditEvent(event)}
                    data-testid={`edit-event-${event.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteMutation.mutate(event.id.toString())}
                    disabled={deleteMutation.isPending}
                    data-testid={`delete-event-${event.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No events yet. Create your first event to engage with your community.
          </div>
        )}
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EditEventForm 
              event={editingEvent} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingEvent(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Gallery Manager Component
function GalleryManager({ images }: { images: GalleryImage[] }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/gallery/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Image deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/approve-content/gallery/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Image approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/reject-content/gallery/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Image rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gallery Images ({images.length})</h3>
        <Button size="sm" data-testid="button-add-image">
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <img 
                src={image.imageUrl} 
                alt={image.title}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <h4 className="font-semibold text-sm">{image.title}</h4>
              {image.description && (
                <p className="text-xs text-gray-600 mt-1">{image.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <Badge variant={image.status === 'approved' ? 'default' : 'secondary'}>
                  {image.status}
                </Badge>
                <div className="flex gap-1">
                  {image.status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => approveMutation.mutate(image.id.toString())}
                        disabled={approveMutation.isPending}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => rejectMutation.mutate(image.id.toString())}
                        disabled={rejectMutation.isPending}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteMutation.mutate(image.id.toString())}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {images.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No images yet. Upload your first image to showcase your work.
          </div>
        )}
      </div>
    </div>
  );
}

// Create Content Dialog
function CreateContentDialog({ 
  activeTab, 
  isOpen, 
  onOpenChange 
}: { 
  activeTab: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-content">
          <Plus className="h-4 w-4 mr-2" />
          Create {activeTab.slice(0, -1)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New {activeTab.slice(0, -1)}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {activeTab === 'projects' && <CreateProjectForm onSuccess={() => onOpenChange(false)} />}
          {activeTab === 'news' && <CreateNewsForm onSuccess={() => onOpenChange(false)} />}
          {activeTab === 'events' && <CreateEventForm onSuccess={() => onOpenChange(false)} />}
          {activeTab === 'gallery' && <CreateGalleryForm onSuccess={() => onOpenChange(false)} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Create Project Form
function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      status: "pending",
      createdBy: "admin",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      return apiRequest("POST", "/api/projects", data);
    },
    onSuccess: () => {
      toast({ title: "Project created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onSuccess();
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}

// Create News Form
function CreateNewsForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<InsertNewsArticle>({
    resolver: zodResolver(insertNewsArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      author: "Admin",
      status: "pending",
      createdBy: "admin",
      readCount: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertNewsArticle) => {
      return apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      toast({ title: "Article created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      onSuccess();
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Brief summary..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? "Creating..." : "Create Article"}
        </Button>
      </form>
    </Form>
  );
}

// Create Event Form
function CreateEventForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "workshop",
      registrationRequired: false,
      status: "upcoming",
      createdBy: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      return apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      toast({ title: "Event created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onSuccess();
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="10:00 AM" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registrationRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Registration Required</FormLabel>
                <div className="text-sm text-gray-600">
                  Enable this if participants need to register formally. If disabled, it will be an RSVP-only event.
                </div>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}

// Create Gallery Form
function CreateGalleryForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<InsertGalleryImage>({
    resolver: zodResolver(insertGalleryImageSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      status: "pending",
      createdBy: "admin",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertGalleryImage) => {
      return apiRequest("POST", "/api/gallery", data);
    },
    onSuccess: () => {
      toast({ title: "Image added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      onSuccess();
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? "Adding..." : "Add Image"}
        </Button>
      </form>
    </Form>
  );
}

// Event Registration Manager Component
function EventRegistrationManager() {
  const { toast } = useToast();
  const [activeRegistrationTab, setActiveRegistrationTab] = useState('registrations');

  // Fetch event registrations
  const { data: registrations } = useQuery<any[]>({
    queryKey: ["/api/event-registrations"],
  });

  // Fetch events data to categorize registration vs RSVP events
  const { data: eventsData } = useQuery<{events: Event[], analytics: any}>({
    queryKey: ["/api/events"],
  });

  const events = eventsData?.events || [];
  const allRegistrations = registrations || [];

  // Categorize events
  const registrationEvents = events.filter(event => 
    event.registrationRequired && 
    (event.status === 'upcoming' || event.status === 'ongoing')
  );
  
  const rsvpEvents = events.filter(event => 
    !event.registrationRequired && 
    (event.status === 'upcoming' || event.status === 'ongoing')
  );

  const approveRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return apiRequest("PATCH", `/api/event-registrations/${registrationId}`, { status: 'approved' });
    },
    onSuccess: () => {
      toast({ title: "Registration approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/event-registrations"] });
    },
  });

  const rejectRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return apiRequest("PATCH", `/api/event-registrations/${registrationId}`, { status: 'rejected' });
    },
    onSuccess: () => {
      toast({ title: "Registration rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/event-registrations"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Registration Management</h3>
        <Badge variant="secondary">{allRegistrations.length} total registrations</Badge>
      </div>

      <Tabs value={activeRegistrationTab} onValueChange={setActiveRegistrationTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrations">Registration Events</TabsTrigger>
          <TabsTrigger value="rsvp">RSVP Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration Events ({registrationEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {registrationEvents.length > 0 ? (
                <div className="grid gap-4">
                  {registrationEvents.map((event) => {
                    const eventRegistrations = allRegistrations.filter(reg => reg.eventId === event.id);
                    return (
                      <Card key={event.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{event.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                <span>⏰ {event.time}</span>
                                <span>📍 {event.location}</span>
                                <span>👥 {eventRegistrations.length} registered</span>
                              </div>
                            </div>
                            <Badge variant="default">Registration Required</Badge>
                          </div>
                          
                          {eventRegistrations.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <h5 className="font-medium text-sm mb-2">Recent Registrations:</h5>
                              <div className="space-y-2">
                                {eventRegistrations.slice(0, 3).map((registration) => (
                                  <div key={registration.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                      <span className="font-medium text-sm">{registration.participantName}</span>
                                      <span className="text-xs text-gray-500 ml-2">{registration.email}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      {registration.status === 'registered' && (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => approveRegistrationMutation.mutate(registration.id.toString())}
                                            className="text-green-600 hover:bg-green-50 h-6 px-2"
                                          >
                                            ✓
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => rejectRegistrationMutation.mutate(registration.id.toString())}
                                            className="text-red-600 hover:bg-red-50 h-6 px-2"
                                          >
                                            ✗
                                          </Button>
                                        </>
                                      )}
                                      {registration.status !== 'registered' && (
                                        <Badge variant={registration.status === 'approved' ? 'default' : 'destructive'} className="text-xs">
                                          {registration.status}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="font-medium">No Registration Events</h4>
                  <p className="text-sm">Events requiring registration will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rsvp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">RSVP Events ({rsvpEvents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {rsvpEvents.length > 0 ? (
                <div className="grid gap-4">
                  {rsvpEvents.map((event) => (
                    <Card key={event.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                              <span>⏰ {event.time}</span>
                              <span>📍 {event.location}</span>
                              <span>👥 Quick RSVP</span>
                            </div>
                          </div>
                          <Badge variant="outline">RSVP Only</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="font-medium">No RSVP Events</h4>
                  <p className="text-sm">Quick RSVP events will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{registrationEvents.length}</div>
                  <div className="text-sm text-gray-600">Registration Events</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{rsvpEvents.length}</div>
                  <div className="text-sm text-gray-600">RSVP Events</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{allRegistrations.length}</div>
                  <div className="text-sm text-gray-600">Total Registrations</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Registration Events</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-500 rounded"
                        style={{ width: `${(registrationEvents.length / (registrationEvents.length + rsvpEvents.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{registrationEvents.length}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">RSVP Events</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-green-500 rounded"
                        style={{ width: `${(rsvpEvents.length / (registrationEvents.length + rsvpEvents.length || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{rsvpEvents.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Edit Event Form
function EditEventForm({ event, onSuccess }: { event: Event, onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      time: event.time,
      location: event.location,
      category: event.category,
      registrationRequired: event.registrationRequired,
      maxParticipants: event.maxParticipants || undefined,
      eligibility: event.eligibility || "",
      prizes: event.prizes || "",
      contactInfo: event.contactInfo || "",
      status: event.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/events/${event.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Event updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      onSuccess();
      form.reset();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="10:00 AM" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Participants (optional)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="50" onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="registrationRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Registration Required</FormLabel>
                <div className="text-sm text-gray-600">
                  Enable this if participants need to register formally. If disabled, it will be an RSVP-only event.
                </div>
              </div>
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eligibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eligibility Requirements (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Who can participate..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prizes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prizes/Incentives (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Awards, certificates, recognition..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Information (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder="Contact person, phone, email..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={updateMutation.isPending} className="w-full">
          {updateMutation.isPending ? "Updating..." : "Update Event"}
        </Button>
      </form>
    </Form>
  );
}

// Pending Content Manager Component
function PendingContentManager({ pendingContent }: { 
  pendingContent?: {
    projects: Project[],
    news: NewsArticle[],
    members: Member[],
    gallery: GalleryImage[]
  }
}) {
  const { toast } = useToast();

  const approveContentMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      return apiRequest("POST", `/api/approve-content/${type}/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Content approved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
  });

  const rejectContentMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: number }) => {
      return apiRequest("POST", `/api/reject-content/${type}/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Content rejected successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
  });

  if (!pendingContent) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h4 className="font-medium">No Pending Content</h4>
        <p className="text-sm">All content has been reviewed.</p>
      </div>
    );
  }

  const { projects, news, members, gallery } = pendingContent;
  const totalPending = projects.length + news.length + members.length + gallery.length;

  if (totalPending === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <h4 className="font-medium">No Pending Content</h4>
        <p className="text-sm">All content has been reviewed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pending Content Review</h3>
        <Badge variant="destructive">{totalPending} items need review</Badge>
      </div>

      {/* Pending Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Projects ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{project.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{project.category}</Badge>
                    <span className="text-xs text-gray-500">
                      Submitted on {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => approveContentMutation.mutate({ type: 'project', id: project.id })}
                    disabled={approveContentMutation.isPending}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rejectContentMutation.mutate({ type: 'project', id: project.id })}
                    disabled={rejectContentMutation.isPending}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending News */}
      {news.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending News Articles ({news.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {news.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{article.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{article.author}</Badge>
                    <span className="text-xs text-gray-500">
                      Submitted on {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => approveContentMutation.mutate({ type: 'news', id: article.id })}
                    disabled={approveContentMutation.isPending}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rejectContentMutation.mutate({ type: 'news', id: article.id })}
                    disabled={rejectContentMutation.isPending}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Members */}
      {members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex-1">
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{member.role}</Badge>
                    <span className="text-xs text-gray-500">
                      Applied on {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => approveContentMutation.mutate({ type: 'member', id: member.id })}
                    disabled={approveContentMutation.isPending}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rejectContentMutation.mutate({ type: 'member', id: member.id })}
                    disabled={rejectContentMutation.isPending}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Gallery */}
      {gallery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="h-5 w-5" />
              Pending Gallery Images ({gallery.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {gallery.map((image) => (
              <div key={image.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded">
                <div className="flex-1 flex items-center gap-3">
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">{image.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{image.description}</p>
                    <span className="text-xs text-gray-500">
                      Uploaded on {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => approveContentMutation.mutate({ type: 'gallery', id: image.id })}
                    disabled={approveContentMutation.isPending}
                    className="text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rejectContentMutation.mutate({ type: 'gallery', id: image.id })}
                    disabled={rejectContentMutation.isPending}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
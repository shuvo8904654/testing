import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsArticleSchema, insertProjectSchema, insertGalleryImageSchema } from "@shared/schema";
import type { NewsArticle, Project, GalleryImage } from "@shared/schema";
import { z } from "zod";
import { FileText, FolderOpen, Image, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect, useState } from "react";

const newsFormSchema = insertNewsArticleSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  category: z.string().min(1, "Category is required"),
});

const projectFormSchema = insertProjectSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
});

const galleryFormSchema = insertGalleryImageSchema.extend({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Valid URL is required"),
  description: z.string().min(1, "Description is required"),
});

export default function MemberDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: news = [] } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    enabled: isAuthenticated,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: gallery = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
    enabled: isAuthenticated,
  });

  const newsForm = useForm({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      category: "",
      image: "",
    },
  });

  const projectForm = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "ongoing",
      category: "",
      completedAt: "",
    },
  });

  const galleryForm = useForm({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
    },
  });

  const createNewsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof newsFormSchema>) => {
      return await apiRequest("POST", "/api/news", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      newsForm.reset();
      setActiveDialog(null);
      toast({
        title: "Success",
        description: "News article created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create news article",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      return await apiRequest("POST", "/api/dashboard/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      projectForm.reset();
      setActiveDialog(null);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const createGalleryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof galleryFormSchema>) => {
      return await apiRequest("POST", "/api/dashboard/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      galleryForm.reset();
      setActiveDialog(null);
      toast({
        title: "Success",
        description: "Gallery image added successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add gallery image",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Member Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user?.firstName || user?.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                data-testid="button-home"
              >
                Back to Website
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="news" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 gap-1">
              <TabsTrigger value="news" data-testid="tab-news" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">News & Stories</span>
                <span className="sm:hidden">News</span>
              </TabsTrigger>
              <TabsTrigger value="projects" data-testid="tab-projects" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <FolderOpen className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Projects</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" data-testid="tab-gallery" className="flex-col sm:flex-row text-xs sm:text-sm p-2">
                <Image className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Gallery</span>
                <span className="sm:hidden">Gallery</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                      <CardTitle>News & Stories</CardTitle>
                      <CardDescription>
                        Share inspiring stories and updates from the community
                      </CardDescription>
                    </div>
                    <Dialog open={activeDialog === "news"} onOpenChange={(open) => setActiveDialog(open ? "news" : null)}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-news" className="w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Story
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Create New Story</DialogTitle>
                        </DialogHeader>
                        <Form {...newsForm}>
                          <form onSubmit={newsForm.handleSubmit((data) => createNewsMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={newsForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-news-title" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={newsForm.control}
                              name="excerpt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Excerpt</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={2} data-testid="input-news-excerpt" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={newsForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Content</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={6} data-testid="input-news-content" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={newsForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-news-category">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Success Story">Success Story</SelectItem>
                                      <SelectItem value="Update">Update</SelectItem>
                                      <SelectItem value="Reflection">Reflection</SelectItem>
                                      <SelectItem value="Event">Event</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={newsForm.control}
                              name="image"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-news-image" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setActiveDialog(null)}
                                data-testid="button-cancel-news"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={createNewsMutation.isPending}
                                data-testid="button-submit-news"
                              >
                                {createNewsMutation.isPending ? "Creating..." : "Create Story"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {news.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-news">
                      No stories created yet. Create your first story to get started!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {news.map((article) => (
                        <div key={article.id} className="border rounded-lg p-3 sm:p-4" data-testid={`card-news-${article.id}`}>
                          <h3 className="font-medium mb-2">{article.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>{article.category}</span>
                            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>
                        Track and showcase community projects and initiatives
                      </CardDescription>
                    </div>
                    <Dialog open={activeDialog === "project"} onOpenChange={(open) => setActiveDialog(open ? "project" : null)}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-project">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <Form {...projectForm}>
                          <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={projectForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-project-title" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={4} data-testid="input-project-description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-project-category">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="environment">Environment</SelectItem>
                                      <SelectItem value="education">Education</SelectItem>
                                      <SelectItem value="innovation">Innovation</SelectItem>
                                      <SelectItem value="community">Community</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-project-status">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="planning">Planning</SelectItem>
                                      <SelectItem value="ongoing">Ongoing</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="completedAt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Completion Date/Info (optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="e.g., 2024, Ongoing, Annual Event" data-testid="input-project-completed" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setActiveDialog(null)}
                                data-testid="button-cancel-project"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={createProjectMutation.isPending}
                                data-testid="button-submit-project"
                              >
                                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-projects">
                      No projects created yet. Create your first project to get started!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-3 sm:p-4" data-testid={`card-project-${project.id}`}>
                          <h3 className="font-medium mb-2">{project.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span className="capitalize">{project.category}</span>
                            <span className="capitalize">{project.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gallery</CardTitle>
                      <CardDescription>
                        Add images from events, activities, and community moments
                      </CardDescription>
                    </div>
                    <Dialog open={activeDialog === "gallery"} onOpenChange={(open) => setActiveDialog(open ? "gallery" : null)}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-gallery">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader>
                          <DialogTitle>Add Gallery Image</DialogTitle>
                        </DialogHeader>
                        <Form {...galleryForm}>
                          <form onSubmit={galleryForm.handleSubmit((data) => createGalleryMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={galleryForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-gallery-title" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={galleryForm.control}
                              name="url"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Image URL</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="https://..." data-testid="input-gallery-url" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={galleryForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} rows={3} data-testid="input-gallery-description" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end space-x-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setActiveDialog(null)}
                                data-testid="button-cancel-gallery"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={createGalleryMutation.isPending}
                                data-testid="button-submit-gallery"
                              >
                                {createGalleryMutation.isPending ? "Adding..." : "Add Image"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {gallery.length === 0 ? (
                    <p className="text-center text-gray-500 py-8" data-testid="text-no-gallery">
                      No images added yet. Add your first image to get started!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gallery.map((image) => (
                        <div key={image.id} className="border rounded-lg overflow-hidden" data-testid={`card-gallery-${image.id}`}>
                          <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
                          <div className="p-3">
                            <h3 className="font-medium mb-1">{image.title}</h3>
                            <p className="text-sm text-gray-600">{image.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
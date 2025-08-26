import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HeaderNoticeBoard from "@/components/HeaderNoticeBoard";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Members from "@/pages/Members";
import MemberProfile from "@/pages/MemberProfile";
import Projects from "@/pages/Projects";
import Gallery from "@/pages/Gallery";
import News from "@/pages/News";
import NewsArticle from "@/pages/NewsArticle";
import Join from "@/pages/Join";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import Events from "@/pages/Events";
import AdminDashboard from "@/pages/AdminDashboard";
import MemberDashboard from "@/pages/MemberDashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ApplicationStatus from "@/pages/ApplicationStatus";

function DashboardRouter() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = "/api/login";
    return null;
  }

  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Switch>
        <Route path="/dashboard" component={DashboardRouter} />
        <Route>
          <Navigation />
          <HeaderNoticeBoard />
          <main className="flex-1">
            <div className="page-transition">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/members" component={Members} />
                <Route path="/member/:username" component={MemberProfile} />
                <Route path="/projects" component={Projects} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/news" component={News} />
                <Route path="/news/:id" component={NewsArticle} />
                <Route path="/search" component={Search} />
                <Route path="/events" component={Events} />
                <Route path="/join" component={Join} />
                <Route path="/contact" component={Contact} />
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/admin-dashboard" component={AdminDashboard} />
                <Route path="/member-dashboard" component={MemberDashboard} />
                <Route path="/application-status" component={ApplicationStatus} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
          <Footer />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

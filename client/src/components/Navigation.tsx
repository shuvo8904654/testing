import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Members", href: "/members" },
    { name: "Projects", href: "/projects" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  // Add dashboard links for authenticated users
  const dashboardNavigation = [];
  if (isAuthenticated && user) {
    if (user.role === "admin") {
      dashboardNavigation.push({ name: "Admin Dashboard", href: "/admin-dashboard", icon: Settings });
    } else if (user.role === "member") {
      dashboardNavigation.push({ name: "Member Dashboard", href: "/member-dashboard", icon: User });
    }
  }

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">3Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">3ZERO Club</h1>
                <p className="text-xs text-gray-600">Kurigram</p>
              </div>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} data-testid={`link-${item.name.toLowerCase()}`}>
                <a className={`transition-colors ${
                  isActive(item.href)
                    ? "text-eco-green"
                    : "text-gray-700 hover:text-eco-green"
                }`}>
                  {item.name}
                </a>
              </Link>
            ))}
            {/* Dashboard Links for Authenticated Users */}
            {dashboardNavigation.map((item) => (
              <Link key={item.name} href={item.href} data-testid={`link-dashboard`}>
                <a className={`flex items-center space-x-1 transition-colors ${
                  isActive(item.href)
                    ? "text-eco-green"
                    : "text-gray-700 hover:text-eco-green"
                }`}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.firstName || user?.email}</span>
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline"
                  size="sm"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  variant="outline"
                  size="sm"
                  data-testid="button-login"
                >
                  Login
                </Button>
                <Link href="/join" data-testid="button-join">
                  <Button className="bg-eco-green text-white hover:bg-eco-green-dark">
                    Join Us
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href} data-testid={`mobile-link-${item.name.toLowerCase()}`}>
                      <a 
                        className={`block p-2 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "text-eco-green bg-eco-green/10"
                            : "text-gray-700 hover:text-eco-green hover:bg-gray-100"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                  
                  {/* Mobile Dashboard Links */}
                  {dashboardNavigation.map((item) => (
                    <Link key={item.name} href={item.href} data-testid={`mobile-link-dashboard`}>
                      <a 
                        className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? "text-eco-green bg-eco-green/10"
                            : "text-gray-700 hover:text-eco-green hover:bg-gray-100"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  ))}

                  {/* Mobile Auth Actions */}
                  <div className="border-t pt-4 mt-4">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="px-2">
                          <p className="text-sm text-gray-600">Welcome,</p>
                          <p className="font-medium">{user?.firstName || user?.email}</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setOpen(false);
                            window.location.href = "/api/logout";
                          }}
                          variant="outline"
                          className="w-full"
                          data-testid="mobile-button-logout"
                        >
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          onClick={() => {
                            setOpen(false);
                            window.location.href = "/api/login";
                          }}
                          variant="outline"
                          className="w-full"
                          data-testid="mobile-button-login"
                        >
                          Login
                        </Button>
                        <Link href="/join" data-testid="mobile-button-join">
                          <Button 
                            className="w-full bg-eco-green text-white hover:bg-eco-green-dark"
                            onClick={() => setOpen(false)}
                          >
                            Join Us
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

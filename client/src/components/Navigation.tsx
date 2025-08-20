import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Members", href: "/members" },
    { name: "Projects", href: "/projects" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

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
          </div>

          {/* Join Button */}
          <Link href="/join" data-testid="button-join">
            <Button className="bg-eco-green text-white hover:bg-eco-green-dark">
              Join Us
            </Button>
          </Link>

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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

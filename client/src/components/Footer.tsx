import { Link } from "wouter";
import { Facebook, MessageCircle, Send, Linkedin } from "lucide-react";

export default function Footer() {
  const navigation = [
    { name: "About Us", href: "/about" },
    { name: "Our Team", href: "/members" },
    { name: "Projects", href: "/projects" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">3Z</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">3ZERO Club Kurigram</h3>
                <p className="text-gray-400">ID: 050-009-0023</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              A youth-led organization working towards a world of zero poverty, 
              zero unemployment, and zero net carbon emissions, inspired by Dr. Muhammad Yunus.
            </p>
            <div className="bg-gray-800 rounded-2xl p-6">
              <div className="quote-mark text-eco-green opacity-50 text-2xl">&ldquo;</div>
              <blockquote className="text-gray-300 italic mb-3">
                The poor should be given the chance to unleash their own creativity and their own capacity.
              </blockquote>
              <cite className="text-gray-400 text-sm">— Dr. Muhammad Yunus</cite>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} data-testid={`footer-link-${item.name.toLowerCase().replace(' ', '-')}`}>
                    <a className="text-gray-300 hover:text-eco-green transition-colors">
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-6">Connect With Us</h4>
            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">info@3zerokurigram.org</p>
              <p className="text-gray-300 text-sm">+880 1XX XXX XXXX</p>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors" data-testid="social-facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors" data-testid="social-whatsapp">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors" data-testid="social-telegram">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors" data-testid="social-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 3ZERO Club Kurigram. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Part of the global 3ZERO movement by Dr. Muhammad Yunus
          </p>
        </div>
      </div>
    </footer>
  );
}

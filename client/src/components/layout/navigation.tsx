import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Scale, Gauge, List, ArrowLeftRight, BarChart3, Users, Bell } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Gauge },
    { path: "/inventory", label: "Inventory", icon: List },
    { path: "/assignments", label: "Assignments", icon: ArrowLeftRight },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <nav className="bg-white elevation-1 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="military-blue w-10 h-10 rounded-lg flex items-center justify-center">
              <Scale className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal">ScaleOps</h1>
              <p className="text-xs text-gray-500">v1.0 | USAF Ready</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-military-blue' 
                      : 'text-gray-600 hover:text-military-blue'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {item.label}
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-military-blue p-2 rounded-lg">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 bg-military-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="military-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
                {user ? getInitials(user.firstName, user.lastName) : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-charcoal">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-600 hover:text-military-red"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

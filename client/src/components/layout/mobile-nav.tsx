import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Gauge, List, ArrowLeftRight, BarChart3, Users } from "lucide-react";

export default function MobileNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Gauge },
    { path: "/inventory", label: "Inventory", icon: List },
    { path: "/assignments", label: "Assign", icon: ArrowLeftRight },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/users", label: "Users", icon: Users },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center py-2 px-1 ${
                isActive ? 'text-military-blue' : 'text-gray-600'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

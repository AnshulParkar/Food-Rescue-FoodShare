import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  Calendar, 
  MapIcon, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Truck,
  LineChart,
  BookOpen,
  Heart
} from "lucide-react";

interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  role?: "donor" | "recipient" | "volunteer" | "all";
}

const navigationItems: NavigationItem[] = [
  {
    name: "Overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: "overview",
    role: "all",
  },
  {
    name: "Available Donations",
    icon: <Utensils className="h-4 w-4" />,
    href: "available",
    role: "recipient",
  },
  {
    name: "My Reservations",
    icon: <Calendar className="h-4 w-4" />,
    href: "reserved",
    role: "recipient",
  },
  {
    name: "Create Donation",
    icon: <Utensils className="h-4 w-4" />,
    href: "donate",
    role: "donor",
  },
  {
    name: "Pending Deliveries",
    icon: <Truck className="h-4 w-4" />,
    href: "deliveries",
    role: "volunteer",
  },
  {
    name: "Donation Map",
    icon: <MapIcon className="h-4 w-4" />,
    href: "map",
    role: "all",
  },
  {
    name: "Analytics",
    icon: <LineChart className="h-4 w-4" />,
    href: "analytics",
    role: "all",
  },
  {
    name: "Education",
    icon: <BookOpen className="h-4 w-4" />,
    href: "education",
    role: "all",
  },
  {
    name: "Community",
    icon: <Users className="h-4 w-4" />,
    href: "/community",
    role: "all",
  },
  {
    name: "Settings",
    icon: <Settings className="h-4 w-4" />,
    href: "settings",
    role: "all",
  },
  {
    name: "Campaigns",
    icon: <Heart className="h-4 w-4" />,
    href: "campaigns",
    role: "donor",
  },
  {
    name: "My Campaigns",
    icon: <Heart className="h-4 w-4" />,
    href: "campaigns",
    role: "recipient",
  },
];

function getFilteredNavigation(role: string) {
  return navigationItems.filter(
    (item) => item.role === "all" || item.role === role
  );
}

const DashboardNavigation = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  
  // Handle the current path detection properly for both relative and absolute paths
  const currentPath = (item: NavigationItem) => {
    if (item.href.startsWith('/')) {
      // For absolute paths, check if the current location matches
      return location.pathname === item.href;
    } else {
      // For dashboard routes, check if the last part of the path matches
      const lastPart = pathParts[pathParts.length - 1] || 'overview';
      return lastPart === item.href;
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  // Filter navigation based on user role
  const filteredNavigation = currentUser
    ? getFilteredNavigation(currentUser.role)
    : [];

  return (
    <div className="h-full flex flex-col md:flex-row md:h-auto">
      <div className="flex md:flex-col flex-1 md:space-y-1 p-1 overflow-x-auto md:overflow-y-auto md:w-52">
        <ScrollArea className="md:h-[calc(100vh-12rem)]">
          <div className="flex md:flex-col gap-1 md:pb-0 pb-2">
            {filteredNavigation.map((item) => (
              <Button
                key={item.name}
                variant={currentPath(item) ? "default" : "ghost"}
                className={cn(
                  "justify-start md:w-full",
                  currentPath(item)
                    ? "bg-foodshare-500 hover:bg-foodshare-500/90 text-white"
                    : ""
                )}
                onClick={() => {
                  // Check if the href starts with a slash - if so, navigate to the absolute path
                  if (item.href.startsWith('/')) {
                    navigate(item.href);
                  } else {
                    navigate(`/dashboard/${item.href}`);
                  }
                }}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
                {currentPath(item) && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-auto pt-2 hidden md:block">
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;

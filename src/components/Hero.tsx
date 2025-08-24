
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen pt-28 pb-16 lg:pt-40 hero-gradient overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider text-foodshare-800 uppercase bg-foodshare-100 rounded-full animate-fade-in">
            Donation is only the key to reduce food was te
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Donate Surplus Food <br />
            <span className="text-shimmer animate-text-shimmer">with Those Who Need It</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            FoodShare bridges the gap between food donors and recipients, 
            creating a more sustainable and compassionate community where 
            surplus food finds its way to those who need it most.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-foodshare-500 hover:bg-foodshare-600 text-white transition-colors">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="bg-foodshare-500 hover:bg-foodshare-600 text-white transition-colors">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-foodshare-200 hover:bg-foodshare-50">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 lg:mt-32 max-w-5xl mx-auto animate-blur-in" style={{ animationDelay: '0.4s' }}>
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            {/* <h2>Major food waste in wedding industry</h2> */}
            {/* <p>According to the NGO Feeding India, 10 to 20 per cent of the food served at weddings goes to waste</p> */}
            <img 
              src="https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
              alt="Food donation" 
              className="w-full h-auto object-cover rounded-xl"
              style={{ aspectRatio: '16/9' }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">Live Platform Statistics</p>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold">2,459</p>
                  <p className="text-sm text-gray-300">Meals Shared</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">132</p>
                  <p className="text-sm text-gray-300">Active Donors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">78</p>
                  <p className="text-sm text-gray-300">Communities Served</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-foodshare-200 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-foodshare-300 opacity-20 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;

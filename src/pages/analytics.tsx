import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import Navbar from "@/components/Navbar";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <AnalyticsDashboard />
      </main>
    </div>
  );
} 
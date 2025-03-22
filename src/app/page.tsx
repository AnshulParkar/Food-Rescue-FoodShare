import Link from "next/link";
import { Auth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import {
  BarChart2,
  Clock,
  MapIcon,
  RefreshCcw,
  UtensilsCrossed,
} from "lucide-react";

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Food Sharing Impact
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Monitor donations, analyze trends, and visualize your community impact with our comprehensive analytics dashboard.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/analytics">
                    <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    >
                      <UtensilsCrossed className="mr-2 h-4 w-4" />
                      Make a Donation
                    </Button>
                  </Link>
                </div>
              </div>
              <Auth />
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our analytics dashboard provides everything you need to understand and optimize your food sharing impact.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <BarChart2 className="h-12 w-12 text-primary" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold">Donation Trends</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Visualize donation patterns over time to identify trends and optimize outreach.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <MapIcon className="h-12 w-12 text-primary" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold">Geographic Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      See where donations are concentrated and identify underserved areas.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <Clock className="h-12 w-12 text-primary" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold">Expiry Monitoring</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track which donations are expiring soon to reduce food waste.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center space-y-4">
                  <RefreshCcw className="h-12 w-12 text-primary" />
                  <div className="space-y-2 text-center">
                    <h3 className="font-bold">Real-time Updates</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get up-to-the-minute information about donation status changes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 
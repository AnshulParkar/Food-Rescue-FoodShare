import { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import CampaignTab from '@/components/CampaignTab';

const Community = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Community</h1>
              <p className="text-muted-foreground">
                Connect with the food sharing community
              </p>
            </div>
          </div>

          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="mt-6 space-y-6">
              <CampaignTab />
            </TabsContent>

            <TabsContent value="discussions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discussions</CardTitle>
                  <CardDescription>Join conversations about food sharing and reducing waste</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-10">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">Discussion forum coming soon</p>
                    <Button variant="outline">Get notified when available</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Events</CardTitle>
                  <CardDescription>Discover local food sharing events and volunteering opportunities</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-10">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">Events calendar coming soon</p>
                    <Button variant="outline">Get notified when available</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Community; 
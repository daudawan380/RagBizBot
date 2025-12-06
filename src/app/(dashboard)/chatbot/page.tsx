
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

type UserProfile = {
  id: number;
  company: string;
};

export default function ChatbotPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const chatbotUrl = user?.id ? `http://localhost:3000/${user.id}` : '';

  const copyToClipboard = () => {
    if(!chatbotUrl) return;
    navigator.clipboard.writeText(chatbotUrl).then(() => {
      toast({
        title: "Copied!",
        description: "The chatbot link has been copied to your clipboard.",
      });
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Chatbot Integration</h1>
        <p className="text-muted-foreground">
          Manage and access your company&apos;s unique chatbot.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Chatbot Link</CardTitle>
          <CardDescription>
            This is the unique URL for your company&apos;s support chatbot. Share it with your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-10" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
          ) : chatbotUrl ? (
            <>
            <div className="flex items-center space-x-2">
              <Input type="text" value={chatbotUrl} readOnly />
              <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <a href={chatbotUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Chatbot
              </Button>
            </a>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Could not generate chatbot link. User or company information is missing.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

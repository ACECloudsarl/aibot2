"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { generationsService } from "@/services/GenerationsService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function GenerationsPage() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadGenerations = async () => {
      if (!user) {
        setGenerations([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { generations, error } = await generationsService.getUserGenerations(user.id);
        if (error) throw error;
        
        setGenerations(generations);
      } catch (error) {
        console.error("Error loading generations:", error);
        toast.error("Failed to load your generated images");
      } finally {
        setLoading(false);
      }
    };
    
    loadGenerations();
  }, [user]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        const { error } = await generationsService.deleteGeneration(id);
        if (error) throw error;
        
        setGenerations(prev => prev.filter(g => g.id !== id));
        toast.success("Image deleted");
      } catch (error) {
        console.error("Error deleting generation:", error);
        toast.error("Failed to delete image");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <h1 className="text-2xl font-bold mb-4">Generated Images</h1>
        <p className="text-muted-foreground mb-4">You haven't generated any images yet.</p>
        <Button variant="outline" onClick={() => window.location.href = "/chat"}>
          Go to Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Generated Images</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations.map(generation => (
          <Card key={generation.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <img 
                src={generation.url} 
                alt={generation.prompt} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="p-4">
              <p className="line-clamp-2 text-sm mb-2">{generation.prompt}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {new Date(generation.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open(generation.url, '_blank')}
                  >
                    View
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(generation.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
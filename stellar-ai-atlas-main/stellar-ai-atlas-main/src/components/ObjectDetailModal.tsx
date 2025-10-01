import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ObjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  object: {
    title: string;
    description: string;
    imageUrl: string;
    type?: string;
    keywords?: string[];
    latestNews?: string;
  } | null;
}

export const ObjectDetailModal = ({ isOpen, onClose, object }: ObjectDetailModalProps) => {
  const [summary, setSummary] = useState<string>('');
  const [news, setNews] = useState<string>('');
  const [loading, setLoading] = useState({ summary: false, news: false });

  useEffect(() => {
    if (isOpen && object) {
      fetchAIContent();
    }
  }, [isOpen, object]);

  const fetchAIContent = async () => {
    if (!object) return;

    // If we already have latestNews from AI, use it
    if (object.latestNews) {
      setNews(object.latestNews);
      setLoading(prev => ({ ...prev, news: false }));
    } else {
      setLoading(prev => ({ ...prev, news: true }));
    }

    setLoading(prev => ({ ...prev, summary: true }));
    
    try {
      // Fetch summary
      const { data: summaryData } = await supabase.functions.invoke('ai-astronomy-chat', {
        body: { 
          message: `Tell me about ${object.title}. ${object.description}`,
          type: 'summary'
        }
      });
      if (summaryData?.response) setSummary(summaryData.response);
      setLoading(prev => ({ ...prev, summary: false }));

      // Fetch additional news only if not already provided
      if (!object.latestNews) {
        const { data: newsData } = await supabase.functions.invoke('ai-astronomy-chat', {
          body: { 
            message: `What are the latest discoveries or news about ${object.title} from 2024-2025?`,
            type: 'news'
          }
        });
        if (newsData?.response) setNews(newsData.response);
        setLoading(prev => ({ ...prev, news: false }));
      }
    } catch (error) {
      console.error('Error fetching AI content:', error);
      setLoading({ summary: false, news: false });
    }
  };

  if (!object) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card/95 backdrop-blur-lg border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">{object.title}</DialogTitle>
          <DialogDescription className="flex gap-2 flex-wrap mt-2">
            {object.keywords?.map((keyword, i) => (
              <Badge key={i} variant="secondary" className="bg-secondary/80">
                {keyword}
              </Badge>
            ))}
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          <img
            src={object.imageUrl}
            alt={object.title}
            className="w-full h-full object-cover"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
            <TabsTrigger value="news">Latest News</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScrollArea className="h-[300px] rounded-md border border-border/50 p-4 bg-secondary/20">
              <p className="text-muted-foreground leading-relaxed">{object.description}</p>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary">
            <ScrollArea className="h-[300px] rounded-md border border-border/50 p-4 bg-secondary/20">
              {loading.summary ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="news">
            <ScrollArea className="h-[300px] rounded-md border border-border/50 p-4 bg-secondary/20">
              {loading.news ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{news}</p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

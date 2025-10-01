import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { AstronomicalObjectCard } from "@/components/AstronomicalObjectCard";
import { ObjectDetailModal } from "@/components/ObjectDetailModal";
import { AIChatbot } from "@/components/AIChatbot";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import cosmicHero from "@/assets/cosmic-hero.jpg";

interface AstroObject {
  title: string;
  description: string;
  imageUrl: string;
  type?: string;
  keywords?: string[];
  latestNews?: string;
}

const Index = () => {
  const [objects, setObjects] = useState<AstroObject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedObject, setSelectedObject] = useState<AstroObject | null>(null);
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async (search?: string, pageNum: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-astronomical-objects', {
        body: { query: search, page: pageNum }
      });

      if (error) throw error;

      const objects = data?.objects || [];

      if (pageNum === 0) {
        setObjects(objects);
      } else {
        setObjects(prev => [...prev, ...objects]);
      }
    } catch (error) {
      console.error('Error fetching objects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch astronomical objects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchObjects(searchQuery, 0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchObjects(searchQuery, nextPage);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={cosmicHero}
          alt="Cosmic Space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
            Cosmic Explorer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Discover the wonders of the universe
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-2xl flex gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-full border border-border/50 shadow-[var(--glow-primary)]">
            <Input
              type="text"
              placeholder="Search for stars, planets, galaxies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
            <Button 
              onClick={handleSearch} 
              className="rounded-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Objects Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading && objects.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {objects.map((obj, idx) => (
                <AstronomicalObjectCard
                  key={idx}
                  title={obj.title}
                  description={obj.description}
                  imageUrl={obj.imageUrl}
                  type={obj.type}
                  onClick={() => setSelectedObject(obj)}
                />
              ))}
            </div>

            {objects.length > 0 && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 shadow-[var(--glow-primary)]"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <ObjectDetailModal
        isOpen={!!selectedObject}
        onClose={() => setSelectedObject(null)}
        object={selectedObject}
      />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Index;

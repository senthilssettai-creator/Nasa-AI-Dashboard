import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AstronomicalObjectCardProps {
  title: string;
  description: string;
  imageUrl: string;
  type?: string;
  onClick: () => void;
}

export const AstronomicalObjectCard = ({ 
  title, 
  description, 
  imageUrl, 
  type,
  onClick 
}: AstronomicalObjectCardProps) => {
  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-[var(--glow-primary)] bg-card/80 backdrop-blur-sm border-border/50"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        {type && (
          <Badge className="absolute top-3 right-3 bg-primary/80 backdrop-blur-sm">
            {type}
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

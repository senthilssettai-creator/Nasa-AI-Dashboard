import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, page = 0 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const NASA_API_KEY = Deno.env.get('NASA_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Fetching astronomical objects:', { query, page });

    // Use AI to generate a comprehensive list of astronomical objects
    const prompt = query 
      ? `Generate a JSON array of exactly 20 real astronomical objects related to "${query}". Include: stars, exoplanets, planets, moons, nebulae, galaxies, and other celestial bodies. For each object provide: title, description (50-100 words), type (star/planet/moon/exoplanet/nebula/galaxy/etc), keywords (array of 3-5 terms), and latestNews (recent discovery or fact from 2024-2025). Make it scientifically accurate.`
      : `Generate a JSON array of exactly 20 diverse and fascinating astronomical objects. Include famous stars, exoplanets, planets, moons, nebulae, galaxies, and other celestial bodies. For each object provide: title, description (50-100 words), type, keywords (array of 3-5 terms), and latestNews (recent discovery or fact from 2024-2025). Start from index ${page * 20}.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert astronomer and data provider. Always respond with valid JSON arrays only, no additional text. Each object must have: title, description, type, keywords (array), latestNews.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('AI response received');

    if (!data.choices || !data.choices[0]) {
      throw new Error('No response from AI');
    }

    const content = data.choices[0].message.content;
    let objects = [];
    
    try {
      const parsed = JSON.parse(content);
      objects = parsed.objects || parsed.data || parsed;
      if (!Array.isArray(objects)) {
        objects = [parsed];
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Invalid AI response format');
    }

    // Fetch NASA images for each object
    const enrichedObjects = await Promise.all(
      objects.map(async (obj: any) => {
        try {
          const searchUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(obj.title)}&media_type=image`;
          const imgResponse = await fetch(searchUrl);
          const imgData = await imgResponse.json();
          
          const imageUrl = imgData.collection?.items?.[0]?.links?.[0]?.href || 
                          `https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800`;
          
          return {
            ...obj,
            imageUrl,
            nasa_id: `ai_${obj.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
          };
        } catch (e) {
          console.error('Error fetching NASA image:', e);
          return {
            ...obj,
            imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
            nasa_id: `ai_${obj.title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
          };
        }
      })
    );

    console.log(`Successfully generated ${enrichedObjects.length} astronomical objects`);

    return new Response(JSON.stringify({ objects: enrichedObjects }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-astronomical-objects:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Edge function: Fake News Analysis using AI
// Uses Lovable AI to analyze news articles for credibility

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, source_name } = await req.json();

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide article text to analyze.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Text too short. Please provide a more detailed article or headline.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to analyze the news article
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a fake news detection system. Analyze the given news text and determine if it is REAL or FAKE news. 
            
Consider these factors:
- Sensationalist language and clickbait patterns
- Emotional manipulation tactics
- Lack of specific sources or citations
- Logical inconsistencies
- Use of absolute/extreme language
- Grammar and spelling quality
- Claims without evidence
- Known misinformation patterns

Respond ONLY with valid JSON in this exact format:
{"prediction": "REAL" or "FAKE", "confidence": number between 50-99, "reasoning": "brief explanation"}

The confidence should reflect how certain you are. Higher = more certain.`
          },
          {
            role: 'user',
            content: `Analyze this news text:\n\n${text.substring(0, 3000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let prediction = 'FAKE';
    let confidence = 75;
    let reasoning = 'Analysis completed.';
    
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        prediction = parsed.prediction === 'REAL' ? 'REAL' : 'FAKE';
        confidence = Math.min(99, Math.max(50, Number(parsed.confidence) || 75));
        reasoning = parsed.reasoning || 'Analysis completed.';
      }
    } catch {
      // Fallback: check for keywords
      if (content.toLowerCase().includes('"real"') || content.toLowerCase().includes('prediction": "real')) {
        prediction = 'REAL';
      }
    }

    const probabilityScore = confidence / 100;

    // Store prediction in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract headline (first line or first 100 chars)
    const headline = text.split('\n')[0].substring(0, 100);

    await supabase.from('predictions').insert({
      article_text: text.substring(0, 5000),
      headline,
      source_name: source_name || null,
      prediction,
      confidence,
      probability_score: probabilityScore,
    });

    // Update source reliability if source provided
    if (source_name && source_name.trim()) {
      const { data: existingSource } = await supabase
        .from('sources')
        .select('*')
        .eq('name', source_name.trim())
        .single();

      if (existingSource) {
        const newTotal = existingSource.total_checks + 1;
        const newFake = prediction === 'FAKE' ? existingSource.fake_count + 1 : existingSource.fake_count;
        const reliability = ((newTotal - newFake) / newTotal) * 100;

        await supabase.from('sources').update({
          total_checks: newTotal,
          fake_count: newFake,
          reliability_score: Math.round(reliability * 100) / 100,
          is_unreliable: reliability < 50,
          updated_at: new Date().toISOString(),
        }).eq('name', source_name.trim());
      } else {
        await supabase.from('sources').insert({
          name: source_name.trim(),
          total_checks: 1,
          fake_count: prediction === 'FAKE' ? 1 : 0,
          reliability_score: prediction === 'FAKE' ? 0 : 100,
          is_unreliable: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        prediction,
        confidence,
        probability_score: probabilityScore,
        reasoning,
        source_name: source_name || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze the article. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

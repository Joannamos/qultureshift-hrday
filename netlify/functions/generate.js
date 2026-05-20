exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { name, author, responses } = body;
    const fn = name.split(' ')[0];

    const prompt = `You are a warm, eloquent writer creating a personalised storybook page for HR professional ${name} for International HR Day at Qultureshift. The storybook is titled "You Empowered Us to Lead Change."

Colleague (${author}) shared these responses about ${fn}:
1. Three impact words: "${responses.q1 || 'kind, dedicated, inspiring'}"
2. Memorable moment: "${responses.q2 || 'They were always there when I needed guidance.'}"
3. How they helped me grow: "${responses.q3 || 'They helped me see my potential.'}"
4. Heartfelt message: "${responses.q4 || 'Thank you for everything you do.'}"

Write a flowing narrative storybook page (3-4 rich paragraphs) for ${fn} that opens with a vivid scene from the memory, weaves the three words naturally in, includes the growth reflection movingly, and ends with the heartfelt message as a poetic closing. Warm, sincere, specific - never generic. Mostly third person, shifting to first for the closing. Format each paragraph with a <p> tag.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const story = data.content?.map(b => b.text || '').join('') || `<p>A story of gratitude for ${name}.</p>`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let ideaText = '';
  try {
    const { idea } = await req.json();
    ideaText = typeof idea === 'string' ? idea.substring(0, 200) : '';

    if (!idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }

    const systemPrompt = `Ти — CheckIt AI, експерт з аналізу бізнес-ідей.
Твоє завдання — згенерувати 3 важливі уточнюючі запитання щодо запропонованої ідеї, які допоможуть краще зрозуміти бізнес-модель, цільову аудиторію або унікальність.

Поверни ТІЛЬКИ валідний JSON у такому форматі:
{
  "questions": [
    {
      "question": "<текст запитання українською>",
      "options": ["<варіант 1>", "<варіант 2>", "<варіант 3>"],
      "allowCustom": true
    }
  ]
}

У масиві має бути рівно 3 запитання. Для кожного генеруй 3 або 4 варіанти відповідей. Усі запитання та відповіді мають бути чіткі, лаконічні та стосуватися безпосередньо ідеї користувача.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Бізнес-ідея: "${idea}"` },
        ],
        max_tokens: 1500,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error (questions):', response.status, errorData);
      return NextResponse.json({ error: 'AI service error' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('No JSON found in questions response:', jsonStr.substring(0, 500));
        return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
      }
      parsed = JSON.parse(match[0]);
    }

    logEvent({ type: 'questions', userEmail: null, idea: ideaText, tool: null, success: true, durationMs: Date.now() - startTime, error: null });
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Error generating questions:', error);
    logEvent({ type: 'questions', userEmail: null, idea: ideaText, tool: null, success: false, durationMs: Date.now() - startTime, error: String(error).substring(0, 300) });
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { logEvent, incrementUserAnalyses } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { idea, tool, answers } = await req.json();

  const toolFocus: Record<string, string> = {
    'market': 'market (ринок)',
    'competitors': 'competitors (конкуренти)',
    'swot': 'risks (ризики) та recommendations (рекомендації) для опису SWOT',
    'financials': 'businessModel (монетизація та фінанси)',
    'audience': 'audience (цільова аудиторія)',
  };

  const extraInstruction = tool && toolFocus[tool] 
    ? `\n\nСПЕЦІАЛЬНИЙ ФОКУС: Користувач застосував інструмент націлений на ${toolFocus[tool]}. Опиши саме цей аспект (відповідне поле) набагато детальніше та професійніше (до 80-100 слів, можна з переліками), даючи глибоку експертну оцінку.` 
    : '';

  let answersContext = '';
  if (answers && answers.length > 0) {
    answersContext = `\n\nДОДАТКОВИЙ КОНТЕКСТ ВІД КОРИСТУВАЧА (Уточнення ідеї):\n${answers.map((a: { question: string; answer: string }) => `Q: ${a.question}\nA: ${a.answer}`).join('\n')}\nВикористай ці відповіді для більш точного та персоналізованого аналізу.`;
  }

  const systemPrompt = `Ти — CheckIt AI, аналітик бізнес-ідей. Проаналізуй ідею та поверни ТІЛЬКИ валідний JSON (без markdown, без коментарів):

{"score":<0-100>,"level":"<Низький|Середній|Високий>","scores":{"innovation":<0-100>,"marketDemand":<0-100>,"feasibility":<0-100>,"monetization":<0-100>},"market":"<опис>","audience":"<опис>","competitors":"<опис>","risks":"<опис>","businessModel":"<опис>","recommendations":["<порада1>","<порада2>","<порада3>","<порада4>"]}

Правила: українською, реалістично, коротко (зазвичай кожне текстове поле до 30 слів), без емодзі.${extraInstruction}${answersContext}`;

  const startTime = Date.now();
  try {
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
        max_tokens: 2000,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error:', response.status, errorData);
      return NextResponse.json({ error: 'AI service error' }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Empty AI response' }, { status: 500 });
    }

    // Clean and parse JSON - Mistral sometimes adds markdown or has minor formatting issues
    let jsonStr = content.trim();
    // Strip markdown code fences if present
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let report;
    try {
      report = JSON.parse(jsonStr);
    } catch {
      // Try to extract JSON from the response
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          report = JSON.parse(match[0]);
        } catch {
          console.error('Failed to parse AI response:', jsonStr.substring(0, 500));
          return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }
      } else {
        console.error('No JSON found in AI response:', jsonStr.substring(0, 500));
        return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 });
      }
    }

    // Add computed color field
    report.color = report.score > 70 ? 'text-success' : report.score > 40 ? 'text-warning' : 'text-red-400';

    logEvent({ type: 'analyze', userEmail: null, idea: typeof idea === 'string' ? idea.substring(0, 200) : '', tool: tool || null, success: true, durationMs: Date.now() - startTime, error: null });
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Analyze API error:', error);
    logEvent({ type: 'analyze', userEmail: null, idea: typeof idea === 'string' ? idea.substring(0, 200) : '', tool: tool || null, success: false, durationMs: Date.now() - startTime, error: String(error).substring(0, 300) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

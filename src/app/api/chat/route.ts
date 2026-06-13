import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { messages, idea, report } = await req.json();

  const systemPrompt = `Ти — AI-аналітик стартапів CheckIt. Ти щойно проаналізував бізнес-ідею користувача.

Контекст ідеї: "${idea}"

Результати аналізу:
- Загальна оцінка: ${report?.score || 'N/A'}/100 (${report?.level || 'N/A'})
- Інноваційність: ${report?.scores?.innovation || 'N/A'}/100
- Попит на ринку: ${report?.scores?.marketDemand || 'N/A'}/100  
- Реалістичність: ${report?.scores?.feasibility || 'N/A'}/100
- Монетизація: ${report?.scores?.monetization || 'N/A'}/100
- Ринок: ${report?.market || 'N/A'}
- Конкуренти: ${report?.competitors || 'N/A'}
- Ризики: ${report?.risks || 'N/A'}
- Бізнес-модель: ${report?.businessModel || 'N/A'}

Правила відповіді:
- Відповідай українською мовою
- НЕ використовуй емодзі взагалі
- Будь конкретним та практичним
- Використовуй структуровані відповіді з абзацами
- Відповідай стисло, але змістовно (2-4 абзаци максимум)
- Якщо питання стосується конкурентів, ринку, монетизації тощо — давай конкретні поради
- Тон: професійний, але дружній`;

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
          ...messages.map((m: { role: string; text: string }) => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.text,
          })),
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mistral API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'AI service error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || 'Вибачте, не вдалося отримати відповідь.';

    logEvent({ type: 'chat', userEmail: null, idea: typeof idea === 'string' ? idea.substring(0, 200) : '', tool: null, success: true, durationMs: Date.now() - startTime, error: null });
    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    logEvent({ type: 'chat', userEmail: null, idea: typeof idea === 'string' ? idea.substring(0, 200) : '', tool: null, success: false, durationMs: Date.now() - startTime, error: String(error).substring(0, 300) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

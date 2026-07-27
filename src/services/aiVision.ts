const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "openrouter/free"; // Универсальный бесплатный маршрутизатор OpenRouter

export type RiskLevel = 'high' | 'medium' | 'low' | 'ok';

export interface DefectMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface Defect {
  id: string;
  code: string;
  title: string;
  category: string;
  risk: RiskLevel;
  x: number;
  y: number;
  description: string;
  consequence: string;
  regulation: string;
  metrics: DefectMetric[];
  recommendation: string;
}

export interface AnalysisResult {
  reportId: string;
  capturedAt: string;
  regulationsChecked: number;
  confidence: number;
  processingMs: number;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
    compliant: boolean;
    topRegulation: string;
  };
  defects: Defect[];
}

interface AnalyzeParams {
  objectId: string;
  block: string;
  floor: string;
  room: string;
  capturedAt: string;
  imageBase64?: string;
}

export async function analyzeFrame(params: AnalyzeParams): Promise<AnalysisResult> {
  const startTime = performance.now();

  try {
    if (!params.imageBase64) {
      throw new Error("Изображение не получено.");
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("Не найден VITE_OPENROUTER_API_KEY в файле .env");
    }

    const base64Data = params.imageBase64.includes(",")
      ? params.imageBase64.split(",")[1]
      : params.imageBase64;

    console.log("Image size for OpenRouter:", base64Data.length);

    const prompt = `
Ты — главный инспектор контроля качества строительства BI Group.

СТРОГОЕ ТРЕБОВАНИЕ: ВСЕ текстовые поля (title, category, description, consequence, regulation, recommendation, topRegulation) ДОЛЖНЫ БЫТЬ НАПИСАНЫ ИСКЛЮЧИТЕЛЬНО НА РУССКОМ ЯЗЫКЕ. Никакого английского текста!

Анализируй только строительные конструкции:
стены, потолок, бетон, штукатурку, плитку, окна, двери, колонны, балки, перекрытия, инженерные коммуникации, розетки и электрощит.

Игнорируй людей, мебель, одежду, ковры, бытовые предметы, животных, автомобили и всё, что не относится к строительству.

Если на фото чистое помещение без явных строительных дефектов — верни пустой массив defects.
Если на фото нет строительного объекта — тоже верни пустой массив defects.

Добавляй дефект только если уверен минимум на 90%. Максимум 5 дефектов.

ВАЖНО: Для каждого дефекта укажи точные координаты x и y в процентах (от 0 до 100) от левого верхнего угла изображения, где находится центр дефекта.

Верни ТОЛЬКО один валидный JSON без markdown и комментариев (без \`\`\`json).

Формат:

{
"regulationsChecked":142,
"confidence":0.95,
"summary":{
"compliant":true,
"topRegulation":"Нарушений не обнаружено"
},
"defects":[]
}

Если есть дефекты, заполни defects объектами:

{
"id":"def-1",
"code":"#DEF-101",
"title":"Название на русском",
"category":"Отделочные работы",
"risk":"high",
"x": 25, 
"y": 40,
"description":"Описание дефекта на русском",
"consequence":"Последствия на русском",
"regulation":"СНиП / ГОСТ",
"metrics":[],
"recommendation":"Рекомендация на русском"
}
`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "BI Group Quality Control",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 1200,
      }),
    });

   if (!response.ok) {
  const errorText = await response.text();
  console.error("OpenRouter error body:", errorText);
  throw new Error(`OpenRouter HTTP error! status: ${response.status}`);
}

const data = await response.json();
const rawText = data.choices?.[0]?.message?.content || "{}";

console.log("===== Raw JSON from OpenRouter =====");
console.log(rawText);

// Защита: проверяем, не заблокировал ли запрос фильтр безопасности ИИ
if (
  typeof rawText === 'string' &&
  (rawText.includes('User Safety') || rawText.includes('unsafe'))
) {
  throw new Error(
    'ИИ отклонил снимок из-за фильтра безопасности. Пожалуйста, сделайте фото под другим углом или чуть дальше от объекта.'
  );
}

const cleanJson = rawText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let parsed: any;

try {
  parsed = JSON.parse(cleanJson);
} catch (error) {
  console.error("JSON Parse Error from OpenRouter");
  console.error(cleanJson);
  throw new Error(
    'Ошибка обработки ответа от ИИ: сервер вернул текст вместо структуры JSON.'
  );
}

if (!parsed.defects) {
  parsed.defects = [];
}
if (!parsed.summary) {
  parsed.summary = {
    compliant: true,
    topRegulation: "Нарушений не обнаружено",
  };
}

    const endTime = performance.now();
    const processingMs = Math.round(endTime - startTime);

    const defects: Defect[] = (parsed.defects ?? []).map((d: any, index: number) => ({
      id: d.id ?? `def-${index + 1}`,
      code: d.code ?? `#DEF-${100 + index}`,
      title: d.title ?? "Замечание контроля",
      category: d.category ?? "КОНСТРУКЦИИ",
      risk: d.risk ?? "medium",
      x: typeof d.x === "number" ? d.x : 50,
      y: typeof d.y === "number" ? d.y : 50,
      description: d.description ?? "Обнаружено отклонение.",
      consequence: d.consequence ?? "Требуется устранение.",
      regulation: d.regulation ?? "Регламент BI Group",
      metrics: d.metrics ?? [],
      recommendation: d.recommendation ?? "Устранить замечание.",
    }));

    const highCount = defects.filter(d => d.risk === "high").length;
    const medCount = defects.filter(d => d.risk === "medium").length;
    const lowCount = defects.filter(d => d.risk === "low").length;

    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;

    const analysisResult: AnalysisResult = {
      reportId,
      capturedAt: params.capturedAt,
      regulationsChecked: parsed.regulationsChecked ?? 142,
      confidence: parsed.confidence ?? 0.95,
      processingMs,
      summary: {
        total: defects.length,
        high: highCount,
        medium: medCount,
        low: lowCount,
        compliant: parsed.summary?.compliant ?? defects.length === 0,
        topRegulation: parsed.summary?.topRegulation ?? "Контроль качества BI Group",
      },
      defects,
    };

    return analysisResult;

  } catch (err: any) {
    console.error('Ошибка при обращении к OpenRouter:', err);
    const errorMsg = err?.message || String(err);
    return {
      reportId: 'REP-ERR',
      capturedAt: params.capturedAt,
      regulationsChecked: 142,
      confidence: 0.85,
      processingMs: 350,
      summary: {
        total: 1,
        high: 1,
        medium: 0,
        low: 0,
        compliant: false,
        topRegulation: 'Ошибка удаленного анализа',
      },
      defects: [
        {
          id: 'err-1',
          code: '#ERR-500',
          title: 'Ошибка соединения с OpenRouter',
          category: 'СИСТЕМА',
          risk: 'high',
          x: 50,
          y: 50,
          description: `Детали: ${errorMsg}. Проверьте правильность ключа VITE_OPENROUTER_API_KEY в файле .env.`,
          consequence: 'Модель недоступна.',
          regulation: 'Системный регламент',
          metrics: [{ label: 'Статус', value: 'OpenRouter ошибка' }],
          recommendation: 'Проверьте баланс и корректность API-ключа.',
        },
      ],
    };
  }
}

export function riskColor(risk: RiskLevel) {
  switch (risk) {
    case 'high':
      return { bg: 'bg-danger', text: 'text-danger-deep', soft: 'bg-danger-soft', border: 'border-danger/30' };
    case 'medium':
      return { bg: 'bg-warn', text: 'text-warn-deep', soft: 'bg-warn-soft', border: 'border-warn/30' };
    case 'low':
      return { bg: 'bg-brand', text: 'text-brand-300', soft: 'bg-brand/10', border: 'border-brand/30' };
    default:
      return { bg: 'bg-ok', text: 'text-ok-deep', soft: 'bg-ok-soft', border: 'border-ok/30' };
  }
}

export const RISK_BADGE: Record<RiskLevel, string> = {
  high: 'ВЫСОКИЙ РИСК',
  medium: 'СРЕДНИЙ РИСК',
  low: 'НИЗКИЙ РИСК',
  ok: 'НОРМА',
};

export const RISK_LABEL: Record<RiskLevel, string> = {
  high: 'Критическое нарушение регламента',
  medium: 'Требует внимания',
  low: 'Незначительное отклонение',
  ok: 'Соответствует стандартам',
};

export function buildPrescription(defect: Defect, objectLabel: string): string {
  return `ПРЕДПИСАНИЕ ОБ УСТРАНЕНИИ ДЕФЕКТА
Объект: ${objectLabel}
Код дефекта: ${defect.code}
Категория: ${defect.category}
Уровень риска: ${defect.risk.toUpperCase()}

ОПИСАНИЕ НАРУШЕНИЯ:
${defect.description}

ПОСЛЕДСТВИЯ:
${defect.consequence}

НОРМАТИВНЫЙ ДОКУМЕНТ:
${defect.regulation}

ТРЕБУЕМЫЕ МЕРЫ:
${defect.recommendation}

Срок исполнения: 48 часов с момента фиксации ИИ-модулем.
`;
}
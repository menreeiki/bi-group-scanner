import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft,
  Zap,
  FileText,
  Flashlight,
  FlashlightOff,
  Camera,
  Crosshair,
  ScanLine,
  Gauge,
  ShieldAlert,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Download,
  RotateCcw,
} from 'lucide-react';
import type { Defect } from '@/types';
import {
  buildPrescription,
  riskColor,
  RISK_BADGE,
  RISK_LABEL,
  analyzeFrame,
  type AnalysisResult,
} from '@/services/aiVision';
import { Sheet } from '@/components/ui/Sheet';

interface ScanScreenProps {
  objectId: string;
  objectName: string;
  blockName: string;
  floorName: string;
  roomName: string;
  onBack: () => void;
  onOpenReports: () => void;
  onCaptureComplete?: (result: AnalysisResult) => void;
  onPersist?: (input: any) => Promise<any>;
}

export function ScanScreen({
  objectId,
  objectName,
  blockName,
  floorName,
  roomName,
  onBack,
  onOpenReports,
  onCaptureComplete,
  onPersist,
}: ScanScreenProps) {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [activeDefect, setActiveDefect] = useState<Defect | null>(null);
  const [torch, setTorch] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Ошибка доступа к камере:", err);
      }
    }
    enableCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const locationLabel = useMemo(
    () => `${objectName} • ${blockName} • ${floorName} • ${roomName}`,
    [objectName, blockName, floorName, roomName],
  );

  const handleCapture = async () => {
    if (capturing || isAnalyzing) return;
    setCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        setIsSaved(false); // Сбрасываем статус сохранения для нового снимка

        try {
          setIsAnalyzing(true);
          
          const result = await analyzeFrame({
            objectId: objectId || 'OBJ-01',
            block: blockName || 'Блок А',
            floor: floorName || 'Этаж 3',
            room: roomName || 'Помещение 302',
            capturedAt: new Date().toISOString(),
            imageBase64: dataUrl,
          });

          setAnalysis(result);
          setDefects(result.defects);
          setShowSummary(true);
          // УБРАНО автоматическое сохранение/дублирование (onCaptureComplete?.(result)) отсюда!

        } catch (error) {
          console.error('Ошибка при анализе:', error);
        } finally {
          setIsAnalyzing(false);
          setCapturing(false);
        }
      }
    }
  };
  
  const handleRetypeCamera = async () => {
    setCapturedImage(null);
    setAnalysis(null);
    setDefects([]);
    setShowSummary(false);
    setIsSaved(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Ошибка при перезапуске камеры:", err);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const handleSaveReport = async () => {
    if (analysis && !isSaved && onPersist) {
      try {
        setIsSaving(true);
        await onPersist({
          reportId: analysis.reportId,
          objectId: objectId,
          objectName: objectName,
          blockName: blockName,
          floorName: floorName,
          roomName: roomName,
          objectLabel: `${objectName} • ${blockName}`,
          defectCount: analysis.summary.total,
          highRiskCount: analysis.summary.high,
          mediumRiskCount: analysis.summary.medium,
          lowRiskCount: analysis.summary.low,
          topRegulation: analysis.summary.topRegulation,
          status: 'issued',
          snapshotBase64: capturedImage,
          defects: analysis.defects,
        });
        setIsSaved(true);
        // Опционально можно передать в родительский компонент, если требуется внешняя логика
        onCaptureComplete?.(analysis);
      } catch (e) {
        console.error('Ошибка сохранения отчёта в Supabase:', e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-30 bg-ink overflow-hidden animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured scan"
            className="absolute inset-0 w-full h-full object-cover filter brightness-95"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/30" />
      </div>

      {!capturedImage && (
        <>
          <div className="absolute inset-0 scan-mesh-wall opacity-30 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 scan-mesh-floor perspective-grid opacity-50 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-0.5 bg-brand shadow-glow animate-scan-line pointer-events-none" />
        </>
      )}

      {isAnalyzing && (
        <div className="absolute inset-0 z-30 bg-ink/70 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-brand/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-brand animate-spin" />
            <div className="absolute inset-0 grid place-items-center">
              <ScanLine size={32} className="text-brand animate-pulse" />
            </div>
          </div>
          <div className="text-display-sm font-display tracking-wide">ИИ-анализ кадра...</div>
          <div className="text-body-sm text-white/60 mt-1 font-medium">Сверим с регламентами BI Group</div>
        </div>
      )}

      {flash && <div className="absolute inset-0 bg-white animate-flash z-40" />}

      <div className="absolute top-0 inset-x-0 z-20 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="px-4 flex items-center gap-3">
          <button
            onClick={capturedImage ? handleRetypeCamera : onBack}
            className="w-10 h-10 rounded-xl glass-dark grid place-items-center text-white btn-press"
            aria-label="Назад / Переснять"
          >
            {capturedImage ? <RotateCcw size={18} /> : <ArrowLeft size={20} />}
          </button>
          <div className="flex-1 min-w-0 glass-dark rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 text-white text-[12px] font-semibold truncate">
              <ScanLine size={13} className="text-brand-300 shrink-0" />
              <span className="truncate">{locationLabel}</span>
            </div>
          </div>
        </div>

        {!capturedImage && (
          <div className="px-4 mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <HudChip active icon={<Zap size={11} />} label="LIDAR ACTIVE" />
            <HudChip icon={<Crosshair size={11} />} label="GRID LOCKED" />
            <HudChip icon={<ScanLine size={11} />} label="142 REG" />
          </div>
        )}
      </div>

      {capturedImage &&
        analysis &&
        defects.map((d) => (
          <DefectMarker key={d.id} defect={d} onClick={() => setActiveDefect(d)} />
        ))}

      {!capturedImage && !isAnalyzing && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-brand rounded-tl" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-brand rounded-tr" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-brand rounded-bl" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-brand rounded-br" />
          </div>
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 z-20 pb-[max(18px,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-ink/80 to-transparent">
        {capturedImage ? (
          <div className="px-6 flex items-center gap-3">
            <button
              onClick={handleRetypeCamera}
              className="flex-1 rounded-2xl glass-dark border border-white/20 text-white p-3.5 text-body-md font-semibold flex items-center justify-center gap-2 btn-press"
            >
              <RotateCcw size={18} />
              Переснять
            </button>
            <button
              onClick={handleSaveReport}
              disabled={isSaved || isSaving}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl p-3.5 text-body-md font-semibold shadow-card-hover btn-press ${
                isSaved
                  ? 'bg-ok text-white cursor-default'
                  : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
              }`}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isSaved ? (
                <CheckCircle2 size={18} />
              ) : (
                <FileText size={18} />
              )}
              {isSaving ? 'Сохранение...' : isSaved ? 'Сохранено' : 'Отправить в отчёт'}
            </button>
          </div>
        ) : (
          <div className="px-6 flex items-center justify-between">
            <ControlButton
              active={torch}
              onClick={() => setTorch((t) => !t)}
              icon={torch ? <Flashlight size={22} /> : <FlashlightOff size={22} />}
              label="Фонарик"
              disabled={!!capturedImage}
            />
            <button
              onClick={handleCapture}
              disabled={capturing || isAnalyzing || !!capturedImage}
              className="relative rounded-full grid place-items-center btn-press disabled:opacity-50"
              style={{ width: 72, height: 72 }}
              aria-label="Сделать снимок"
            >
              <span className="absolute inset-0 rounded-full border-4 border-white/80" />
              <span className="absolute inset-1.5 rounded-full border-2 border-white/40" />
              <span className="w-14 h-14 rounded-full bg-white grid place-items-center mx-auto my-auto">
                {capturing ? (
                  <Loader2 size={24} className="text-brand animate-spin" />
                ) : (
                  <Camera size={24} className="text-brand" />
                )}
              </span>
            </button>
            <ControlButton
              onClick={onOpenReports}
              icon={<FileText size={22} />}
              label="Отчёты"
            />
          </div>
        )}
        <div className="text-center text-white/60 text-[11px] mt-3 font-medium">
          {capturedImage
            ? 'Снимок зафиксирован. Нажмите на дефекты или используйте кнопки ниже'
            : 'Нажмите кнопку, чтобы зафиксировать кадр и запустить ИИ'}
        </div>
      </div>

      <Sheet open={!!activeDefect} onClose={() => setActiveDefect(null)} maxWidth="lg">
        {activeDefect && (
          <DefectDetail
            defect={activeDefect}
            objectLabel={locationLabel}
            onClose={() => setActiveDefect(null)}
          />
        )}
      </Sheet>

      <Sheet open={showSummary} onClose={() => setShowSummary(false)} maxWidth="lg">
        {analysis && (
          <AnalysisSummaryView
            result={analysis}
            onClose={() => setShowSummary(false)}
            onRetake={handleRetypeCamera}
            onOpenReports={onOpenReports}
          />
        )}
      </Sheet>
    </div>
  );
}

function HudChip({
  icon,
  label,
  tone = 'default',
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'default' | 'danger' | 'warn';
  active?: boolean;
}) {
  const toneCls =
    tone === 'danger'
      ? 'bg-danger/85 border-danger'
      : tone === 'warn'
        ? 'bg-warn/85 border-warn'
        : active
          ? 'bg-brand/85 border-brand'
          : 'bg-black/45 border-white/15';
  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-white text-[10px] font-semibold tracking-wide shrink-0 ${toneCls}`}
    >
      {icon}
      {label}
    </div>
  );
}

function DefectMarker({ defect, onClick }: { defect: Defect; onClick: () => void }) {
  const c = riskColor(defect.risk);
  const isHigh = defect.risk === 'high';
  return (
    <button
      onClick={onClick}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
      style={{ left: `${defect.x}%`, top: `${defect.y}%` }}
      aria-label={defect.title}
    >
      <div className="relative">
        {isHigh && (
          <span
            className={`absolute inset-0 rounded-full ${c.bg} opacity-40 animate-pulse-ring`}
          />
        )}
        <div
          className={`relative w-8 h-8 rounded-full grid place-items-center text-white text-sm font-bold border-2 border-white shadow-lg ${c.bg} animate-marker-bob`}
        >
          !
        </div>
      </div>
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap ${
          isHigh ? 'bg-danger text-white' : 'bg-warn text-ink'
        } opacity-0 group-hover:opacity-100 transition-opacity`}
      >
        {defect.code}
      </div>
    </button>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-1.5 btn-press disabled:opacity-40">
      <span
        className={`w-12 h-12 rounded-full grid place-items-center border-2 ${
          active
            ? 'bg-brand border-brand text-white shadow-glow'
            : 'glass-dark border-white/25 text-white'
        }`}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium text-white/80">{label}</span>
    </button>
  );
}

function DefectDetail({
  defect,
  objectLabel,
  onClose,
}: {
  defect: Defect;
  objectLabel: string;
  onClose: () => void;
}) {
  const c = riskColor(defect.risk);
  const [prescription, setPrescription] = useState<string | null>(null);

  const handleGenerate = () => {
    setPrescription(buildPrescription(defect, objectLabel));
  };

  const handleDownload = () => {
    if (!prescription) return;
    const blob = new Blob([prescription], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predpisanie_${defect.code.replace('#', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${c.bg} text-white`}>
          {RISK_BADGE[defect.risk]}
        </span>
        <span className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
          {defect.category}
        </span>
      </div>
      <h2 className="text-display-md font-display text-ink pr-8">
        {defect.title} <span className="text-ink-subtle">{defect.code}</span>
      </h2>

      <div className={`mt-3 flex items-start gap-2.5 px-3.5 py-3 rounded-xl ${c.soft} border ${c.border}`}>
        <ShieldAlert size={18} className={`${c.text} shrink-0 mt-0.5`} />
        <div>
          <div className={`text-[11px] font-bold tracking-wide ${c.text} uppercase`}>
            {RISK_LABEL[defect.risk]}
          </div>
          <div className="text-body-sm text-ink-soft font-medium mt-0.5">
            {defect.regulation}
          </div>
        </div>
      </div>

      <Section title="Описание">
        <p className="text-body-md text-ink-soft leading-relaxed">{defect.description}</p>
      </Section>

      <Section title="Последствия">
        <p className="text-body-md text-ink-soft leading-relaxed">{defect.consequence}</p>
      </Section>

      <Section title="Метрики">
        <div className="grid grid-cols-2 gap-2.5">
          {defect.metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-surface-low p-3.5 border border-line-soft">
              <div className="flex items-center gap-1.5 text-[11px] text-ink-subtle font-medium">
                <Gauge size={13} className="text-brand" />
                {m.label}
              </div>
              <div className="text-display-md font-display text-ink mt-1">
                {m.value}
                {m.unit && <span className="text-body-md text-ink-muted ml-1">{m.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Рекомендация ИИ">
        <p className="text-body-md text-ink-soft leading-relaxed">{defect.recommendation}</p>
      </Section>

      {prescription ? (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-title-sm text-ink font-display">
              <CheckCircle2 size={16} className="text-ok" />
              Предписание сформировано
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-low hover:bg-surface-high text-ink-muted text-[12px] font-semibold btn-press"
            >
              <Download size={14} />
              Скачать
            </button>
          </div>
          <pre className="rounded-xl bg-ink text-white/90 text-[11px] leading-relaxed p-3.5 overflow-x-auto whitespace-pre-wrap font-mono max-h-48 overflow-y-auto no-scrollbar">
            {prescription}
          </pre>
        </div>
      ) : (
        <button
          onClick={handleGenerate}
          className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white shadow-card-hover btn-press"
        >
          <FileText size={20} />
          <span className="text-title-md font-display">Сформировать предписание</span>
          <ChevronRight size={18} className="opacity-80" />
        </button>
      )}

      <button
        onClick={onClose}
        className="mt-3 w-full text-center py-2.5 text-ink-subtle text-body-sm font-medium"
      >
        Закрыть
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-ink-subtle uppercase mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function AnalysisSummaryView({
  result,
  onClose,
  onRetake,
  onOpenReports,
}: {
  result: AnalysisResult;
  onClose: () => void;
  onRetake: () => void;
  onOpenReports: () => void;
}) {
  const { summary } = result;
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-brand text-white">
          ОТЧЁТ {result.reportId}
        </span>
        <span className="text-[10px] font-semibold text-ink-subtle uppercase">
          {result.processingMs} мс · {Math.round(result.confidence * 100)}% точность
        </span>
      </div>
      <h2 className="text-display-md font-display text-ink pr-8">
        Анализ кадра завершён
      </h2>

      <div className="grid grid-cols-3 gap-2.5 mt-4">
        <SummaryStat value={summary.total} label="Всего" tone="default" />
        <SummaryStat value={summary.high} label="Высокий" tone="danger" />
        <SummaryStat value={summary.medium} label="Средний" tone="warn" />
      </div>

      <div
        className={`mt-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl ${
          summary.compliant ? 'bg-ok-soft border border-ok/20' : 'bg-danger-soft border border-danger/20'
        }`}
      >
        <ShieldAlert
          size={18}
          className={summary.compliant ? 'text-ok-deep' : 'text-danger-deep'}
        />
        <div>
          <div
            className={`text-[11px] font-bold tracking-wide uppercase ${
              summary.compliant ? 'text-ok-deep' : 'text-danger-deep'
            }`}
          >
            {summary.compliant ? 'Соответствие регламенту' : 'Нарушения обнаружены'}
          </div>
          <div className="text-body-sm text-ink-soft font-medium mt-0.5">
            Проверено регламентов: {result.regulationsChecked} · {summary.topRegulation}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: 'default' | 'danger' | 'warn';
}) {
  const color =
    tone === 'danger' ? 'text-danger-deep' : tone === 'warn' ? 'text-warn-deep' : 'text-ink';
  return (
    <div className="rounded-xl bg-surface-low p-3 text-center border border-line-soft">
      <div className={`text-display-md font-display ${color}`}>{value}</div>
      <div className="text-[11px] text-ink-subtle mt-0.5">{label}</div>
    </div>
  );
}
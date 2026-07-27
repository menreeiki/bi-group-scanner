import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ScanReport } from '@/types';

export interface PersistReportInput {
  reportId: string;
  objectId: string;
  objectName: string;
  blockName: string;
  floorName: string;
  roomName: string;
  objectLabel: string;
  defectCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topRegulation: string;
  status?: ScanReport['status'];
  snapshotBase64?: string | null;
  defects?: any[] | null;
}

const SELECT_COLUMNS =
  'id, report_id, object_id, object_name, block_name, floor_name, room_name, object_label, defect_count, high_risk_count, medium_risk_count, low_risk_count, top_regulation, status, created_at, snapshot_base64, defects';

export function useScanReports() {
  const [reports, setReports] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('scan_reports')
      .select(SELECT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else if (data) {
      // ЗАЩИТА: Фильтруем и не пропускаем записи без ID отчёта или имени объекта
      const validReports = data
        .filter((r) => r.report_id && r.object_name)
        .map((r) => ({
          id: r.id,
          reportId: r.report_id,
          objectId: r.object_id,
          objectName: r.object_name,
          blockName: r.block_name,
          floorName: r.floor_name,
          roomName: r.room_name,
          objectLabel: r.object_label,
          defectCount: r.defect_count,
          highRiskCount: r.high_risk_count,
          mediumRiskCount: r.medium_risk_count,
          lowRiskCount: r.low_risk_count,
          topRegulation: r.top_regulation,
          status: r.status,
          capturedAt: r.created_at,
          image: r.snapshot_base64,
          defects: r.defects,
        }));

      setReports(validReports);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const persist = useCallback(async (input: PersistReportInput) => {
    // ЗАЩИТА: Если переданы пустые данные — не отправляем в базу
    if (!input.reportId || !input.objectName) {
      console.warn('Попытка сохранить пустой отчёт отклонена');
      return null;
    }

    const { data, error } = await supabase
      .from('scan_reports')
      .insert({
        report_id: input.reportId,
        object_id: input.objectId,
        object_name: input.objectName,
        block_name: input.blockName,
        floor_name: input.floorName,
        room_name: input.roomName,
        object_label: input.objectLabel,
        defect_count: input.defectCount,
        high_risk_count: input.highRiskCount,
        medium_risk_count: input.mediumRiskCount,
        low_risk_count: input.lowRiskCount,
        top_regulation: input.topRegulation,
        status: input.status ?? 'issued',
        snapshot_base64: input.snapshotBase64,
        defects: input.defects,
      })
      .select(SELECT_COLUMNS)
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    if (data) {
      const mapped: ScanReport = {
        id: data.id,
        reportId: data.report_id,
        objectId: data.object_id,
        objectName: data.object_name,
        blockName: data.block_name,
        floorName: data.floor_name,
        roomName: data.room_name,
        objectLabel: data.object_label,
        defectCount: data.defect_count,
        highRiskCount: data.high_risk_count,
        mediumRiskCount: data.medium_risk_count,
        low_risk_count: data.low_risk_count,
        topRegulation: data.top_regulation,
        status: data.status,
        capturedAt: data.created_at,
        image: data.snapshot_base64,
        defects: data.defects,
      };
      setReports((prev) => [mapped, ...prev]);
      return mapped;
    }
    return null;
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: ScanReport['status']) => {
      const { error } = await supabase.from('scan_reports').update({ status }).eq('id', id);
      if (error) {
        setError(error.message);
        return false;
      }
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      return true;
    },
    [],
  );

  const deleteReport = useCallback(async (id: string) => {
  const { error } = await supabase
    .from('scan_reports')
    .delete()
    .eq('id', id);

  if (error) {
    setError(error.message);
    return false;
  }

  setReports((prev) => prev.filter((r) => r.id !== id));
  return true;
}, []);

  return { reports, loading, error, refresh, persist, updateStatus, deleteReport, };
}
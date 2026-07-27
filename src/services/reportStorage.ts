export function getFilteredReports(filter: ReportFilter): SavedReport[] {
  try {
    const data = localStorage.getItem('bi_quality_reports');
    if (!data) return [];
    const reports: SavedReport[] = JSON.parse(data);

    // Жесткая очистка: удаляем всё, где нет картинки или пустой список дефектов
    const validReports = reports.filter(r => {
      const hasImage = r.image && r.image.trim() !== "";
      const hasDefects = r.defects && Array.isArray(r.defects) && r.defects.length > 0;
      return hasImage && hasDefects;
    });

    if (validReports.length !== reports.length) {
      localStorage.setItem('bi_quality_reports', JSON.stringify(validReports));
    }

    return validReports.filter(r => {
      const matchesObject = filter.objectId && filter.objectId.trim() !== ""
        ? r.objectId.toLowerCase().includes(filter.objectId.toLowerCase().trim())
        : true;

      const matchesBlock = filter.block && filter.block.trim() !== ""
        ? r.block.toLowerCase().includes(filter.block.toLowerCase().trim())
        : true;

      const matchesFloor = filter.floor && filter.floor.trim() !== ""
        ? r.floor.toLowerCase().includes(filter.floor.toLowerCase().trim())
        : true;

      const matchesRoom = filter.room && filter.room.trim() !== ""
        ? r.room.toLowerCase().includes(filter.room.toLowerCase().trim())
        : true;

      return matchesObject && matchesBlock && matchesFloor && matchesRoom;
    });
  } catch (e) {
    console.error("Ошибка фильтрации отчетов:", e);
    return [];
  }
}
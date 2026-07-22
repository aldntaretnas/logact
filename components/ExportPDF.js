'use client'

import { formatDuration, formatDateShort } from '@/lib/utils'

export async function generatePDF(activities, dateFrom, dateTo) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Laporan Aktivitas Harian', 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100)
  const periodText = dateFrom && dateTo
    ? `Periode: ${formatDateShort(dateFrom)} - ${formatDateShort(dateTo)}`
    : dateTo
      ? `Sampai: ${formatDateShort(dateTo)}`
      : 'Semua periode'
  doc.text(periodText, 14, 30)
  doc.text(`Dicetak: ${formatDateShort(new Date().toISOString().split('T')[0])}`, 14, 36)

  const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0)
  doc.text(`Total Aktivitas: ${activities.length} | Total Durasi: ${formatDuration(totalDuration)}`, 14, 42)

  const tableData = activities.map((a) => [
    formatDateShort(a.date),
    a.title,
    a.category,
    a.duration ? formatDuration(a.duration) : '-',
    a.description || '-',
  ])

  autoTable(doc, {
    startY: 50,
    head: [['Tanggal', 'Aktivitas', 'Kategori', 'Durasi', 'Keterangan']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 50 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  })

  const filename = `laporan-aktivitas${dateFrom ? `-${dateFrom}` : ''}-${dateTo || 'all'}.pdf`
  doc.save(filename)
}

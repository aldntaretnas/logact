'use client'

import { formatDuration, formatDateShort } from '@/lib/utils'

export async function generateWorkLogPDF(workLogs, dateFrom, dateTo) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(18)
  doc.text('Logbook Kerja', 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100)
  const today = formatDateShort(new Date().toISOString().split('T')[0])
  const startDate = dateFrom ? formatDateShort(dateFrom) : (workLogs[0] ? formatDateShort(workLogs[0].date) : today)
  doc.text(`Periode Kerja: ${startDate} - ${today}`, 14, 30)
  doc.text(`Dicetak: ${today}`, 14, 36)
  doc.text(`Total Entri: ${workLogs.length}`, 14, 42)

  const tableData = workLogs.map((wl, i) => [
    i + 1,
    formatDateShort(wl.date),
    `Pekan ${wl.week_number}`,
    wl.activity,
    wl.result,
    wl.doc_url ? ' ' : '-',  // blank so autotable draws nothing; we draw the link manually
  ])

  autoTable(doc, {
    startY: 50,
    head: [['No', 'Tanggal', 'Pekan Ke', 'Kegiatan', 'Hasil Kegiatan', 'Dokumentasi']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3, lineColor: [203, 213, 225], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], lineColor: [30, 41, 59], lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 },
      4: { cellWidth: 60 },
      5: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawCell: (data) => {
      if (data.column.index === 5 && data.cell.section === 'body') {
        const url = workLogs[data.row.index]?.doc_url
        if (url) {
          doc.setFontSize(8)
          doc.setTextColor(37, 99, 235)
          doc.textWithLink('Buka Dokumen', data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1, { url })
          doc.setTextColor(0, 0, 0)
        }
      }
    },
  })

  const filename = `logbook-kerja${dateFrom ? `-${dateFrom}` : ''}-${dateTo || 'all'}.pdf`
  doc.save(filename)
}

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
    styles: { fontSize: 8, cellPadding: 3, lineColor: [203, 213, 225], lineWidth: 0.3 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], lineColor: [30, 41, 59], lineWidth: 0.3 },
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

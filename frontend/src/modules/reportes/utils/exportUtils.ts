export function exportarACSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function imprimirVistaReporte(titulo: string, elementId: string) {
  const contentNode = document.getElementById(elementId);
  if (!contentNode) {
    alert('No se encontró el contenido a imprimir.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #111; }
          h2 { color: #1d4ed8; margin-bottom: 4px; }
          .header-info { font-size: 0.85rem; color: #666; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
          th { background-color: #f3f4f6; font-weight: 600; }
          .badge { font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
          .text-right { text-align: right; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>COCHERA CENTRAL - ${titulo}</h2>
        <div class="header-info">Generado el: ${new Date().toLocaleString()}</div>
        ${contentNode.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

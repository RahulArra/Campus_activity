const dayjs = require('dayjs');

function generatePDFHTML(docs, dept) {
  const rowsHtml = docs.map(d => `
    <tr>
      <td>${d._id}</td>
      <td>${d.studentName || ''}</td>
      <td>${d.title || ''}</td>
      <td>${d.templateId || ''}</td>
      <td>${dayjs(d.date).format('YYYY-MM-DD')}</td>
      <td>${(d.files || []).map(f => `<a href="${f.url}">file</a>`).join(', ')}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h2>Department Report - ${dept}</h2>
        <p>Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}</p>
        <table>
          <thead>
            <tr><th>ID</th><th>Student</th><th>Title</th><th>Template</th><th>Date</th><th>Files</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `;

  return html;
}

module.exports = { generatePDFHTML };

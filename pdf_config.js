const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUTPUT_DIR = '/Users/mansabhatt/Desktop/My-Project';

console.log('Generating Shopease documentation HTML files...');

// Helper to escape HTML
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const COMMON_CSS = `
  @page {
    size: A4;
    margin: 18mm 14mm 18mm 14mm;
    @bottom-right {
      content: counter(page);
      font-size: 8pt;
      color: #64748b;
    }
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    margin-top: 0;
    margin-bottom: 8px;
    border-bottom: 2.5px solid #4f46e5;
    padding-bottom: 8px;
  }
  h2 {
    font-size: 14pt;
    font-weight: 700;
    color: #1e1b4b;
    margin-top: 22px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 5px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 700;
    color: #312e81;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 10pt;
    font-weight: 700;
    color: #4338ca;
    margin-top: 10px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  p {
    margin: 0 0 8px;
  }
  ul, ol {
    margin: 0 0 10px 18px;
    padding: 0;
  }
  li {
    margin-bottom: 4px;
  }
  code {
    font-family: "SF Mono", Menlo, Consolas, Monaco, monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    font-family: "SF Mono", Menlo, Consolas, Monaco, monospace;
    font-size: 8pt;
    line-height: 1.45;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 8px 0;
    page-break-inside: avoid;
  }
  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: inherit;
  }
  .header-cover {
    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4f46e5 100%);
    color: #ffffff;
    padding: 30px 25px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  .header-cover h1 {
    color: #ffffff;
    border-bottom: 2px solid rgba(255,255,255,0.3);
    font-size: 20pt;
    margin-bottom: 6px;
  }
  .header-cover .subtitle {
    color: #c7d2fe;
    font-size: 10.5pt;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .meta-tag {
    display: inline-block;
    background: rgba(255,255,255,0.18);
    color: #ffffff;
    font-size: 8pt;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    margin-right: 6px;
  }
  .callout {
    border-left: 4px solid #4f46e5;
    background: #f8fafc;
    padding: 9px 12px;
    border-radius: 0 6px 6px 0;
    margin: 10px 0;
    page-break-inside: avoid;
  }
  .callout-title {
    font-weight: 700;
    color: #4f46e5;
    font-size: 9pt;
    margin-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .code-box {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin: 10px 0;
    page-break-inside: avoid;
    overflow: hidden;
  }
  .code-box-header {
    background: #e2e8f0;
    padding: 5px 12px;
    font-size: 8pt;
    font-weight: 700;
    color: #334155;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #cbd5e1;
  }
  .code-box pre {
    margin: 0;
    border-radius: 0;
  }
  .code-explanation {
    background: #f8fafc;
    padding: 8px 12px;
    font-size: 8.5pt;
    color: #334155;
    border-top: 1px solid #e2e8f0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 9px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f1f5f9;
    font-weight: 700;
    color: #0f172a;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }
  .badge-primary { background: #e0e7ff; color: #4338ca; }
  .badge-success { background: #dcfce7; color: #15803d; }
  .badge-warning { background: #fef3c7; color: #b45309; }
  .badge-danger  { background: #fee2e2; color: #b91c1c; }
  .badge-purple  { background: #f3e8ff; color: #7e22ce; }
  .badge-cyan    { background: #cffafe; color: #0e7490; }

  .qa-card {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 13px;
    margin-bottom: 11px;
    page-break-inside: avoid;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }
  .qa-card.highlight {
    border-left: 4px solid #4f46e5;
  }
  .qa-num {
    display: inline-block;
    background: #4f46e5;
    color: #fff;
    font-size: 7.5pt;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 6px;
  }
  .qa-title {
    font-weight: 700;
    color: #0f172a;
    font-size: 10pt;
    margin-bottom: 5px;
  }
  .qa-body {
    color: #334155;
    font-size: 9pt;
    line-height: 1.5;
  }
  .qa-code {
    background: #0f172a;
    color: #f8fafc;
    padding: 7px 10px;
    border-radius: 4px;
    font-size: 7.5pt;
    margin: 6px 0;
    font-family: "SF Mono", Menlo, monospace;
    white-space: pre-wrap;
  }
  .page-break {
    page-break-before: always;
  }
  .avoid-break {
    page-break-inside: avoid;
  }
`;

module.exports = { COMMON_CSS, CHROME_PATH, OUTPUT_DIR };

import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/bg-white/g, 'bg-surface');
  content = content.replace(/bg-slate-50/g, 'bg-page');
  content = content.replace(/bg-gray-50/g, 'bg-page');
  content = content.replace(/bg-slate-100/g, 'bg-element');
  content = content.replace(/border-slate-200/g, 'border-border');
  content = content.replace(/border-gray-200/g, 'border-border');
  content = content.replace(/border-slate-100/g, 'border-border');
  content = content.replace(/border-gray-100/g, 'border-border');
  content = content.replace(/text-slate-800/g, 'text-text-main');
  content = content.replace(/text-gray-800/g, 'text-text-main');
  content = content.replace(/text-gray-900/g, 'text-text-main');
  content = content.replace(/text-slate-500/g, 'text-text-muted');
  content = content.replace(/text-gray-500/g, 'text-text-muted');
  content = content.replace(/text-slate-400/g, 'text-text-muted');
  content = content.replace(/text-gray-400/g, 'text-text-muted');
  content = content.replace(/text-slate-700/g, 'text-text-main');
  content = content.replace(/border-slate-300/g, 'border-border');
  fs.writeFileSync(filePath, content, 'utf-8');
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

processDir('./src/components');
replaceInFile('./src/App.tsx');

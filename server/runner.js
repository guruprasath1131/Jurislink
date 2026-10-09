import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('==============================================================================');
console.log('           JURISLINK (न्याय सेतु) - FULL STACK & DATABASE LAUNCHER');
console.log('==============================================================================');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Launch Backend Server & Database
console.log('[1/2] 🚀 Starting Backend Server (Port 8000) & SQLite Database (jurislink.db)...');
const backend = spawn('node', ['server/index.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

// 2. Launch Vite Frontend UI
console.log('[2/2] 💻 Starting Frontend UI Server (Port 3000)...');
const frontend = spawn(npxCmd, ['vite'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n🛑 Shutting down Jurislink Backend & Frontend servers...');
  try { backend.kill(); } catch {}
  try { frontend.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

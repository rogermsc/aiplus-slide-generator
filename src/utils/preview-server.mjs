import { spawn }  from 'node:child_process';
import path        from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_CONFIG = path.resolve(__dirname, '../preview/vite.config.ts');
const MAX_PORT_RETRIES = 3;

/**
 * Start a Vite preview server with automatic port fallback.
 * @param {string} outDir - Absolute path to the module output directory
 * @param {number} port - Starting port (will try port, port+1, port+2 on conflict)
 * @returns {Promise<{url: string, stop: () => Promise<void>}>}
 */
export async function startPreviewServer(outDir, port = 5174) {
  const absOutDir = path.resolve(outDir);

  for (let attempt = 0; attempt < MAX_PORT_RETRIES; attempt++) {
    const tryPort = port + attempt;
    try {
      return await tryStartServer(absOutDir, tryPort);
    } catch (err) {
      if (attempt < MAX_PORT_RETRIES - 1 && err.message.includes('port')) {
        console.warn(`    Port ${tryPort} busy, trying ${tryPort + 1}…`);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Could not start preview server on ports ${port}-${port + MAX_PORT_RETRIES - 1}`);
}

async function tryStartServer(absOutDir, port) {
  const url = `http://localhost:${port}`;

  const child = spawn('npx', ['vite', '--config', VITE_CONFIG, '--port', String(port), '--strictPort'], {
    env: { ...process.env, VITE_OUT_DIR: absOutDir },
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: path.resolve(__dirname, '../../'),
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('Preview server startup timed out after 15s'));
    }, 15000);
    let output = '';

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
      if (output.includes('ready in') || output.includes('Local:')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
      if (output.includes('port is already') || output.includes('EADDRINUSE')) {
        clearTimeout(timeout);
        child.kill('SIGTERM');
        reject(new Error(`port ${port} already in use`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start preview server: ${err.message}`));
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timeout);
        reject(new Error(`Preview server exited with code ${code} — port ${port} may be in use`));
      }
    });
  });

  // Verify health endpoint
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) break;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return {
    url,
    stop: async () => {
      child.kill('SIGTERM');
      await new Promise(r => setTimeout(r, 500));
      if (!child.killed) child.kill('SIGKILL');
    },
  };
}

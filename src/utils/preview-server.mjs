import { spawn }  from 'node:child_process';
import path        from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_CONFIG = path.resolve(__dirname, '../preview/vite.config.ts');

/**
 * Start a Vite preview server for slide rendering.
 * @param {string} outDir - Absolute path to the module output directory
 * @param {number} port - Port number (default 5174 to avoid conflicts)
 * @returns {Promise<{url: string, stop: () => Promise<void>}>}
 */
export async function startPreviewServer(outDir, port = 5174) {
  const absOutDir = path.resolve(outDir);
  const url = `http://localhost:${port}`;

  const child = spawn('npx', ['vite', '--config', VITE_CONFIG, '--port', String(port)], {
    env: { ...process.env, VITE_OUT_DIR: absOutDir },
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: path.resolve(__dirname, '../../'),
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server startup timed out after 15s')), 15000);
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
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start preview server: ${err.message}`));
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timeout);
        reject(new Error(`Preview server exited with code ${code}\n${output}`));
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

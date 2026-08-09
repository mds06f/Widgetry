// Secure Web Worker & Sandbox PostMessage RPC Bridge for Custom Scripts

export function executeInSandbox(scriptCode, contextData = {}) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([
        `
        self.onmessage = function(e) {
          const { code, data } = e.data;
          
          const capturedLogs = [];
          const mockConsole = {
            log: function(...args) {
              const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
              capturedLogs.push({ type: 'log', message: msg, time: new Date().toLocaleTimeString() });
            },
            warn: function(...args) {
              const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
              capturedLogs.push({ type: 'warn', message: msg, time: new Date().toLocaleTimeString() });
            },
            error: function(...args) {
              const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
              capturedLogs.push({ type: 'error', message: msg, time: new Date().toLocaleTimeString() });
            }
          };

          // Override global console
          self.console = { ...console, ...mockConsole };

          try {
            const func = new Function('data', code);
            const result = func(data);
            self.postMessage({ success: true, result, logs: capturedLogs });
          } catch (err) {
            self.postMessage({ success: false, error: err.message, logs: capturedLogs });
          }
        };
        `
      ], { type: 'application/javascript' });

      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      const timeout = setTimeout(() => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(new Error('Script execution timed out (CPU safety limit reached)'));
      }, 3000); // 3 sec CPU safety limit

      worker.onmessage = (e) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        if (e.data.success) {
          resolve({ result: e.data.result, logs: e.data.logs || [] });
        } else {
          const err = new Error(e.data.error);
          err.logs = e.data.logs || [];
          reject(err);
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(err);
      };

      worker.postMessage({ code: scriptCode, data: contextData });
    } catch (err) {
      reject(err);
    }
  });
}

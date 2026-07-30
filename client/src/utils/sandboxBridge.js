// Secure Web Worker & Sandbox PostMessage RPC Bridge for Custom Scripts

export function executeInSandbox(scriptCode, contextData = {}) {
  return new Promise((resolve, reject) => {
    try {
      const blob = new Blob([
        `
        self.onmessage = function(e) {
          const { code, data } = e.data;
          try {
            const func = new Function('data', code);
            const result = func(data);
            self.postMessage({ success: true, result });
          } catch (err) {
            self.postMessage({ success: false, error: err.message });
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
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (err) => {
        clearTimeout(timeout);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        reject(new Error(err.message));
      };

      worker.postMessage({ code: scriptCode, data: contextData });
    } catch (err) {
      reject(err);
    }
  });
}

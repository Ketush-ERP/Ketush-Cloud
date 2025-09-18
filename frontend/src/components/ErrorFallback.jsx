import React from "react";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-100 text-red-800 rounded">
      <p className="font-bold">¡Ocurrió un error inesperado!</p>
      <pre className="text-xs">{error.message}</pre>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={resetErrorBoundary}
      >
        Reintentar
      </button>
    </div>
  );
}

export default ErrorFallback;

// Configuración del backend API
export const API_NODE = import.meta.env.VITE_NODE_API || "http://localhost:4000";

// Usar backend remoto (true) o localStorage para mock data (false)
export const USE_REMOTE = import.meta.env.VITE_USE_REMOTE === "true" || false;

console.log("🔧 Config:", { API_NODE, USE_REMOTE });

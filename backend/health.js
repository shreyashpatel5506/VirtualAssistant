// backend/health.js
export const healthCheck = () => {
  return {
    status: "ok",
    service: "communication-server",
    timestamp: Date.now(),
  };
};

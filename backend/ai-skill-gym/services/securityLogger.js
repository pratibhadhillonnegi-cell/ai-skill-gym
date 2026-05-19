/**
 * Production-Grade Security Audit Logger
 * Logs anomalous patterns and security events.
 */

const logSecurityEvent = (event, data) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  };
  
  // In production, send to an external append-only log sink (e.g., Datadog, ELK, CloudWatch)
  console.warn(`[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`);
};

module.exports = { logSecurityEvent };

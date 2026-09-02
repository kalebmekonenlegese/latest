const auditLog = require('../utils/audit-log');

const auditEvent = (req, action, status, details = {}) => {
  auditLog({
    action,
    status,
    requestId: req.id,
    ip: req.ipAddress,
    method: req.method,
    path: req.path,
    userId: req.user?.id || null,
    details
  });
};

module.exports = auditEvent;

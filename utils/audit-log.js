const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const auditLogDir = path.join(__dirname, '..', 'logs');
const auditLogFile = path.join(auditLogDir, 'audit.log');

if (!fs.existsSync(auditLogDir)) {
  fs.mkdirSync(auditLogDir, { recursive: true });
}

const auditLog = (entry) => {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    fs.appendFileSync(auditLogFile, JSON.stringify(payload) + '\n', 'utf8');
  } catch (error) {
    logger.error('Audit log write failed: %o', error);
  }
};

module.exports = auditLog;

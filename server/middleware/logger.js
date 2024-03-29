import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = (req, res, next) => {
    res.on('finish', () => {
        const log = `Time: ${new Date().toLocaleString()}, Method: ${req.method}, URL: ${req.originalUrl}, Status: ${res.statusCode}\n`;
        const logDir = path.join(__dirname, '../logs');
        const logFile = path.join(logDir, 'request.log');

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        fs.appendFile(logFile, log, err => {
            if (err) {
                console.error('Failed to write to log file:', err);
            }
        });
    });

    next();
};

export default logger;
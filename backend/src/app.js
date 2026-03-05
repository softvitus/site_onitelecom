import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler, requestLogger, coloredStatusLogger } from './middleware/index.js';
import { captureAuditData } from './middleware/audit.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { HealthCheckService } from './services/HealthCheckService.js';
import { ResponseFormatter } from './utils/ResponseFormatter.js';
import { errorCodeMiddleware } from './utils/ErrorCodes.js';

const app = express();
const API_VERSION = process.env.API_VERSION;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(generalLimiter);

// Response Formatter - Injeta helpers no res (res.success, res.error, res.paginated)
app.use(ResponseFormatter.middleware());

// Logging
app.use(requestLogger);
app.use(coloredStatusLogger);

// Audit
app.use(captureAuditData);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Checks
app.get('/health', async (req, res) => {
  try {
    const health = await HealthCheckService.getApplicationHealth();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() });
  }
});

app.get('/health/ready', async (req, res) => {
  try {
    const probe = await HealthCheckService.getReadinessProbe();
    res.status(probe.ready ? 200 : 503).json(probe);
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
});

app.get('/health/live', (req, res) => {
  res.json(HealthCheckService.getLivenessProbe());
});

// Documentation (Disponível apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
}

// Routes
app.use(`/api/${API_VERSION}`, apiRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorCodeMiddleware); // Trata ApiError com códigos padronizados
app.use(errorHandler);

export default app;

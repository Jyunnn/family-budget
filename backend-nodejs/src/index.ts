import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import membersRouter from './routes/members';
import categoriesRouter from './routes/categories';
import expensesRouter from './routes/expenses';
import analyticsRouter from './routes/analytics';
import remittanceRouter from './routes/remittance';
import householdAccountsRouter from './routes/household-accounts';
import transactionsRouter from './routes/transactions';
import householdAnalyticsRouter from './routes/household-analytics';
import healthRouter from './routes/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/remittance', remittanceRouter);
app.use('/api/household-accounts', householdAccountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/household-analytics', householdAnalyticsRouter);
app.use('/api/health', healthRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Family Budget API running on port ${PORT}`);
  });
}

export default app;

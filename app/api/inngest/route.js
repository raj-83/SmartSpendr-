
import { serve } from 'inngest/next';


import { inngest } from '@/lib/inngest/client';
import { checkBudgetAlert, generateMoonthlyReports, processRecurringTransaction, triggerRecurringTransactions } from '@/lib/inngest/function';



export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
     // <-- This is where you'll always add all your functions
     checkBudgetAlert,triggerRecurringTransactions,
     processRecurringTransaction,
     generateMoonthlyReports
  ],
});


import { serve } from 'inngest/next';


import { inngest } from '@/app/lib/inngest/client';
import { checkBudgetAlert } from '@/app/lib/inngest/function';



export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
     // <-- This is where you'll always add all your functions
     checkBudgetAlert
  ],
});

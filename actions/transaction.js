'use server';

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const serializeAmount = (obj) => ({
   ...obj,
   amount: obj.amount.toNumber(),

});

export async function  createTransaction(data){


  try{

       const {userId} = await auth();

       if(!userId) throw new Error("Unauthorized");

       const user = await db.user.findUnique({
        where:{clerkUserId:userId},
       });
       
         if(!user) throw new Error("User not found");

         const account = await db.account.findUnique({
            where:{
                id:data.accountId,
                userId:user.id,
            }
         });

         if(!account) throw new Error("Account not found");

         const balanceChange = data.type === "Expense" ? -data.amount : data.amount;

        const newBalance = account.balance + balanceChange;

        const transaction = await   db.$transaction(async (tx)=>{
             
            const newTransaction = await tx.transaction.create({
                data:{
                    ...data,
                    userId:user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,

                },
            });


            await tx.account.update({
                where:{id:account.id},
                data:{
                    balance:newBalance,
                }
            });
            return newTransaction;
        });

        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);

        return {success:true, data:serializeAmount(transaction)};



     } catch(error){
        throw new Error("Failed to create transaction: " + error.message);   
  }

}


// Helper function to calculate the next recurring date
function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate); // Create a copy of the current date        
    switch (interval) {
        case 'DAILY':
            date.setDate(date.getDate() + 1);
            break;  
        case 'WEEKLY':
            date.setDate(date.getDate() + 7);
            break;
        case 'MONTHLY':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'YEARLY':
            date.setFullYear(date.getFullYear() + 1);
            break;  

    }
         return date;
}


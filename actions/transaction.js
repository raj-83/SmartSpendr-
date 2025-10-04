'use server';

import aj from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {GoogleGenerativeAI} from "@google/generative-ai"



  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const serializeAmount = (obj) => ({
   ...obj,
   amount: obj.amount.toNumber(),

});

export async function  createTransaction(data){


  try{

       const {userId} = await auth();

       if(!userId) throw new Error("Unauthorized");

       //Arcjet to add rate limiting
       const req = await request();

       //check rate limit

       const decision = await aj.protect(req,{
           userId,
           requested:1,

       });

       if(decision.isDenied()){
           
        if(decision.reason.isRateLimit()){
              const {remaining,reset} =decision.reason;
              console.error({
                 code:"Rate_Limit_EXCEEDED",
                 details:{
                     remaining,
                     resetInSeconds:reset,
                 },
              });

              throw new Error ("Too many requests.Please try again later.");
        }
        throw new Error("Requests Blocked");
       }

       const user = await db.user.findUnique({
        where:{clerkUserId:userId},
       });
       
         if(!user) throw new Error("User not found");

         const account = await db.account.findUnique({
            where:{
                id:data.accountId,
                userId:user.id,
            },
         });

         if(!account) throw new Error("Account not found");

         const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

        const newBalance = account.balance.toNumber() + balanceChange;

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
                },
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


export async function scanReceipt (file){
        

    try{
         
        const model = genAI.getGenerativeModel({model:"gemini-2.5-flash"});

        //convert file to arraybuffer
        const arrayBuffer = await file.arrayBuffer();

       //convert ArrayBuffer to Base64

       const base64String = Buffer.from(arrayBuffer).toString("base64");


       const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;
       const result = await model.generateContent([{

           inlineData:{
              data:base64String,
              mimeType:file.type,

           },
           

       },
    //    prompt,
     { text: prompt },
    ]);
    
         const response = await result.response;

         const text = response.text();

           const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();


      try{
         const data =JSON.parse(cleanedText);
         return {
             amount:parseFloat(data.amount),
             date:new Date(data.date),
             description:data.description,
             category:data.category,
             merchantName:data.merchantName,
         };
      }

      catch(parseError){
          
        console.error("Error Parsing JSON response:",parseError);
        throw new Error ("Invalid response format from Gemini");
      }


    }
    catch(error){
        console.error("Error scanning receipt:",error.message);
         throw new Error ("Failed to Scan reciept");
        
    }
}



"use client";
import React from 'react'
import  { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { useForm } from 'react-hook-form';
import {zodResolver} from "@hookform/resolvers/zod";
import { accountSchema } from '@/app/lib/schema';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const CreateAccountDrawer = ({children}) => {
    const [open, setOpen] =useState(false);

  const {register,handlesubmit,formState:{errors},SetValue,watch,reset,}=useForm({
            resolver:zodResolver(accountSchema),
             defaultValues:{
               name:"",
               type: "CURRENT",
               balance:"",
               isDefault:false,

             },
        }) ;
  
    return (
    <Drawer open={open} onOpenChange={setOpen}>

        <DrawerTrigger> {children}
        </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>
                      Create New Account
                    </DrawerTitle>
                </DrawerHeader>


                <div className="px-4 pb-4" >
                    <form className="space-y-4">
                   
                   <div className="space -y-2">


                   <label htmlFor="name" className="text-sm font-medium">
    Account Name

</label>
        <Input  id="name" placeholder="e.g., Main checking" {...register("name")}/>

        {errors.name &&  (<p className="text-sm text-red-500">{errors.name.message}</p>)}
                   </div>




                   <div className="space -y-2">


                   <label htmlFor="type" className="text-sm font-medium">
    Account Type

</label>

<Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
        {errors.name &&  (<p className="text-sm text-red-500">{errors.name.message}</p>)}
                   </div>





                   
                    

                    </form>
                </div>
            </DrawerContent>
        
    </Drawer>
  )
};

export default CreateAccountDrawer;


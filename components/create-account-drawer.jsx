"use client"
import React, { useState } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';

const CreateAccountDrwaer = ({children}) => {
    const [open, setOpen] = useState(false);
  return (
    <Drawer>

        <DrawerTrigger open ={open} onOpenChange={setOpen}> {children}
        </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>
                        Are You absolutely sure?
                    </DrawerTitle>
                </DrawerHeader>
            </DrawerContent>
        
    </Drawer>
  )
}

export default CreateAccountDrwaer;

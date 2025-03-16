import React, { Suspense } from 'react'
import DashboardPage from './page'
import {BarLoader} from 'react-spinners'

const DashboardLayout = () => {
  return (
    <div>
        <h1 className='text-6xl font-bold gradient-title mb-5'>Dashboard</h1>

        <Suspense fallback= {<BarLoader/>} >
            <DashboardPage/>
        </Suspense>
    </div>
  )
}

export default DashboardLayout
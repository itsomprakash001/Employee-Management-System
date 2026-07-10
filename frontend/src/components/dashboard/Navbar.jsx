import React from 'react'
import { useAuth } from '../../context/authContext'


const Navbar = () => {
    const {user, logout} = useAuth()
  return (
    <div className="h-16 bg-teal-500 flex items-center text-white justify-between items-center px-6 shadow">
      <h2 className="text-xl font-semibold">
        Welcome, {user.name}
      </h2>
         <button
  className="px-4 py-1 bg-teal-700 text-white rounded cursor-pointer hover:bg-teal-800 transition" 
  onClick={logout}
>
  Logout
</button>
    </div>
  )
}

export default Navbar

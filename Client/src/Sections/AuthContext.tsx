//   first we  gona define  what   the contex hold means there are some componts need some data so we need to define that
//  navbar like the username
//  profile: other related things
//   the contex must hold 
    //    1:data holds
//        2:Action it do


import type { ReactNode } from "react";
import { createContext ,useContext,useState,useEffect} from "react";


  type UserType ={
    id:number,
     username:string,
     email:string,

  }

 type ContextType= {
    user:UserType |null,
    loading :boolean,
    setUser:(user:UserType | null )=> void
    logout :()=>Promise<void>

 }

 const AuthConetx=createContext<ContextType |undefined >(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user,setUser]=useState<UserType |null >(null)
   const [loading,setLoading]=useState(true)


   useEffect(()=> {
   async function  CatchMe() {
    try {
      const res=await fetch(`http://localhost:2040/api/me`,{credentials:"include"})
      if(res.ok) {
         const data= await res.json()
         setUser(data.user)

         
      } else {
 setUser(null);
      } 
     
    } catch (error) {
      console.log("no user load in",error)

    } finally {
      setLoading(false)
    }
      

   }CatchMe()   },[])


   async  function logout() {
   const res=   await fetch(`localhost://2040/logout`,{
         method:"POST",credentials:"include"
      })

         if (!res.ok) {
           throw new Error("Logout failed");
         }
      setUser(null)
   }
   return (
     <AuthConetx.Provider value={{ user, loading, setUser, logout }}>
       {/* AuthConetx */}
       {children}
     </AuthConetx.Provider>
   );
}

export default function useAuth() {
   const context=useContext(AuthConetx)
   if(!context)  throw new Error("authContext must be under provider")

      return context

}


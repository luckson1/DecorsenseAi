
import {
    ChevronDownIcon,
    PlusIcon,

  } from "@radix-ui/react-icons"
  
  import { Button } from "./ui/button"

  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "./ui/dropdown-menu"
import Link from "next/link"

import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import { signOut, useSession } from "next-auth/react"


  
  export function Account() {

    const { data: session, } = useSession()

const handleSignOut = async () => {
  await signOut()
  router.refresh()
 router.replace('/auth')
}
    const router=useRouter()
    return (
    
          <div className="flex items-center space-x-1 rounded-md bg-accent text-accent-foreground">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <Button variant='ghost' className="px-3 shadow-none text-primary">
         <div className="flex space-x-1 justify-center items-center">
         <User className="mr-2 h-4 w-4 text-primary" />
          <p className="text-primary">Account</p>
             <ChevronDownIcon className="h-4 w-4 text-primary" />
         </div>
            </Button>
           
           
            
             
             
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                alignOffset={-5}
                className="w-[200px]"
                forceMount
              >
                <DropdownMenuLabel>Have an Account?</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
            <Link href={'/auth'} className="w-full">
          {  !session && <Button className="w-full" onClick={  ()=> { router.replace('/auth')}}>
            Login
             </Button>}
             {  session && <Button className="w-full bg-destructive hover:bg-opacity-30 hover:bg-destructive" onClick={  handleSignOut}>
            Logout
             </Button>}
            </Link>
                </DropdownMenuItem>
           {!session && <>
            <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or create account
            </span>
          </div>
        </div>
            
                <DropdownMenuItem>
                <Button variant={'outline'} className="w-full" onClick={  ()=> { router.replace('/auth')}}> 
             Sign up
             </Button>
                </DropdownMenuItem>
           </>}
         
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        
    )
  }
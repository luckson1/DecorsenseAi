
import Image from "next/image";
import Link from "next/link";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { type LucideProps } from "lucide-react";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;
const Google=(props: LucideProps)=> {
    return     (<svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    />
  </svg>)
}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {


  const [email, setEmail] = useState("");

  
  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Toaster position="top-right" reverseOrder={false} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn('email', {callbackUrl: "/dream"});
        }}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
        
            />
          </div>
          <Button
            className="bg-teal-500 hover:bg-teal-700"
      
          >
          
            Sign In with Email
          </Button>
        
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={() =>  signIn("google", { callbackUrl: "/dream" })}
        // disabled={isLoading}
      >
      
          <Google className="mr-2 h-4 w-4" />
     
        Google
      </Button>
    </div>
  );
}


export default  function  AuthenticationPage() {

  return (
    <>
      <div className="container relative  h-[800px] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="bg-muted relative  h-full flex-col p-10 text-white dark:border-r :flex">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1535356795203-50b2eb73f96c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2394&q=80)",
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Image
              src={
                "https://res.cloudinary.com/dhciks96e/image/upload/v1686921534/Screen_Shot_2023-06-16_at_1.45.31_PM-removebg-preview_r97cfc.png"
              }
              height={50}
              width={50}
              alt="Sino Remit"
              className="mr-2 h-6 w-6"
            />{" "} 
           DesignSenseAI
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">Make your dreams come true</p>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-muted-foreground text-sm">
                Enter your email below to create your account
              </p>
            </div>
            <UserAuthForm />
            <p className="text-muted-foreground px-8 text-center text-sm">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="hover:text-primary underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="hover:text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

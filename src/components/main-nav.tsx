"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";
import { siteConfig } from "@/lib/config";


export function MainNav() {

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-4">
        <Image
          className="h-8 w-16"
          alt="logo"
          src={"/logo.png"}
          height={50}
          width={50}
        />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href={"/dream"}
          className={cn("flex items-center px-4", "font-bold text-primary")}
        >
        Get Ideas
        </Link>
      

      </nav>
    </div>
  );
}

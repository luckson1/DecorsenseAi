import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SiteHeader />
       <Component {...pageProps} />
       </ThemeProvider>
      
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

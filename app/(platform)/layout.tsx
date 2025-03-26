import { ModalProvider } from "@/components/providers/modal-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { PostHogIdentify } from "@/components/providers/posthog-identify";

const PlatformLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <QueryProvider>
        <Toaster />
        <ModalProvider />
        <PostHogIdentify />
        {children}
      </QueryProvider>
    </ClerkProvider>
  );
};

export default PlatformLayout;

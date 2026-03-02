"use client";

import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";

interface LoadingOverlayProps {
  loading: boolean;
  isConnected: boolean;
}

export function LoadingOverlay({ loading, isConnected }: LoadingOverlayProps) {
  const message = loading
    ? "Loading requests..."
    : !isConnected
      ? "Connecting to stream..."
      : "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-lg font-semibold text-foreground">{message}</p>
      </motion.div>
    </div>
  );
}

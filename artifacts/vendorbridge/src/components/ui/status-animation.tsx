import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error" | "warning" | "pending";

interface StatusAnimationProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  showIcon?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const statusConfig = {
  idle: { icon: null, color: "text-muted-foreground", bg: "bg-muted" },
  loading: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  error: { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
  warning: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" },
  pending: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
};

export function StatusAnimation({ 
  status, 
  size = "md", 
  className, 
  text,
  showIcon = true 
}: StatusAnimationProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center gap-3"
      >
        {showIcon && Icon && (
          <motion.div
            animate={
              status === "loading" 
                ? { rotate: 360 }
                : status === "warning"
                ? { rotate: [-5, 5, -5, 5, 0] }
                : {}
            }
            transition={
              status === "loading"
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : status === "warning"
                ? { duration: 0.5 }
                : {}
            }
          >
            <Icon className={cn(sizeClasses[size], config.color, className)} />
          </motion.div>
        )}
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("text-sm font-medium", config.color)}
          >
            {text}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function StatusBadge({ 
  status, 
  text, 
  className 
}: { 
  status: Status; 
  text?: string; 
  className?: string;
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
        config.bg,
        config.color,
        className
      )}
    >
      {Icon && (
        <motion.div
          animate={status === "loading" ? { rotate: 360 } : {}}
          transition={
            status === "loading"
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : {}
          }
        >
          <Icon className="h-4 w-4" />
        </motion.div>
      )}
      {text && <span>{text}</span>}
    </motion.div>
  );
}

export function ProgressAnimation({ 
  progress, 
  text,
  className 
}: { 
  progress: number; 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex justify-between items-center">
        {text && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-muted-foreground"
          >
            {text}
          </motion.span>
        )}
        <motion.span
          key={progress}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-sm font-bold text-primary"
        >
          {progress}%
        </motion.span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

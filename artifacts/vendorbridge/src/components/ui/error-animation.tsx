import { motion } from "framer-motion";
import { XCircle, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "x" | "circle" | "shake" | "alert";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export function ErrorAnimation({ 
  size = "md", 
  className, 
  text,
  variant = "circle" 
}: ErrorAnimationProps) {
  if (variant === "shake") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            x: [0, -10, 10, -10, 10, 0],
          }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
            x: {
              duration: 0.5,
              delay: 0.2,
            },
          }}
        >
          <motion.div
            className={cn(
              "rounded-full bg-red-500 flex items-center justify-center",
              sizeClasses[size],
              className
            )}
          >
            <X className="text-white" style={{ width: "60%", height: "60%" }} strokeWidth={3} />
          </motion.div>
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-medium text-red-600 text-center"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "x") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
        >
          <X 
            className={cn("text-red-500", sizeClasses[size], className)} 
            strokeWidth={3}
          />
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground text-center"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "alert") {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
          >
            <AlertCircle 
              className={cn("text-red-500", sizeClasses[size], className)} 
            />
          </motion.div>
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-medium text-red-600 text-center"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default circle variant
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <XCircle 
          className={cn("text-red-500", sizeClasses[size], className)} 
        />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-red-600 text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function ErrorX({ className }: { className?: string }) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: "spring" as const, duration: 0.6, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    },
  };

  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        variants={draw}
      />
      <motion.path
        d="M 20 20 L 44 44 M 44 20 L 20 44"
        stroke="#ef4444"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        variants={draw}
      />
    </motion.svg>
  );
}

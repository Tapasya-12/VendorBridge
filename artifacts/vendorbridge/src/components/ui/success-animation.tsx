import { motion } from "framer-motion";
import { CheckCircle2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "checkmark" | "circle" | "bounce";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export function SuccessAnimation({ 
  size = "md", 
  className, 
  text,
  variant = "circle" 
}: SuccessAnimationProps) {
  if (variant === "bounce") {
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
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 2,
              ease: "easeInOut",
            }}
            className={cn(
              "rounded-full bg-green-500 flex items-center justify-center",
              sizeClasses[size],
              className
            )}
          >
            <Check className="text-white" style={{ width: "60%", height: "60%" }} />
          </motion.div>
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-medium text-green-600"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "checkmark") {
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
          <Check 
            className={cn("text-green-500", sizeClasses[size], className)} 
            strokeWidth={3}
          />
        </motion.div>
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground"
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
        <CheckCircle2 
          className={cn("text-green-500", sizeClasses[size], className)} 
        />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-green-600"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

export function SuccessCheckmark({ className }: { className?: string }) {
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
        stroke="#22c55e"
        strokeWidth="4"
        fill="none"
        variants={draw}
      />
      <motion.path
        d="M 16 32 L 28 44 L 48 20"
        stroke="#22c55e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={draw}
      />
    </motion.svg>
  );
}

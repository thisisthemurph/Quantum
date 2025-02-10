import { useState, ReactNode, useEffect } from "react";
import { motion } from "framer-motion";

interface PasswordStrengthIndicatorProps {
  password: string;
  children: ReactNode;
}

export function PasswordStrengthIndicator({ password, children }: PasswordStrengthIndicatorProps) {
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  useEffect(() => {
    const calculateStrength = (value: string) => {
      let strength = 0;
      if (value.length > 4) strength = 1;
      if (value.length > 8) strength = 2;
      if (value.length > 12) strength = 3;
      if (value.length > 16) strength = 4;
      setPasswordStrength(strength);
    };

    calculateStrength(password);
  }, [password]);

  return (
    <div>
      {children}
      <div className="flex justify-between gap-1 mt-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-[0.15rem] w-full rounded bg-gray-300 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-green-400"
              animate={{
                width: index < passwordStrength ? "100%" : "0%",
              }}
              initial={{ width: "0%" }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                delay: index * 0.1, // Stagger effect
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

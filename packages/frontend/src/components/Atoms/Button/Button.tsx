
import styles from "./Button.module.scss";
import { motion } from "motion/react";

interface ButtonProps {
  appearance?: "primary" | "secondary" | 'outline' | 'text' | 'ghost';
  full?: boolean;
  href?: string;
  children: React.ReactNode | string;
  stiffness?: number;
  damping?: number;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void | Promise<void>;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  title?: string;
};

export function Button({
  appearance = "primary",
  full = false,
  href,
  children,
  stiffness = 300,
  damping = 15,
  size = 'medium',
  ...props
}: ButtonProps) {
  const Component = href ? motion.a : motion.button;

  return (
    <Component
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.9, y: 1 }}
      transition={{ type: "spring", stiffness, damping, duration: 10 }}
      href={href}
      {...props}
      className={`${styles.btn} ${styles[appearance]} ${full && styles.full} ${styles[size]}`}
    >
      <span>{children}</span>
    </Component>
  );
}

export default Button;


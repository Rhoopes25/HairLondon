import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { Link } from 'react-router';
import { cx } from '@app/lib/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'outline' | 'onPhoto';
export type ButtonSize = 'md' | 'sm';

interface LookProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

function look({ variant = 'primary', size = 'md', fullWidth = false }: LookProps): string {
  return cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, LookProps {}

/** A real <button>. Use LinkButton when the action navigates. */
export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cx(look({ variant, size, fullWidth }), className)} {...rest} />
  );
}

export interface LinkButtonProps extends ComponentProps<typeof Link>, LookProps {}

/** Looks like a Button, behaves like a link. */
export function LinkButton({ variant, size, fullWidth, className, ...rest }: LinkButtonProps) {
  return <Link className={cx(look({ variant, size, fullWidth }), className)} {...rest} />;
}

/** A quiet underlined text button, e.g. "Back" or "Cancel". */
export function TextButton({
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(styles.text, className)} {...rest} />;
}

/** A quiet underlined link, e.g. "Back to home". */
export function QuietLink({ className, ...rest }: ComponentProps<typeof Link>) {
  return <Link className={cx(styles.quietLink, className)} {...rest} />;
}

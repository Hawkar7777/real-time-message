type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-block transition-all duration-300  ${className}   cursor-pointer rounded-full  `}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

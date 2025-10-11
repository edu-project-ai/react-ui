interface FormDividerProps {
  text?: string;
}

export default function FormDivider({
  text = "Or continue with email",
}: FormDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}

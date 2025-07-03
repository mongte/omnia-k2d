import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        neumorphic: "bg-[#fafbfc] text-[#374151] rounded-[0.3rem] shadow-[1px_1px_1px_rgba(0,0,0,0.1),_-1px_-1px_1px_rgba(255,255,255,1)] hover:shadow-[1px_1px_1px_rgba(0,0,0,0.12),_-1px_-1px_1px_rgba(255,255,255,1)] active:shadow-[inset_1px_1px_1px_rgba(0,0,0,0.08),_inset_-1px_-1px_1px_rgba(255,255,255,0.9)] border border-transparent bg-gradient-to-br from-white/60 to-gray-200/30 bg-clip-padding transition-all duration-300",
      },
      size: {
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      align: {
        default: "inline-flex items-center justify-center",
        start: "justify-start",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      align: "default", // justify-center가 기본값으로 유지됨
    },
  }
)

function Button({
  className,
  variant,
  size,
  align,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, align, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants } 
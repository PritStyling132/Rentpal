import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-3 p-4 md:max-w-[440px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-lg border-l-4 bg-white p-6 pr-12 shadow-lg transition-all duration-500 ease-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-90 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0 hover:shadow-2xl hover:translate-x-[-4px]",
  {
    variants: {
      variant: {
        default: "border-l-[#161A1D] bg-[#F5F3F4] text-[#0B090A]",
        success: "border-l-[#BA181B] bg-white text-[#660708]",
        destructive: "border-l-[#E5383B] bg-[#0B090A] text-[#F5F3F4]",
        warning: "border-l-[#A4161A] bg-[#F5F3F4] text-[#660708]",
        info: "border-l-[#B1A7A6] bg-white text-[#161A1D]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const iconVariants = cva("shrink-0 mt-0.5", {
  variants: {
    variant: {
      default: "text-[#161A1D]",
      success: "text-[#BA181B]",
      destructive: "text-[#E5383B]",
      warning: "text-[#A4161A]",
      info: "text-[#B1A7A6]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants> & { showIcon?: boolean }
>(({ className, variant, showIcon = true, children, ...props }, ref) => {
  const Icon = variant === "success" ? CheckCircle 
    : variant === "destructive" ? AlertCircle 
    : variant === "warning" ? AlertTriangle 
    : variant === "info" ? Info 
    : null;

  return (
    <ToastPrimitives.Root 
      ref={ref} 
      className={cn(toastVariants({ variant }), className)} 
      {...props} 
    >
      {showIcon && Icon && (
        <Icon className={cn(iconVariants({ variant }), "h-5 w-5")} />
      )}
      <div className="flex-1">{children}</div>
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#660708] bg-transparent px-4 text-sm font-serif font-medium text-[#660708] transition-all duration-200 hover:bg-[#660708] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#A4161A] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-4 top-4 rounded-md p-1 opacity-60 transition-all duration-200 hover:opacity-100 hover:bg-[#0B090A]/5 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#660708] group-[.destructive]:hover:bg-white/10",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title 
    ref={ref} 
    className={cn("text-lg font-semibold leading-tight tracking-tight", className)} 
    {...props} 
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description 
    ref={ref} 
    className={cn("text-sm opacity-90 mb-1.5 leading-relaxed", className)} 
    {...props} 
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
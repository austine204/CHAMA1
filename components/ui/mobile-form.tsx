"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-base font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

interface MobileInputProps extends React.ComponentProps<typeof Input> {
  label: string
  required?: boolean
  error?: string
}

export function MobileInput({ label, required, error, className, ...props }: MobileInputProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Input
        className={cn(
          "h-12 text-base border-2 focus:border-primary transition-colors",
          error && "border-red-500 focus:border-red-500",
          className,
        )}
        {...props}
      />
    </FormField>
  )
}

interface MobileSelectProps {
  label: string
  required?: boolean
  error?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function MobileSelect({
  label,
  required,
  error,
  placeholder,
  value,
  onValueChange,
  children,
  className,
}: MobileSelectProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "h-12 text-base border-2 focus:border-primary transition-colors",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormField>
  )
}

interface MobileFormProps {
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
  className?: string
}

export function MobileForm({ onSubmit, children, className }: MobileFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  )
}

interface MobileSubmitButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean
  loadingText?: string
}

export function MobileSubmitButton({
  loading,
  loadingText = "Loading...",
  children,
  className,
  ...props
}: MobileSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn("w-full h-12 text-base font-semibold", className)}
      {...props}
    >
      {loading ? loadingText : children}
    </Button>
  )
}

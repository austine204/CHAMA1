"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

interface FormField {
  name: string
  label: string
  type: "text" | "email" | "tel" | "number" | "select" | "textarea"
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: (value: string) => string | null
}

interface MobileFormProps {
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, string>) => Promise<void>
  submitLabel?: string
  loading?: boolean
  className?: string
}

export function MobileForm({
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  className,
}: MobileFormProps) {
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate fields
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name] || ""

      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`
      } else if (field.validation) {
        const error = field.validation(value)
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData)
    }
  }

  const updateField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <Card className={cn("w-full", className)} data-testid="mobile-form">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-base font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === "select" ? (
                <Select value={formData[field.name] || ""} onValueChange={(value) => updateField(field.name, value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  rows={3}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-12 text-base"
                />
              )}

              {errors[field.name] && <p className="text-sm text-red-600">{errors[field.name]}</p>}
            </div>
          ))}

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input id="name" type="text" placeholder="John Doe" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="number">Ph Number</FieldLabel>
          <Input id="number" type="number" placeholder="91+" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="text">Organization Name</FieldLabel>
          <Input id="text" type="text" placeholder="Organization Name" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Organization Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@organization.com" required />
        </Field>

        <Select>
          <FieldLabel htmlFor="text">Designation</FieldLabel>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Designation</SelectLabel>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Field className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <Input id="confirm-password" type="password" required />
          </Field>
        </Field>

        {/* ✅ Professional Terms & Conditions Section */}
        <div className="flex items-start gap-3 mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-black cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-gray-700 leading-snug">
            I agree to the{" "}
            <a
              href="/terms-and-conditions.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Terms &amp; Conditions
            </a>{" "}
            (PDF)
          </label>
        </div>

        <Field>
          <Button type="submit" className="w-full mt-1">
            Create Account
          </Button>
        </Field>

        <FieldDescription className="px-6 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            Sign in
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  )
}

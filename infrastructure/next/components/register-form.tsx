"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    function register(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = {
            lastname: formData.get("lastname"),
            firstname: formData.get("firstname"),
            email: formData.get("email"),
            password: formData.get("password"),
        };
        fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert("Register successfully");})
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create a new account</CardTitle>
          <CardDescription>
            Enter your email below to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={register}>
            <FieldGroup>
                <Field>
                <FieldLabel htmlFor="lastname">Lastname</FieldLabel>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Doe"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="firstname">Firstname</FieldLabel>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="John"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit"  >Register</Button>
                <FieldDescription className="text-center">
                    <span>have an account? </span><a href="/login">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

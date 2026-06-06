import { useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const forgotPasswordMutation = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      await forgotPasswordMutation.mutateAsync({ data });
      setSubmitted(true);
      toast({
        title: "Request Sent",
        description: "If an account exists with that email, we've sent reset instructions.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request failed",
        description: "An error occurred. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-3xl tracking-tight">
            <Logo className="w-12 h-12 shrink-0" />
            <span>
              <span style={{ color: '#235A7B' }}>Vendor</span>
              <span style={{ color: '#79AE61' }}>Bridge</span>
            </span>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              {submitted 
                ? "Check your email for reset instructions." 
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-medium" 
                    disabled={forgotPasswordMutation.isPending}
                    data-testid="button-submit-reset"
                  >
                    {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Button 
                variant="outline"
                className="w-full h-11"
                onClick={() => setLocation("/login")}
                data-testid="button-back-to-login"
              >
                Back to Login
              </Button>
            )}

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link href="/login" data-testid="link-login">
                <span className="font-medium text-primary hover:underline cursor-pointer">
                  Sign in
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
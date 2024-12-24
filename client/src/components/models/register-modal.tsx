"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/data/schema";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { AnimatedModal } from "../external/aceternity/animated-modal";
import { Input } from "../ui/input";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { registerUser } from "@/api/user";
import { toast } from "sonner";

export const RegisterModal = () => {
  const { onOpen, onClose } = useModal();
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const handleLink = () => {
    onClose();
    setTimeout(() => {
      onOpen("Login");
    }, 200);
  };

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      };
      await registerUser(payload);
      toast.success("Account created successfully. Please login to continue.");
      form.reset();
      onClose();
      setTimeout(() => {
        onOpen("Login");
      }, 200);
    } catch {
      toast.error("Something went wrong. Please try again later.");
      setError("An error occurred while registering");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal
      modalType="Register"
      className="md:max-w-[30%]"
      key="registerModal"
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-3xl text-white/80 font-semibold">
          Sign Up
        </div>
        <hr className="w-full border-gray-400 h-[1px] mt-4" />
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-start justify-start w-full">
                <div className="w-full flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-lg">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            placeholder="Enter your name"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0 "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-lg">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            placeholder="Enter your name"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0 "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-lg">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          disabled={isSubmitting}
                          placeholder="Enter your email"
                          className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0 "
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-lg">Password</FormLabel>
                      <FormControl>
                        <>
                          <Input
                            {...field}
                            type="password"
                            isPassword={true}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            disabled={isSubmitting}
                            placeholder="Enter your password"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
                          />
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormError message={error} />
                <FormSuccess message={success} />
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full mt-4"
                >
                  Create an account
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="mb-2 text-center">
        <Button variant="link" className="text-base" onClick={handleLink}>
          Already have an account? Sign in
        </Button>
      </div>
    </AnimatedModal>
  );
};

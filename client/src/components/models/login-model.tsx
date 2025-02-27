"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/data/schema";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { loginUser } from "@/api/user";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

export const LoginModal = () => {
  const state = useUser((state) => state);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { onOpen, onClose } = useModal();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setError(""), setSuccess("");
  }, []);

  const handleLink = () => {
    setTimeout(() => {
      onClose();
      onOpen("Register");
    }, 200);
  };

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        email: values.email,
        password: values.password,
        username: values.username,
      };
      const {
        data: { user },
      } = await loginUser(payload);
      state.setUserInfo({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
      });
      state.setIsLoggedIn(true);
      onClose();
      toast.success("Logged in successfully.");
      form.reset();
    } catch {
      setError("Something went wrong!");
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal
      modalType="Login"
      className="md:max-w-[30%]"
      key={"loginModal"}
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-3xl text-white/80 font-semibold">
          Sign In
        </div>
        <hr className="w-full border-gray-400 h-[1px] mt-4" />
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-start justify-start w-full">
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-lg">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Enter your email"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-lg">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            disabled={isSubmitting}
                            placeholder="Enter your email"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
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
                              disabled={isSubmitting}
                              isPassword={true}
                              showPassword={showPassword}
                              setShowPassword={setShowPassword}
                              type="password"
                              placeholder="Enter your password"
                              className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
                            />
                          </>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>

                <FormError message={error} />
                <FormSuccess message={success} />
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full"
                >
                  Login
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <div className="mb-2 text-center">
        <Button variant="link" className="text-base" onClick={handleLink}>
          Don't have an account? Sign up
        </Button>
      </div>
    </AnimatedModal>
  );
};

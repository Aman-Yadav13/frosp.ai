import { CustomWobbleCard } from "./aceternity/custom-wobble-card";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/data/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./aceternity/input";
import * as z from "zod";
import { Button } from "./ui/button";
import { registerUser } from "@/api/user";
import { toast } from "sonner";
import { SiTheregister } from "react-icons/si";
import { useCustomTabs } from "@/hooks/useCustomTabs";

export const SignUpCard = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const { tabs, setTabs, setActive } = useCustomTabs();

  const moveSelectedTabToTopByValue = (value: string) => {
    const newTabs = [...tabs];
    const tabIndex = newTabs.findIndex((tab) => tab.value === value);
    if (tabIndex === -1) return;

    const selectedTab = newTabs.splice(tabIndex, 1)[0];
    newTabs.unshift(selectedTab);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

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
    } catch {
      toast.error("Something went wrong. Please try again later.");
      setError("An error occurred while registering");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInLink = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    moveSelectedTabToTopByValue("signin");
  };

  useEffect(() => {
    setError(""), setSuccess("");
  }, []);

  return (
    <CustomWobbleCard
      type="signup"
      containerClassName="h-[450px] w-[380px]"
      className="bg-slate-800 bg-opacity-60"
    >
      <div className="h-full w-full px-2 pt-4">
        <div className="w-full flex justify-center flex-col items-center">
          <SiTheregister className="h-6 w-6 text-slate-300" />
          <p className="text-xl text-slate-300">Sign Up</p>
        </div>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col space-y-2 w-full px-3">
                <div className="w-full flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col space-y-1">
                        <FormLabel className="text-base text-slate-300">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Enter your name"
                            className="w-full border-gray-500 outline-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-700 placeholder-slate-200"
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
                      <FormItem className="w-full flex flex-col space-y-1">
                        <FormLabel className="text-base text-slate-300">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Enter your username"
                            className="w-full border-gray-500 outline-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-700 placeholder-slate-200"
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
                    <FormItem className="w-full flex flex-col space-y-1">
                      <FormLabel className="text-base text-slate-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled={isSubmitting}
                          placeholder="Enter your email"
                          className="w-full border-gray-500 outline-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-700 placeholder-slate-200"
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
                    <FormItem className="w-full flex flex-col space-y-1">
                      <FormLabel className="text-base text-slate-300">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          type="password"
                          placeholder="*********"
                          className="w-full border-gray-500 outline-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-700 placeholder-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full !mt-4 bg-blue-600 text-white hover:bg-blue-500"
                >
                  Register
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="absolute bottom-4">
          <Button
            variant="link"
            className="text-sm text-slate-300"
            onClick={(e) => handleSignInLink(e)}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </CustomWobbleCard>
  );
};

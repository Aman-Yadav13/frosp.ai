import { CustomWobbleCard } from "./aceternity/custom-wobble-card";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { changePassword } from "@/api/user";
import { toast } from "sonner";
import { MdLockReset } from "react-icons/md";
import { resetPasswordSchema } from "@/data/schema";
import { useCustomTabs } from "@/hooks/useCustomTabs";

export const ResetPasswordCard = () => {
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

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await changePassword({
        oldPassword: form.getValues("oldPassword"),
        newPassword: form.getValues("newPassword"),
      });
      toast.success(response.message);
    } catch (error: any) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  const handleRegisterClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    moveSelectedTabToTopByValue("signup");
  };

  useEffect(() => {
    setError(""), setSuccess("");
  }, []);

  return (
    <CustomWobbleCard
      type="reset"
      containerClassName="h-[450px] w-[380px]"
      className="bg-slate-800  bg-opacity-60"
    >
      <div className="h-full w-full px-2 pt-4">
        <div className="w-full flex justify-center flex-col items-center">
          <MdLockReset className="h-6 w-6 text-slate-300" />
          <p className="text-xl text-slate-300">Reset Password</p>
        </div>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col space-y-2 w-full px-3">
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col space-y-1">
                      <FormLabel className="text-base text-slate-300">
                        Old Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          disabled={isSubmitting}
                          placeholder="Enter your old password"
                          className="w-full border-gray-500 outline-offset-0 focus-visible:ring-1 focus-visible:ring-offset-0 bg-slate-700 placeholder-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="w-full flex flex-col space-y-1">
                      <FormLabel className="text-base text-slate-300">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          type="password"
                          placeholder="Enter new password"
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
                  className="w-full !mt-4 bg-green-600 text-white hover:bg-green-500"
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="absolute bottom-4">
          <Button
            variant="link"
            className="text-sm text-slate-300"
            onClick={(e) => handleRegisterClick(e)}
          >
            Create an account
          </Button>
        </div>
      </div>
    </CustomWobbleCard>
  );
};

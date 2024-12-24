import * as z from "zod";
import { resetPasswordSchema } from "@/data/schema";
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
import { BaseModal } from "./base-modal";
import { Input } from "../ui/input";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import { changePassword } from "@/api/user";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";

export const ResetPasswordModal = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { onClose } = useModal();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    setError("");
    setSuccess("");
  }, []);

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
      onClose();
      form.reset();
    }
  };

  return (
    <BaseModal
      modalType="ResetPassword"
      className="md:max-w-[30%]"
      key={"ResetPassword"}
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-2xl text-white/80 font-semibold">
          Reset Password
        </div>
        <hr className="w-full border-gray-400 h-[1px] mt-4" />
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-start justify-start w-full">
                <>
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-base">
                          Old Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            isPassword={true}
                            showPassword={showOldPassword}
                            setShowPassword={setShowOldPassword}
                            type="password"
                            disabled={isSubmitting}
                            placeholder="Enter your old password"
                            className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
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
                      <FormItem className="w-full">
                        <FormLabel className="text-base">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <>
                            <Input
                              {...field}
                              isPassword={true}
                              showPassword={showNewPassword}
                              setShowPassword={setShowNewPassword}
                              disabled={isSubmitting}
                              type="password"
                              placeholder="Enter your new password"
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
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BaseModal>
  );
};

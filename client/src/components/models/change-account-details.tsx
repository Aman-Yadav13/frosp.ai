import * as z from "zod";
import { changeAccountDetailsSchema } from "@/data/schema";
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
import { updateAccount } from "@/api/user";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useUser } from "@/hooks/useUser";

export const ChangeAccountDetailsModal = () => {
  const state = useUser((state) => state);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const { onClose } = useModal();
  const form = useForm<z.infer<typeof changeAccountDetailsSchema>>({
    defaultValues: {
      fullName: "",
      email: "",
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
      const response = await updateAccount({
        fullName: form.getValues("fullName"),
        email: form.getValues("email"),
      });
      state.setIsLoggedIn(true);
      state.setUserInfo({
        _id: response.data._id,
        fullName: response.data.fullName,
        email: response.data.email,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        username: response.data.username,
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
      modalType="ChangeAccountDetails"
      className="md:max-w-[30%]"
      key={"ChangeAccountDetails"}
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-2xl text-white/80 font-semibold">
          Modify Account Details
        </div>
        <hr className="w-full border-gray-400 h-[1px] mt-4" />
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-start justify-start w-full">
                <>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-base">Full name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Enter name"
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
                        <FormLabel className="text-base">Email</FormLabel>
                        <FormControl>
                          <>
                            <Input
                              {...field}
                              disabled={isSubmitting}
                              type="email"
                              placeholder="Enter email"
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
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BaseModal>
  );
};

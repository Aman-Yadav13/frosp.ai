import * as z from "zod";
import { useForm } from "react-hook-form";
import { BaseModal } from "./base-modal";
import { createProjectSchema } from "@/data/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { Input } from "../ui/input";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { Button } from "../ui/button";
import { Language, Stack } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { createProject } from "@/api/repl";
import { toast } from "sonner";

export const CreateProject = () => {
  const form = useForm<z.infer<typeof createProjectSchema>>({
    defaultValues: {
      pname: "",
      planguage: undefined,
      pstack: undefined,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [randomProjectId, setRandomProjectId] = useState(false);
  const { onClose } = useModal();

  useEffect(() => {
    setError("");
    setSuccess("");
  }, []);

  useEffect(() => {
    if (randomProjectId) {
      form.setValue(
        "pname",
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
      );
    } else {
      form.setValue("pname", "");
    }
  }, [randomProjectId]);

  const handleCheckboxChange = (checked: boolean) => {
    setRandomProjectId(checked);
  };
  const onSubmit = async (values: z.infer<typeof createProjectSchema>) => {
    console.log(values);
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await createProject({
        pname: values.pname,
        planguage: values.planguage,
        pstack: values.pstack,
      });
      toast.success(
        `Project ${values.pname} created successfully. You can access it from your projects section.`
      );
      form.reset();
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error: any) {
      toast.error("Failed to create project. Please try again.");
      setError(error.message);
    } finally {
      setIsSubmitting(false);
      setRandomProjectId(false);
    }
  };

  return (
    <BaseModal
      modalType="CreateProject"
      className="xl:max-w-[30%] lg:max-w-[40%] max-w-[75%]"
      key={"CreateProject"}
      outsideClickHook={false}
    >
      <div className="flex flex-col px-6 py-4">
        <div className="text-center text-xl text-white/80 font-semibold">
          Create New Project
        </div>
        <hr className="w-full border-gray-400 h-[1px] mt-4" />
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 items-start justify-start w-full">
                <>
                  <FormField
                    control={form.control}
                    name="pname"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-base">
                          Project Name
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-1">
                            <Input
                              {...field}
                              type="text"
                              disabled={isSubmitting || randomProjectId}
                              placeholder="Enter project name"
                              className="w-full bg-transparent border-gray-500 outline-offset-0 focus-visible:ring-1 rounded-sm focus-visible:ring-offset-0"
                            />
                            <div className="flex items-center justify-center self-start">
                              <Checkbox
                                checked={randomProjectId}
                                onCheckedChange={(checked: boolean) =>
                                  handleCheckboxChange(checked)
                                }
                              />
                              <label className="ml-2 text-white text-sm font-extralight">
                                Generate Random ID
                              </label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-2 w-full">
                    <FormField
                      control={form.control}
                      name="planguage"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-base">
                            Select Base Language
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <>
                              <FormControl>
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value={Language.NODEJS}>
                                    Node.js
                                  </SelectItem>
                                  <SelectItem value={Language.PYTHON}>
                                    Python
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pstack"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-base">
                            Choose a stack
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={true}
                          >
                            <>
                              <FormControl>
                                <SelectTrigger className="">
                                  <SelectValue placeholder="Choose a stack" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value={Stack.MEAN}>
                                    MEAN
                                  </SelectItem>
                                  <SelectItem value={Stack.MERN}>
                                    MERN
                                  </SelectItem>
                                  <SelectItem value={Stack.MEVN}>
                                    MEVN
                                  </SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full  mt-8"
                >
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </BaseModal>
  );
};

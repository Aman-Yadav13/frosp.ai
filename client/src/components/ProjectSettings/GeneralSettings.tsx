import { useCurrentProject } from "@/hooks/useCurrentProject";
import { Input } from "../ui/input";
import { useState, useEffect, useCallback } from "react";
import { MdOutlineModeEdit, MdOutlineEditOff } from "react-icons/md";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import {
  getProjectLanguages,
  getProjectTags,
  updateGeneralProjectDetails,
} from "@/api/repl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MultiSelect } from "../ui/multi-select";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

export const GeneralSettings = () => {
  const { projectId } = useParams();
  const { project, setProject } = useCurrentProject((state) => state);
  const [availableTags, setAvailableTags] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const [availableLanguages, setAvailableLanguages] = useState<
    Record<string, string>
  >({});
  const [hasChanged, setHasChanged] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [],
    language: "",
    stack: "",
  });
  const [disabledFields, setDisabledFields] = useState({
    name: true,
    description: true,
    tags: true,
    language: true,
    stack: true,
  });
  const [updating, setUpdating] = useState(false);

  const getAvailableTags = useCallback(async () => {
    try {
      const resp = await getProjectTags();
      const tags = resp.tags.map((tag: any) => ({ label: tag, value: tag }));
      setAvailableTags(tags);
    } catch (e) {
      console.log(e);
    }
  }, []);
  const getAvailableLanguages = useCallback(async () => {
    try {
      const resp = await getProjectLanguages();
      setAvailableLanguages(resp.languages);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const handleDiscardChanges = () => {
    setFormData({
      name: project?.name,
      description: project?.description,
      tags: project?.tags,
      language: project?.language,
      stack: project?.stack,
    });
    setDisabledFields({
      name: true,
      description: true,
      tags: true,
      language: true,
      stack: true,
    });
  };

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      setProject({ ...project, ...formData });
      await updateGeneralProjectDetails(projectId!, formData);
      setDisabledFields({
        name: true,
        description: true,
        tags: true,
        language: true,
        stack: true,
      });
      toast.success("Project details updated successfully.");
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    getAvailableLanguages();
    getAvailableTags();
  }, [getAvailableLanguages, getAvailableTags]);

  useEffect(() => {
    setFormData({
      name: project?.name,
      description: project?.description,
      tags: project?.tags,
      language: project?.language,
      stack: project?.stack,
    });
  }, [project]);

  useEffect(() => {
    setHasChanged(
      JSON.stringify(formData) !==
        JSON.stringify({
          name: project?.name,
          description: project?.description,
          tags: project?.tags,
          language: project?.language,
          stack: project?.stack,
        })
    );
  }, [formData, project]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="h-full relative w-full"
      style={{ minHeight: `calc(100vh - 58px)` }}
    >
      <p className="text-gray-800 text-xl font-semibold px-4 py-2">
        {project?.name} / general
      </p>
      <div className="h-[1px] w-full px-2 bg-gray-400" />
      <div className="flex flex-col gap-2 mt-6">
        <div className="pl-6 pr-4">
          <label
            className={cn(
              "text-lg font-medium transition-all",
              disabledFields.name ? "text-gray-500" : "text-gray-600"
            )}
          >
            Name
          </label>
          <div className="flex items-center gap-1">
            <Input
              value={formData.name || ""}
              disabled={disabledFields.name || updating}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-[30%] text-gray-600 border-gray-400 disabled:bg-gray-200 disabled:text-black"
            />
            <div
              className="h-9 rounded-sm w-9 border border-gray-300 flex items-center justify-center cursor-pointer group hover:bg-gray-50 transition-all"
              role="button"
              onClick={() =>
                setDisabledFields((prev) => ({ ...prev, name: !prev.name }))
              }
            >
              {disabledFields.name ? (
                <MdOutlineModeEdit className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-all" />
              ) : (
                <MdOutlineEditOff className="h-5 w-5 text-gray-600  group-hover:text-gray-800 transition-all" />
              )}
            </div>
          </div>
        </div>
        <div className="pl-6 pr-4">
          <label
            className={cn(
              "text-lg font-medium transition-all",
              disabledFields.description ? "text-gray-500" : "text-gray-600"
            )}
          >
            Description
          </label>
          <div className="flex items-center gap-1">
            <Textarea
              rows={5}
              value={formData.description || ""}
              disabled={disabledFields.description || updating}
              placeholder="Give a description of your project"
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-[30%] text-gray-600 border-gray-400 disabled:bg-gray-200 disabled:text-black resize-none disabled:placeholder:text-gray-900"
            />
            <div
              className="h-9 rounded-sm w-9 border border-gray-300 flex items-center justify-center cursor-pointer group hover:bg-gray-50 transition-all self-end"
              role="button"
              onClick={() =>
                setDisabledFields((prev) => ({
                  ...prev,
                  description: !prev.description,
                }))
              }
            >
              {disabledFields.description ? (
                <MdOutlineModeEdit className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-all" />
              ) : (
                <MdOutlineEditOff className="h-5 w-5 text-gray-600  group-hover:text-gray-800 transition-all" />
              )}
            </div>
          </div>
        </div>
        <div className="pl-6 pr-4">
          <label
            className={cn(
              "text-lg font-medium transition-all",
              disabledFields.language ? "text-gray-500" : "text-gray-600"
            )}
          >
            Language
          </label>
          <div className="flex items-center gap-1">
            <Select
              disabled={disabledFields.language || updating}
              onValueChange={(value) => handleChange("language", value)}
              value={formData?.language || ""}
              defaultValue={formData?.language || ""}
            >
              <SelectTrigger className="w-[25%] text-gray-600 border-gray-400 disabled:bg-gray-200 disabled:text-black disabled:placeholder:text-gray-900">
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent className="bg-emerald-600  border-gray-400">
                {Object.entries(availableLanguages).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="focus:bg-emerald-700 focus:text-white"
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div
              className="h-9 rounded-sm w-9 border border-gray-300 flex items-center justify-center cursor-pointer group hover:bg-gray-50 transition-all self-end"
              role="button"
              onClick={() =>
                setDisabledFields((prev) => ({
                  ...prev,
                  language: !prev.language,
                }))
              }
            >
              {disabledFields.language ? (
                <MdOutlineModeEdit className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-all" />
              ) : (
                <MdOutlineEditOff className="h-5 w-5 text-gray-600  group-hover:text-gray-800 transition-all" />
              )}
            </div>
          </div>
        </div>
        <div className="pl-6 pr-4">
          <label
            className={cn(
              "text-lg font-medium transition-all",
              disabledFields.tags ? "text-gray-500" : "text-gray-600"
            )}
          >
            Tags
          </label>
          <div className="flex items-center gap-1">
            <MultiSelect
              options={availableTags}
              value={formData?.tags || []}
              defaultValue={formData?.tags}
              onValueChange={(value) => handleChange("tags", value)}
              variant={disabledFields.tags ? "tagsDisable" : "tagsEnable"}
              className="w-[40%] text-gray-600 border-gray-400  disabled:text-black disabled:placeholder:text-gray-900"
              disabled={disabledFields.tags || updating}
              maxCount={5}
              placeholder="Add tags"
            />
            <div
              className="h-9 rounded-sm w-9 border border-gray-300 flex items-center justify-center cursor-pointer group hover:bg-gray-50 transition-all self-end"
              role="button"
              onClick={() =>
                setDisabledFields((prev) => ({
                  ...prev,
                  tags: !prev.tags,
                }))
              }
            >
              {disabledFields.tags ? (
                <MdOutlineModeEdit className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-all" />
              ) : (
                <MdOutlineEditOff className="h-5 w-5 text-gray-600  group-hover:text-gray-800 transition-all" />
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {hasChanged && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full absolute bottom-0 h-[40px] z-[100] bg-transparent border-t border-t-gray-400"
          >
            <div className="h-full w-full px-2 flex items-center justify-end gap-2 py-2">
              <Button
                variant={"secondary"}
                size={"sm"}
                className="px-4 text-[14px]"
                onClick={handleDiscardChanges}
                disabled={updating}
              >
                Discard
              </Button>
              <Button
                className="bg-cyan-700 text-white hover:bg-cyan-800 px-4 text-[14px]"
                size={"sm"}
                onClick={handleSaveChanges}
                disabled={updating}
              >
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

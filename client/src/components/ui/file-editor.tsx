import { useSocket } from "@/hooks/useSocket";
import React, { useEffect } from "react";
import {
  AiOutlineFileAdd,
  AiOutlineFolderAdd,
  AiOutlineEdit,
} from "react-icons/ai";
import { useParams } from "react-router-dom";
import { Directory } from "../external/utils/file-manager";

interface FileEditorProps {
  selectedFile: File | Directory | undefined;
  path: string | undefined;
  filePath?: string | undefined;
}

export const FileEditor = ({ selectedFile, path }: FileEditorProps) => {
  const { projectId } = useParams();
  const socket = useSocket(projectId!);
  console.log("Selected Directory in FileEditor:", path);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Delete" &&
        (selectedFile || !path || (!selectedFile && path))
      ) {
        deleteEntry();
      }
      if (
        event.key === "F2" &&
        (selectedFile || !path || (!selectedFile && path))
      ) {
        renameEntry();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFile, path]);

  const addNewFile = () => {
    const dir = path || "/";
    const name = prompt("Enter the name of the file:");
    if (!name) {
      alert("File name cannot be empty!");
      return;
    }

    const type = "file";
    const entryPath = socket?.emit("fetchPath", dir);
    console.log("Adding file at path:", entryPath);

    socket?.emit("addEntry", { dir, name, type }, (response: any) => {
      if (response.success) {
        alert(`File "${name}" added successfully in "${dir}"!`);
      } else {
        alert(`Error adding file: ${response.error}`);
      }
    });
  };

  const addNewDirectory = () => {
    const dir = path || "/";
    const name = prompt("Enter the name of the directory:");
    if (!name) {
      alert("Directory name cannot be empty!");
      return;
    }

    const type = "dir";
    const entryPath = `/workspace/${dir.replace(/^\/+/, "")}/${name}`;
    console.log("Adding directory at path:", entryPath);

    socket?.emit("addEntry", { dir, name, type }, (response: any) => {
      if (response.success) {
        alert(`Directory "${name}" added successfully in "${dir}"!`);
      } else {
        alert(`Error adding directory: ${response.error}`);
      }
    });
  };

  const deleteEntry = () => {
    if (!selectedFile && !path) {
      alert("No file or directory selected!");
      return;
    }

    let entryPath = "";
    console.log("Selected File in delete:", selectedFile);
    console.log("Selected Directory in delete: ", path);

    if (!selectedFile && path) {
      entryPath = `${path.replace(/^\/+/, "")}`;
    } else if (selectedFile) {
      entryPath = `${selectedFile.path.replace(/^\/+/, "")}`;
      console.log("Deleting file at path:", entryPath);
    }

    socket?.emit("deleteEntry", { path: entryPath }, (response: any) => {
      if (response.success) {
        alert(`Entry deleted successfully!`);
      } else {
        alert(`Error deleting entry: ${response.error}`);
      }
    });
  };

  const renameEntry = () => {
    if (!selectedFile && !path) {
      alert("No file or directory selected to rename!");
      return;
    }

    const oldPath = selectedFile ? selectedFile.path : path;
    if (!oldPath) {
      alert("Could not determine the path to rename.");
      return;
    }

    const newName = prompt("Enter the new name:");

    if (!newName) {
      alert("Name cannot be empty!");
      return;
    }

    const newPath = oldPath.replace(/[^/]+$/, newName);
    socket?.emit("renameEntry", { oldPath, newPath }, (response: any) => {
      if (response.success) {
        alert("Entry renamed successfully!");
      } else {
        alert(`Error renaming entry: ${response.error}`);
      }
    });
  };

  return (
    <div>
      <button onClick={addNewFile}>
        <AiOutlineFileAdd />
      </button>
      <button onClick={addNewDirectory}>
        <AiOutlineFolderAdd />
      </button>
      <button onClick={renameEntry}>
        <AiOutlineEdit />
      </button>{" "}
      {/* Add rename button */}
    </div>
  );
};

export default FileEditor;

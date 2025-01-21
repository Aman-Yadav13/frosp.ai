import { FaNodeJs, FaPython } from "react-icons/fa";

export const getLanguageIcon = (language: string) => {
  switch (language) {
    case "nodejs":
      return FaNodeJs;
    case "python":
      return FaPython;
  }
};

export const getLanguageStyles = (language: string) => {
  switch (language) {
    case "nodejs":
      return "text-green-500 bg-transparent h-5 w-5";
    case "python":
      return "text-yellow-500 bg-transparent h-5 w-5";
  }
};

import { useModal } from "@/hooks/useModal";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

interface AnimatedModalProps {
  className?: string;
  children: React.ReactNode;
  modalType: string;
}

export const AnimatedModal = ({
  className,
  modalType,
  children,
}: AnimatedModalProps) => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === modalType;

  const modalRef = useRef(null);
  useOutsideClick(modalRef, () => onClose(), modalType);

  return (
    <>
      {isModalOpen && (
        <motion.div
          key={modalType}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(10px)",
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          className="fixed [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full flex items-center justify-center z-[2000]"
        >
          <Overlay />
          <motion.div
            ref={modalRef}
            className={cn(
              "min-h-[50%] max-h-[90%] md:max-w-[40%] bg-gray-900 border border-transparent border-gray-800 md:rounded-2xl relative flex flex-col flex-1 overflow-hidden z-[2000]",
              className
            )}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
          >
            <CloseIcon />
            {children}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

const Overlay = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(10px)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
      }}
      className={`fixed inset-0 h-full w-full bg-black bg-opacity-50 z-[2000] ${className}`}
    ></motion.div>
  );
};

const CloseIcon = () => {
  const { onClose } = useModal();
  return (
    <button onClick={() => onClose()} className="absolute top-4 right-4 group">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black dark:text-white h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  );
};

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LoginModal } from "../models/login-model";
import { RegisterModal } from "../models/register-modal";
import { ResetPasswordModal } from "../models/reset-password-modal";
import { ChangeAccountDetailsModal } from "../models/change-account-details";
import { CreateProject } from "../models/create-project";
import { InspectProjectModal } from "../models/inspect-project-modal";

const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <div key="modals">
          <LoginModal />
          <RegisterModal />
          <ResetPasswordModal />
          <ChangeAccountDetailsModal />
          <CreateProject />
          <InspectProjectModal />
        </div>
      </AnimatePresence>
    </>
  );
};
export default ModalProvider;

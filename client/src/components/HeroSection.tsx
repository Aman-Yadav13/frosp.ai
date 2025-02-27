import { Spotlight } from "./aceternity/spotlight-new";
import { LandingTabs } from "./aceternity/custom-tabs";
import { SignInCard } from "./SignInCard";
import { SignUpCard } from "./SignUpCard";
import { ResetPasswordCard } from "./ResetPasswordCard";
import { BackgroundLines } from "./aceternity/background-lines";
import { toast } from "sonner";
import { getCurrentUser } from "@/api/user";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const state = useUser((state) => state);
  const navigate = useNavigate();

  const tabs = [
    {
      title: "Sign in",
      value: "signin",
      content: <SignInCard />,
    },
    {
      title: "Sign up",
      value: "signup",
      content: <SignUpCard />,
    },
    {
      title: "Reset password",
      value: "reset",
      content: <ResetPasswordCard />,
    },
  ];

  const handleDashboardClick = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        state.setUserInfo({
          _id: user.data._id,
          email: user.data.email,
          fullName: user.data.fullName,
          username: user.data.username,
          updatedAt: user.data.updatedAt,
          createdAt: user.data.createdAt,
        });

        navigate("/dashboard");
      }

      sessionStorage.setItem("user", JSON.stringify(user.data));
    } catch (e) {
      console.error(e);
      toast.error("Please sign in to access the dashboard");
    }
  };

  return (
    <div className="h-auto w-full rounded-md bg-black/[0.9] antialiased bg-grid-white/[0.04] relative shadow-black shadow-xl">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>
      <div className="w-full h-[12%] absolute bg-transparent z-[100]">
        <div className="flex w-full items-center justify-between h-full px-12">
          <div className="object-cover">
            <img src="/frospLogo.png" className="h-16 w-auto" />
          </div>
          <button
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 cursor-pointer"
            onClick={handleDashboardClick}
          >
            Dashboard
          </button>
        </div>
      </div>
      <div className="h-[100vh] md:items-center md:justify-center w-full flex flex-col">
        <Spotlight />
        <BackgroundLines className="flex items-center -mt-8">
          <div className="p-4 max-w-7xl mx-auto relative z-10  w-full pt-20 md:pt-0">
            <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-slate-300 to-slate-500 bg-opacity-50">
              Zenthrall
            </h1>
            <p className="mt-4 font-normal text-lg text-neutral-300 max-w-lg text-center mx-auto">
              Experience the next-gen cloud IDE that brings instant coding,
              seamless collaboration, and AI-assisted development—all in one
              place.
            </p>
          </div>
        </BackgroundLines>
      </div>
      <div className="-mt-60 h-[480px] w-full flex items-center justify-center">
        <div className="h-full w-full">
          <LandingTabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

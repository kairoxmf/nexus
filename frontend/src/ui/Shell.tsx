import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NexusControlProvider, useNexusControl } from "../context/NexusControlContext";
import { useI18n } from "../i18n";
import { HandGestureController } from "../components/robot/HandGestureController";
import { NexusOnboardingModal } from "../components/robot/NexusOnboardingModal";
import { NexusRobotAssistant } from "../components/robot/NexusRobotAssistant";
import { Nav } from "./Nav";
import { VoidBackground } from "./VoidBackground";
import { PageTitle } from "./PageTitle";

function ShellInner() {
  const { pathname } = useLocation();
  const { locale } = useI18n();
  const { showOnboarding } = useNexusControl();
  const isCommand = pathname === "/command";
  const hideBg = isCommand || pathname === "/";
  const lowBg = pathname === "/intel" || pathname === "/profile" || pathname === "/contact";
  const [show3d, setShow3d] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow3d(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={`nx-shell${isCommand ? " nx-shell-command" : ""}${showOnboarding ? " nx-shell-onboarding" : ""}`}>
      <PageTitle />
      {show3d && !hideBg && <VoidBackground intensity={lowBg ? 0.5 : 0.85} />}
      {!isCommand && <Nav />}
      <div className="nx-content">
        <Outlet key={`${pathname}-${locale}`} />
      </div>
      <NexusOnboardingModal />
      <HandGestureController />
      <NexusRobotAssistant />
    </div>
  );
}

export function Shell() {
  return (
    <NexusControlProvider>
      <ShellInner />
    </NexusControlProvider>
  );
}

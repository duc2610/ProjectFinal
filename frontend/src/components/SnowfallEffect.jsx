import React from "react";
import Snowfall from "react-snowfall";
import { useAuth } from "@shared/hooks/useAuth";
import { ROLES } from "@utils/acl";

export default function SnowfallEffect() {
  const { user } = useAuth();
  
  // Chỉ hiển thị hiệu ứng tuyết rơi nếu user là Examinee
  const isExaminee = user?.roles?.includes(ROLES.Examinee);
  
  if (!isExaminee) {
    return null;
  }

  return (
    <Snowfall
      snowflakeCount={100}
      speed={[0.5, 2]}
      wind={[-0.5, 0.5]}
      radius={[0.5, 3]}
      style={{
        position: "fixed",
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}


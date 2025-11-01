import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
export default function Splash() {
  const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Spin indicator={antIcon} tip="Đang tải..." size="large" />
      </div>
    </>
  );
}

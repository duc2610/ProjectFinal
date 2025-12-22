import React from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import RoutesRoot from "./app/routes";
export default function App() {
  return (
    <ConfigProvider locale={viVN}>
    <div className="app">
      <RoutesRoot />
    </div>
    </ConfigProvider>
  );
}

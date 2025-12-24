import React from "react";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import RoutesRoot from "./app/routes";
import SnowfallWrapper from "./components/SnowfallWrapper";
import ChristmasTree from "./components/ChristmasTree";

export default function App() {
  return (
    <ConfigProvider locale={viVN}>
      <div className="app">
        <RoutesRoot />
        <SnowfallWrapper />
        <ChristmasTree />
      </div>
    </ConfigProvider>
  );
}

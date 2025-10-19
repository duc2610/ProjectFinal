import { Spin } from "antd";

export default function Splash({ tip = "Loading..." }) {
  return <Spin fullscreen size="large" tip={tip} />;
}

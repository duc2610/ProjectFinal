import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

export default function Dashboard() {
  const statCard = (key) => (
    <Card
      key={key}
      style={{
        flex: 1,
        minHeight: 120,
        background: "#9acd32",
        border: 0,
        borderRadius: 12,
      }}
    />
  );

  const chartPlaceholder = (bg, minHeight = 260) => (
    <div
      style={{
        background: bg,
        borderRadius: 12,
        minHeight,
        width: "100%",
        border: "2px dashed rgba(0,0,0,0.08)",
      }}
    />
  );

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>
        Admin dashboard
      </Title>
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(statCard)}
      </div>
      <Title level={5} style={{ margin: "16px 0" }}>
        Analytic the overall performance
      </Title>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {chartPlaceholder("#bfbfbf", 280)}
        {chartPlaceholder("#bfbfbf", 280)}
      </div>
    </div>
  );
}

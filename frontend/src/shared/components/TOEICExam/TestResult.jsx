import React, { useState } from "react";
import { Card, Button, Typography, Tag } from "antd";
import {
  SoundOutlined,
  ReadOutlined,
  MessageOutlined,
  EditOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const ResultPage = () => {
  const [selectedSection, setSelectedSection] = useState("overall");

  const mockResult = {
    totalScore: 845,
    level: "Advanced (785–990)",
    date: "March 15, 2024",
    duration: "2h 45m",
    type: "Full TOEIC – Speaking & Writing",
    aiModel: "Advanced Neural Network",
    sections: [
      {
        key: "overall",
        icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        title: "Overall Score",
        score: 845,
        max: 990,
      },
      {
        key: "listening",
        icon: <SoundOutlined />,
        title: "Listening (495 points)",
        score: 495,
        max: 495,
      },
      {
        key: "reading",
        icon: <ReadOutlined />,
        title: "Reading (495 points)",
        score: 350,
        max: 495,
      },
      {
        key: "speaking",
        icon: <MessageOutlined />,
        title: "Speaking (200 points) – AI Scored",
        score: 160,
        max: 200,
      },
      {
        key: "writing",
        icon: <EditOutlined />,
        title: "Writing (200 points) – AI Scored",
        score: 170,
        max: 200,
      },
    ],
    writingTask: {
      task: "Task 1: Write a Sentence Based on a Picture",
      score: "4.5/5",
      feedback: "Excellent accuracy and relevance",
    },
  };

  const section = mockResult.sections.find((s) => s.key === selectedSection);

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "overall":
        return (
          <Card
            style={{ marginTop: 20, padding: 24, borderRadius: 8 }}
            bordered={false}
          >
            <Title level={1} style={{ color: "#fa8c16", marginBottom: 0 }}>
              {mockResult.totalScore}
            </Title>
            <Text strong>Total Score (Out of 990)</Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="green">Performance Level: {mockResult.level}</Tag>
            </div>
          </Card>
        );

      case "listening":
        return (
          <Card title="Listening Results" style={{ marginTop: 20 }}>
            <p>Your listening comprehension skills are excellent.</p>
            <p>You answered 89/100 questions correctly.</p>
          </Card>
        );

      case "reading":
        return (
          <Card title="Reading Results" style={{ marginTop: 20 }}>
            <p>Your reading accuracy is above average.</p>
            <p>You answered 70/100 questions correctly.</p>
          </Card>
        );

      case "speaking":
        return (
          <Card title="Speaking Section (AI Scored)" style={{ marginTop: 20 }}>
            <p>Score: 160/200</p>
            <Tag color="orange">AI Neural Network Evaluation</Tag>
            <p>Feedback: Good pronunciation and fluency.</p>
          </Card>
        );

      case "writing":
        return (
          <Card
            title="Writing Section Results (AI Evaluated)"
            style={{ marginTop: 20 }}
          >
            <Title level={1} style={{ color: "#fa8c16", marginBottom: 0 }}>
              {section.score}
            </Title>
            <Text strong>Writing Score</Text>
            <br />
            <Text type="secondary">
              Out of {section.max} points (Advanced Level)
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="orange">AI Neural Network Evaluation</Tag>
            </div>

            <Card
              type="inner"
              title={mockResult.writingTask.task}
              style={{
                background: "#fff7e6",
                border: "1px solid #ffa940",
                marginTop: 16,
              }}
            >
              <Text strong style={{ color: "#fa541c", fontSize: 16 }}>
                {mockResult.writingTask.score}
              </Text>
              <br />
              <Text>{mockResult.writingTask.feedback}</Text>
              <div style={{ marginTop: 8 }}>
                <a href="#" style={{ color: "#1677ff" }}>
                  View AI Analysis
                </a>
              </div>
            </Card>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#1f1f1f",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          display: "flex",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 280,
            background: "#f5f5f5",
            borderRight: "1px solid #ddd",
            padding: 20,
            overflowY: "auto",
          }}
        >
          <Title level={4} style={{ color: "#001529" }}>
            Test Sections
          </Title>
          {mockResult.sections.map((s) => (
            <Card
              key={s.key}
              size="small"
              onClick={() => setSelectedSection(s.key)}
              style={{
                marginBottom: 10,
                border:
                  selectedSection === s.key
                    ? "2px solid #1677ff"
                    : "1px solid #e8e8e8",
                background:
                  selectedSection === s.key
                    ? "#e6f4ff"
                    : "rgba(255,255,255,0.9)",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <Text strong>
                {s.icon} {s.title}
              </Text>
              <br />
              <Text type="secondary">
                {s.score}/{s.max} points
              </Text>
            </Card>
          ))}

          <div style={{ marginTop: 24 }}>
            <Title level={5}>Test Information</Title>
            <Text>Date: {mockResult.date}</Text>
            <br />
            <Text>Duration: {mockResult.duration}</Text>
            <br />
            <Text>Test Type: {mockResult.type}</Text>
            <br />
            <Text>AI Scoring: {mockResult.aiModel}</Text>
          </div>

          <div style={{ marginTop: 24 }}>
            <Title level={5}>Performance Level</Title>
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <Text style={{ marginLeft: 8 }}>{mockResult.level}</Text>
            <p style={{ color: "#555", marginTop: 4 }}>
              You can communicate effectively in most professional situations.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, background: "#f0f2f5", overflowY: "auto" }}>
          <div
            style={{
              background: "#003a8c",
              padding: "16px 24px",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title
              level={3}
              style={{ color: "#fff", margin: 0, fontWeight: "bold" }}
            >
              TOEIC Test Results
            </Title>
            <Button type="primary" ghost>
              Retake Test
            </Button>
          </div>

          <div style={{ padding: "40px 60px" }}>{renderSectionContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
import React, { useEffect, useState } from "react";
import { Card, Button, Typography, Tag } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SoundOutlined,
  ReadOutlined,
  MessageOutlined,
  EditOutlined,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import styles from "../../styles/Result.module.css";

const { Title, Text } = Typography;

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mockResult = state || {
    overall: 845,
    listening: 420,
    reading: 350,
    speaking: 160,
    writing: 170,
    detailTasks: [{ title: "Task 1: Write a Sentence Based on a Picture", score: 4.5, feedback: "Excellent accuracy and relevance" }],
    answers: {}
  };

  const [selectedSection, setSelectedSection] = useState("overall");
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const target = selectedSection === "overall" ? mockResult.overall : (mockResult[selectedSection] || 0);
    let curr = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const id = setInterval(() => {
      curr += step;
      if (curr >= target) { setDisplayScore(target); clearInterval(id); }
      else setDisplayScore(curr);
    }, 20);
    return () => clearInterval(id);
  }, [selectedSection, mockResult]);

  const sections = [
    { key: "overall", title: "Overall Score", score: mockResult.overall, max: 990, icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
    { key: "listening", title: "Listening (495 points)", score: mockResult.listening, max: 495, icon: <SoundOutlined /> },
    { key: "reading", title: "Reading (495 points)", score: mockResult.reading, max: 495, icon: <ReadOutlined /> },
    { key: "speaking", title: "Speaking (200) - AI Scored", score: mockResult.speaking, max: 200, icon: <MessageOutlined /> },
    { key: "writing", title: "Writing (200) - AI Scored", score: mockResult.writing, max: 200, icon: <EditOutlined /> },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 24 }}>
      <div style={{ width: "100%", background: "#fff", borderRadius: 8, overflow: "hidden", display: "flex" }}>
        <div style={{ width: 280, background: "#f5f5f5", padding: 20, borderRight: "1px solid #ddd" }}>
          <Title level={4} style={{ marginBottom: 12 }}>Test Sections</Title>
          {sections.map((s) => (
            <Card
              key={s.key}
              size="small"
              onClick={() => setSelectedSection(s.key)}
              style={{
                marginBottom: 10,
                border: selectedSection === s.key ? "2px solid #1677ff" : "1px solid #e8e8e8",
                background: selectedSection === s.key ? "#e6f4ff" : "#fff",
                cursor: "pointer",
              }}
            >
              <Text strong>{s.icon} {s.title}</Text>
              <br />
              <Text type="secondary">{s.score}/{s.max} points</Text>
            </Card>
          ))}

          <div style={{ marginTop: 18 }}>
            <Title level={5}>Test Information</Title>
            <Text>Date: {new Date().toLocaleDateString()}</Text><br/>
            <Text>Duration: 2h 45m</Text><br/>
            <Text>Type: Full TOEIC – Speaking & Writing</Text><br/>
            <Text>AI Scoring: Advanced Neural Network</Text>
          </div>

          <div style={{ marginTop: 18 }}>
            <Title level={5}>Performance Level</Title>
            <CheckCircleTwoTone twoToneColor="#52c41a" />
            <Text style={{ marginLeft: 8 }}>Advanced (785–990)</Text>
            <p style={{ color: "#555", marginTop: 6 }}>You can communicate effectively in most professional situations.</p>
          </div>
        </div>

        <div style={{ flex: 1, background: "#f0f2f5" }}>
          <div style={{ background: "#003a8c", padding: "16px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>TOEIC Test Results</Title>
            <Button onClick={() => { sessionStorage.removeItem("toeic_selectedParts"); sessionStorage.removeItem("toeic_duration"); navigate("/toeic-exam", { replace: true }); }} type="primary" ghost>Retake Test</Button>
          </div>

          <div style={{ padding: "40px 60px" }}>
            <Title level={4} style={{ color: "#003a8c" }}>{ selectedSection === "writing" ? "Writing Section Results (AI Evaluated)" : (selectedSection === "overall" ? "Overall Results" : `${sections.find(s => s.key === selectedSection).title}`) }</Title>

            <Card style={{ marginTop: 20, padding: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <Title level={1} style={{ color: "#fa8c16", marginBottom: 0 }}>{displayScore}</Title>
                <Text strong>{ selectedSection === "overall" ? "Overall Score" : (selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1) + " Score") }</Text>
                <br />
                <Text type="secondary">Out of { selectedSection === "overall" ? 990 : sections.find(s => s.key === selectedSection).max } points</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">AI Neural Network Evaluation</Tag>
                </div>
              </div>

              {selectedSection === "writing" && mockResult.detailTasks.map((t, i) => (
                <Card key={i} type="inner" title={t.title} style={{ background: "#fff7e6", border: "1px solid #ffa940", marginTop: 16 }}>
                  <Text strong style={{ color: "#fa541c", fontSize: 16 }}>{t.score}</Text><br/>
                  <Text>{t.feedback}</Text>
                  <div style={{ marginTop: 8 }}><a href="#">View AI Analysis</a></div>

                  {/* Show user's writing submissions if any */}
                  <div style={{ marginTop: 12 }}>
                    <Title level={5}>Your submissions</Title>
                    {mockResult.detailTasks[0].userWriting && Object.keys(mockResult.detailTasks[0].userWriting).length ? (
                      Object.entries(mockResult.detailTasks[0].userWriting).map(([qid, text]) => (
                        <Card key={qid} size="small" style={{ marginTop: 8 }}>
                          <Text type="secondary">Question {qid}</Text>
                          <div style={{ marginTop: 6 }}>{text}</div>
                        </Card>
                      ))
                    ) : (
                      <Text type="secondary">No writing submissions found.</Text>
                    )}
                  </div>
                </Card>
              ))}

              {selectedSection === "overall" && (
                <div style={{ marginTop: 12 }}>
                  <p>Listening: {mockResult.listening} / 495</p>
                  <p>Reading: {mockResult.reading} / 495</p>
                  <p>Speaking: {mockResult.speaking} / 200</p>
                  <p>Writing: {mockResult.writing} / 200</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

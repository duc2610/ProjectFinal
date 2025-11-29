import React from "react";
import { Card, Typography } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import styles from "@shared/styles/Result.module.css";

const { Title, Text } = Typography;

export function ResultSidebar({
  sections,
  selectedSection,
  onSelectSection,
  isPracticeMode,
  result,
  testMeta,
  displayedTimeSpent,
  displayedIsSelectTime,
  displayedDuration,
  displayedTotalScore,
  normalizeTestType,
}) {
  const examDate = (
    result?.createdAt ? new Date(result.createdAt) : new Date()
  ).toLocaleDateString("vi-VN");

  const performanceLabel =
    displayedTotalScore >= 785
      ? "Nâng cao"
      : displayedTotalScore >= 600
      ? "Trung bình"
      : "Cơ bản";

  const testTypeLabel = normalizeTestType(
    result?.testType || testMeta?.testType || "Simulator"
  );

  return (
    <>
      <Title level={4}>Các phần thi</Title>
      {sections.map((section) => (
        <Card
          key={section.key}
          size="small"
          onClick={() => onSelectSection(section.key)}
          className={`${styles.sidebarCard} ${
            selectedSection === section.key ? styles.activeCard : ""
          }`}
          style={{ marginBottom: 10, cursor: "pointer" }}
        >
          <div>
            <Text strong>
              {section.icon} {section.title}
            </Text>
            <br />
            <Text type="secondary">
              {isPracticeMode
                ? section.description
                : `${section.score}/${section.max} điểm`}
            </Text>
          </div>
        </Card>
      ))}

      <div className={styles.infoBox}>
        <Title level={5}>Thông tin bài thi</Title>
        <Text>Ngày: {examDate}</Text>
        <br />
        <Text>Thời gian làm bài: {displayedTimeSpent} phút</Text>
        <br />
        {displayedIsSelectTime && (
          <>
            <Text>Thời lượng đề: {displayedDuration} phút</Text>
            <br />
          </>
        )}
        <Text>Loại: {testTypeLabel}</Text>
      </div>

      <div className={styles.performanceBox}>
        <Title level={5}>Mức độ</Title>
        <CheckCircleTwoTone twoToneColor="#52c41a" />
        <Text style={{ marginLeft: 8 }}>{performanceLabel}</Text>
      </div>
    </>
  );
}


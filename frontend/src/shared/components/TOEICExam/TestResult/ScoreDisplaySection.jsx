import React from "react";
import { Card, Tag, Typography, Progress } from "antd";
import styles from "@shared/styles/Result.module.css";

const { Title, Text } = Typography;

const getPerformanceLabel = (score) => {
  if (score >= 785) return "Nâng cao";
  if (score >= 600) return "Trung bình";
  return "Cơ bản";
};

const SECTION_LABELS = {
  overall: "Tổng quan",
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
};

export function ScoreDisplaySection({
  selectedSection,
  isPracticeLrMode,
  displayScore,
  practiceLrStats,
  availableScoreConfigs,
  totalScore,
  maxScore,
  selectedScoreConfig,
  skillGroup,
  displayedTimeSpent,
  displayedIsSelectTime,
  displayedDuration,
  totalQuestions,
  writingScore,
  speakingScore,
  totalScoreFromApi,
  normalizedTestType,
  swSummary,
}) {
  const renderPracticeSummary = () => {
    const partStat =
      selectedSection === "listening"
        ? practiceLrStats.listening
        : selectedSection === "reading"
        ? practiceLrStats.reading
        : null;

    const tiles = [
      { label: "Tổng số câu trong đề", value: practiceLrStats.totalQuestions },
      { label: "Câu đã làm", value: practiceLrStats.totalAnswered, color: "#1d39c4" },
      { label: "Câu chưa làm", value: practiceLrStats.unanswered, color: "#fa8c16" },
      {
        label: "Độ chính xác (trên toàn đề)",
        value: `${practiceLrStats.accuracy}%`,
        color: "#389e0d",
      },
    ];

    return (
      <div
        style={{
          width: "100%",
          padding: 32,
          borderRadius: 20,
          border: "1px dashed #91caff",
          background: "linear-gradient(135deg, #e6f7ff, #f0f9ff)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>ℹ️</div>
        <Title level={3} style={{ marginBottom: 8, color: "#0958d9" }}>
          Chế độ Practice (Listening & Reading)
        </Title>
        <Text style={{ fontSize: 16, color: "#1f3b76" }}>
          Chế độ luyện tập không chấm điểm tự động. Hệ thống chỉ hiển thị danh sách câu hỏi bạn
          đã làm cùng trạng thái đúng/sai để tự đánh giá.
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 24,
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              style={{
                minWidth: 160,
                padding: "16px 20px",
                borderRadius: 12,
                background: "#fff",
                border: "1px solid rgba(145,202,255,0.7)",
                boxShadow: "0 6px 16px rgba(9,88,217,0.08)",
              }}
            >
              <Text type="secondary">{tile.label}</Text>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 700,
                  color: tile.color || "#0c1d4f",
                }}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>

        {partStat && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: "#fff",
              display: "flex",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap",
              border: "1px solid #e0e7ff",
            }}
          >
            <div>
              <Text type="secondary">
                Tổng câu ({selectedSection === "listening" ? "Nghe" : "Đọc"})
              </Text>
              <Title level={4} style={{ margin: 0, color: "#003a8c" }}>
                {partStat.total}
              </Title>
            </div>
            <div>
              <Text type="secondary">Đã làm</Text>
              <Title level={4} style={{ margin: 0, color: "#1d39c4" }}>
                {partStat.answered}
              </Title>
            </div>
            <div>
              <Text type="secondary">Chưa làm</Text>
              <Title level={4} style={{ margin: 0, color: "#fa8c16" }}>
                {partStat.unanswered}
              </Title>
            </div>
            <div>
              <Text type="secondary">Đúng</Text>
              <Title level={4} style={{ margin: 0, color: "#389e0d" }}>
                {partStat.correct}
              </Title>
            </div>
            <div>
              <Text type="secondary">Sai</Text>
              <Title level={4} style={{ margin: 0, color: "#cf1322" }}>
                {partStat.wrong}
              </Title>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailTiles = () => {
    const buildOverallTiles = () => {
      const tiles = [
        {
          label: "Thời gian làm bài",
          value: `${displayedTimeSpent} phút`,
          color: "#1d39c4",
        },
        {
          label: "Thời lượng đề",
          value: displayedIsSelectTime ? `${displayedDuration} phút` : "Không giới hạn",
          color: "#531dab",
        },
      ];

      if (totalQuestions > 0) {
        tiles.push({
          label: "Tổng số câu trong đề",
          value: totalQuestions,
          color: "#0958d9",
        });
      }
      if (skillGroup === "lr" && practiceLrStats.totalQuestions > 0) {
        tiles.push(
          {
            label: "Câu đã làm",
            value: practiceLrStats.totalAnswered,
            color: "#1d39c4",
          },
          {
            label: "Câu chưa làm",
            value: practiceLrStats.unanswered,
            color: "#fa8c16",
          },
          {
            label: "Đúng",
            value: practiceLrStats.correct,
            color: "#389e0d",
          },
          {
            label: "Sai",
            value: practiceLrStats.wrong,
            color: "#cf1322",
          },
          {
            label: "Độ chính xác (toàn đề)",
            value: `${practiceLrStats.accuracy}%`,
            color: "#08979c",
          }
        );
      }
      if (totalScoreFromApi != null && normalizedTestType !== "Practice") {
        tiles.push({
          label: "Tổng điểm",
          value: totalScoreFromApi,
          color: "#722ed1",
        });
      }
      if (writingScore != null && (skillGroup === "sw" || skillGroup === "writing")) {
        tiles.push({
          label: "Điểm Writing",
          value: writingScore,
          color: "#fa541c",
        });
      }
      if (speakingScore != null && (skillGroup === "sw" || skillGroup === "speaking")) {
        tiles.push({
          label: "Điểm Speaking",
          value: speakingScore,
          color: "#fa8c16",
        });
      }
      return tiles;
    };

    const buildLrTiles = (partKey) => {
      const partStat =
        partKey === "listening" ? practiceLrStats.listening : practiceLrStats.reading;
      if (!partStat || partStat.total === 0) return null;
      const accuracy =
        partStat.total > 0 ? Math.round((partStat.correct / partStat.total) * 100) : 0;
      return [
        {
          label: `Tổng câu (${SECTION_LABELS[partKey]})`,
          value: partStat.total,
          color: "#0958d9",
        },
        {
          label: "Câu đã làm",
          value: partStat.answered,
          color: "#1d39c4",
        },
        {
          label: "Câu chưa làm",
          value: partStat.unanswered,
          color: "#fa8c16",
        },
        {
          label: "Đúng",
          value: partStat.correct,
          color: "#389e0d",
        },
        {
          label: "Sai",
          value: partStat.wrong,
          color: "#cf1322",
        },
        {
          label: "Độ chính xác (phần này)",
          value: `${accuracy}%`,
          color: "#08979c",
        },
      ];
    };

    const buildSwTiles = (key) => {
      const summary = swSummary?.[key];
      if (!summary) return null;
      const tiles = [
        {
          label: `Số bài ${SECTION_LABELS[key]}`,
          value: summary.total,
          color: "#0958d9",
        },
      ];

      if (summary.scoredCount) {
        tiles.push({
          label: "Số bài được chấm",
          value: summary.scoredCount,
          color: "#1d39c4",
        });
      }
      if (summary.avgScore != null) {
        tiles.push({
          label: "Điểm trung bình (AI)",
          value: summary.avgScore,
          color: "#722ed1",
        });
      }
      if (summary.maxScore != null) {
        tiles.push({
          label: "Điểm cao nhất",
          value: summary.maxScore,
          color: "#52c41a",
        });
      }
      if (summary.minScore != null) {
        tiles.push({
          label: "Điểm thấp nhất",
          value: summary.minScore,
          color: "#fa541c",
        });
      }
      return tiles;
    };

    let tiles = [];
    switch (selectedSection) {
      case "listening":
      case "reading":
        tiles = buildLrTiles(selectedSection) || [];
        break;
      case "writing":
      case "speaking":
        tiles = buildSwTiles(selectedSection) || [];
        break;
      case "overall":
      default:
        tiles = buildOverallTiles();
        break;
    }

    if (!tiles.length) {
      return null;
    }

    return (
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px dashed #e6f4ff",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          <Title level={5} style={{ marginBottom: 12, textAlign: "center" }}>
            {`Thông tin chi tiết${
              selectedSection !== "overall"
                ? ` (${SECTION_LABELS[selectedSection] || selectedSection})`
                : ""
            }`}
          </Title>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {tiles.map((tile) => (
              <div
                key={tile.label}
                style={{
                  flex: "1 1 180px",
                  minWidth: 160,
                  padding: "14px 18px",
                  borderRadius: 12,
                  background: "#ffffff",
                  border: "1px solid #e6f4ff",
                  boxShadow: "0 3px 10px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {tile.label}
                </Text>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: 700,
                    color: tile.color || "#111827",
                  }}
                >
                  {tile.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOverallScore = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        width: "100%",
      }}
    >
      <div
        style={{
          flex: "1 1 280px",
          minWidth: 260,
          background: "linear-gradient(135deg, #1d39c4, #2f54eb)",
          borderRadius: 16,
          padding: 24,
          color: "#fff",
          boxShadow: "0 15px 35px rgba(47, 84, 235, 0.25)",
        }}
      >
        <Text strong style={{ color: "rgba(255,255,255,0.85)" }}>
          Kết quả tổng quan
        </Text>
        <Title level={1} style={{ color: "#fff", margin: "12px 0 0" }}>
          {displayScore}
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
          Trên tổng {maxScore} điểm
        </Text>
        <div style={{ marginTop: 16 }}>
          <Tag
            color={
              totalScore >= 785 ? "green" : totalScore >= 600 ? "orange" : "default"
            }
            style={{ padding: "4px 12px", borderRadius: 999 }}
          >
            {getPerformanceLabel(totalScore)}
          </Tag>
        </div>
        <div style={{ marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
          Ngày thi: {new Date().toLocaleDateString("vi-VN")}
          <br />
          {displayedIsSelectTime && (
            <>
              Thời lượng: {displayedDuration} phút
              <br />
            </>
          )}
        </div>
      </div>

      <div
        style={{
          flex: "1 1 260px",
          minWidth: 260,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {availableScoreConfigs.length === 0 ? (
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              border: "1px dashed #d9d9d9",
              background: "#fafafa",
              textAlign: "center",
            }}
          >
            <Text type="secondary">Không có dữ liệu điểm chi tiết</Text>
          </div>
        ) : (
          availableScoreConfigs.map((item) => {
            const percent = Math.min(
              100,
              Math.round(((Number(item.score) || 0) / item.max) * 100)
            );
            return (
              <div
                key={item.key}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #f0f0f0",
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>{item.label}</Text>
                  <Text style={{ color: item.color, fontWeight: 600 }}>
                    {item.score}/{item.max}
                  </Text>
                </div>
                <Progress
                  percent={percent}
                  strokeColor={item.color}
                  showInfo={false}
                  size="small"
                  trailColor="#f5f5f5"
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (isPracticeLrMode) {
    return (
      <div className={styles.scoreDisplay}>
        {renderPracticeSummary()}
        {renderDetailTiles()}
      </div>
    );
  }

  if (selectedSection === "overall") {
    return (
      <div className={styles.scoreDisplay}>
        {renderOverallScore()}
        {renderDetailTiles()}
      </div>
    );
  }

  return (
    <div className={styles.scoreDisplay}>
      <Title level={1} style={{ color: "#fa8c16", margin: 0 }}>
        {displayScore}
      </Title>
      <Text strong>{selectedScoreConfig?.label || "Điểm phần thi"}</Text>
      <br />
      <Text type="secondary">Trên tổng {selectedScoreConfig?.max || 0} điểm</Text>
      {renderDetailTiles()}
    </div>
  );
}


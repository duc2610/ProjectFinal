import React, { useState, useEffect } from "react";
import { Button, Card, Space, Row, Col, message, Empty } from "antd";
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EditOutlined,
  SoundOutlined,
  DeleteOutlined,
  BookOutlined,
  RotateLeftOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "./FlashcardDetail.css";

export default function FlashcardDetail() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studyMode, setStudyMode] = useState("flashcard"); // flashcard, learn

  useEffect(() => {
    fetchFlashcardDetail();
  }, [setId]);

  const fetchFlashcardDetail = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
      const mockSet = {
        setId: parseInt(setId),
        title: "Present Perfect structure",
        formula: "Subject + have/has + past participle",
        description: "Learn the structure and usage of Present Perfect tense",
      };

      const mockCards = [
        {
          cardId: 1,
          frontText: "accomplish",
          backText: "hoàn thành, đạt được",
        },
        {
          cardId: 2,
          frontText: "achieve",
          backText: "đạt được, thực hiện",
        },
        {
          cardId: 3,
          frontText: "complete",
          backText: "hoàn thành, kết thúc",
        },
        {
          cardId: 4,
          frontText: "finish",
          backText: "kết thúc, hoàn tất",
        },
        {
          cardId: 5,
          frontText: "succeed",
          backText: "thành công, đạt được",
        },
      ];

      setFlashcardSet(mockSet);
      setFlashcards(mockCards);
    } catch (error) {
      console.error("Error fetching flashcard detail:", error);
      message.error("Không thể tải chi tiết flashcard");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleCardSelect = (index) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const handleDeleteCard = (cardId, e) => {
    e.stopPropagation();
    message.info("Tính năng đang phát triển");
  };

  const handlePlayAudio = (e) => {
    e.stopPropagation();
    message.info("Tính năng đang phát triển");
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="quizlet-container">
      {/* Header */}
      <div className="quizlet-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/flashcard")}
          className="quizlet-back-button"
        >
          Quay lại
        </Button>
        {flashcardSet && (
          <div className="quizlet-title-section">
            <h1 className="quizlet-title">{flashcardSet.title}</h1>
            {flashcardSet.formula && (
              <p className="quizlet-subtitle">{flashcardSet.formula}</p>
            )}
          </div>
        )}
      </div>


      {/* Study Mode Buttons */}
      <div className="quizlet-mode-buttons">
        <Button
          className={`quizlet-mode-btn ${studyMode === "flashcard" ? "active" : ""}`}
          onClick={() => {
            setStudyMode("flashcard");
            setIsFlipped(false);
          }}
        >
          <BookOutlined /> Flashcard
        </Button>
        <Button
          className={`quizlet-mode-btn ${studyMode === "learn" ? "active" : ""}`}
          onClick={() => {
            navigate(`/flashcard/${setId}/learn`);
          }}
        >
          <CheckOutlined /> Học
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="quizlet-action-buttons">
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => message.info("Tính năng đang phát triển")}
          className="quizlet-action-btn"
        >
          Thêm thẻ
        </Button>
        <Button
          type="default"
          icon={<EditOutlined />}
          onClick={() => message.info("Tính năng đang phát triển")}
          className="quizlet-action-btn"
        >
          Chỉnh sửa
        </Button>
      </div>

      {/* Main Card Display - Quizlet Style */}
      {studyMode === "flashcard" && (
        <div className="quizlet-card-container">
          <div className="quizlet-card-wrapper">
            <Button
              type="text"
              icon={<LeftOutlined />}
              onClick={handlePreviousCard}
              disabled={currentCardIndex === 0}
              className="quizlet-nav-button quizlet-nav-left"
            />
            
            <div
              className={`quizlet-main-card ${isFlipped ? "flipped" : ""}`}
              onClick={handleCardClick}
            >
              <div className="quizlet-card-inner">
                <div className={`quizlet-card-face quizlet-card-front ${isFlipped ? "hidden" : ""}`}>
                  <div className="quizlet-card-content">
                    <div className="quizlet-card-word">{currentCard?.frontText}</div>
                    <div className="quizlet-card-hint">
                      <RotateLeftOutlined /> Nhấn để xem nghĩa
                    </div>
                  </div>
                </div>
                <div className={`quizlet-card-face quizlet-card-back ${!isFlipped ? "hidden" : ""}`}>
                  <div className="quizlet-card-content">
                    <div className="quizlet-card-word">{currentCard?.backText}</div>
                    <div className="quizlet-card-hint">
                      <RotateLeftOutlined /> Nhấn để xem từ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="text"
              icon={<RightOutlined />}
              onClick={handleNextCard}
              disabled={currentCardIndex === flashcards.length - 1}
              className="quizlet-nav-button quizlet-nav-right"
            />
          </div>
          
          <div className="quizlet-card-actions">
            <Button
              type="default"
              icon={<SoundOutlined />}
              onClick={() => message.info("Tính năng đang phát triển")}
              className="quizlet-card-action-btn"
            >
              Phát âm
            </Button>
          </div>
        </div>
      )}


      {/* Vocabulary List - Quizlet Style */}
      <div className="quizlet-vocab-section">
        <h3 className="quizlet-vocab-title">Tất cả các thuật ngữ ({flashcards.length})</h3>
        {flashcards.length === 0 ? (
          <Empty description="Chưa có từ vựng nào" />
        ) : (
          <div className="quizlet-vocab-list">
            {flashcards.map((card, index) => (
              <div
                key={card.cardId}
                className={`quizlet-vocab-item ${index === currentCardIndex ? "active" : ""}`}
                onClick={() => handleCardSelect(index)}
              >
                <div className="quizlet-vocab-number">{index + 1}</div>
                <div className="quizlet-vocab-content">
                  <div className="quizlet-vocab-term">{card.frontText}</div>
                  <div className="quizlet-vocab-definition">{card.backText}</div>
                </div>
                <div className="quizlet-vocab-actions">
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    onClick={handlePlayAudio}
                    className="quizlet-vocab-action-icon"
                  />
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDeleteCard(card.cardId, e)}
                    danger
                    className="quizlet-vocab-action-icon"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


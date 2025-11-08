import React, { useState, useEffect } from "react";
import { Button, Progress, message } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import "@shared/styles/FlashcardDetail.css";

export default function FlashcardLearn() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [learnedCards, setLearnedCards] = useState(new Set());
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isSwipeComplete, setIsSwipeComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchFlashcardDetail();
  }, [setId]);

  const fetchFlashcardDetail = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // Mock data for now
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

      setFlashcards(mockCards);
    } catch (error) {
      console.error("Error fetching flashcard detail:", error);
      message.error("Không thể tải chi tiết flashcard");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (!isDragging && !isSwipeComplete) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMarkLearned = () => {
    const newLearned = new Set(learnedCards);
    newLearned.add(flashcards[currentCardIndex].cardId);
    setLearnedCards(newLearned);
    setIsSwipeComplete(true);
    
    // Animate card out and move to next
    setTimeout(() => {
      setIsSwipeComplete(false);
      setSwipeOffset(0);
      
      // Move to next card
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // All cards completed
        setIsCompleted(true);
        message.success("Bạn đã hoàn thành tất cả các thẻ!");
      }
    }, 300);
  };

  const handleMarkNotLearned = () => {
    const newLearned = new Set(learnedCards);
    newLearned.delete(flashcards[currentCardIndex].cardId);
    setLearnedCards(newLearned);
    setIsSwipeComplete(true);
    
    // Animate card out and move to next
    setTimeout(() => {
      setIsSwipeComplete(false);
      setSwipeOffset(0);
      
      // Move to next card
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // All cards completed
        setIsCompleted(true);
        message.info("Bạn đã xem hết các thẻ!");
      }
    }, 300);
  };

  // Swipe handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const currentX = e.clientX || (e.touches && e.touches[0]?.clientX);
      if (currentX !== undefined) {
        const diff = currentX - startX;
        setSwipeOffset(diff);
      }
    };

    const handleUp = () => {
      const threshold = 150; // Minimum swipe distance
      
      if (swipeOffset > threshold) {
        // Swipe right - Mark as learned
        handleMarkLearned();
      } else if (swipeOffset < -threshold) {
        // Swipe left - Mark as not learned
        handleMarkNotLearned();
      } else {
        // Reset position
        setSwipeOffset(0);
      }
      
      setIsDragging(false);
      setSwipeOffset(0);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, startX, swipeOffset, currentCardIndex, flashcards, learnedCards]);

  const handleMouseDown = (e) => {
    if (isCompleted) return;
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX || (e.touches && e.touches[0]?.clientX) || 0);
  };

  const handleLearnAgain = () => {
    setCurrentCardIndex(0);
    setLearnedCards(new Set());
    setIsFlipped(false);
    setIsCompleted(false);
    setSwipeOffset(0);
    setIsSwipeComplete(false);
  };

  const currentCard = flashcards[currentCardIndex];
  const progress = flashcards.length > 0 
    ? (learnedCards.size / flashcards.length) * 100 
    : 0;
  const isCurrentCardLearned = currentCard && learnedCards.has(currentCard.cardId);

  return (
    <div className="quizlet-learn-page">
      <div className="quizlet-learn-container">
        <div className="quizlet-learn-stats">
          <div className="quizlet-stat-item">
            <div className="quizlet-stat-label">Đã học</div>
            <div className="quizlet-stat-value learned">{learnedCards.size}</div>
          </div>
          <div className="quizlet-stat-item">
            <div className="quizlet-stat-label">Chưa học</div>
            <div className="quizlet-stat-value not-learned">
              {flashcards.length - learnedCards.size}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="quizlet-progress-container">
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor={isCompleted ? "#52c41a" : {
              '0%': '#667eea',
              '100%': '#764ba2',
            }}
            className="quizlet-progress"
          />
          <div className="quizlet-progress-text">
            {isCompleted ? (
              <span style={{ color: "#52c41a", fontWeight: 600 }}>
                Hoàn thành! Đã học: {learnedCards.size} / {flashcards.length}
              </span>
            ) : (
              `Đã học: ${learnedCards.size} / ${flashcards.length}`
            )}
          </div>
        </div>

        {!isCompleted ? (
          <>
            <div className="quizlet-learn-card-wrapper">
              <div
                className={`quizlet-learn-card ${isFlipped ? "flipped" : ""} ${isCurrentCardLearned ? "learned" : ""} ${isSwipeComplete ? "swipe-complete" : ""}`}
                style={{
                  transform: `translateX(${swipeOffset}px) rotateZ(${swipeOffset * 0.1}deg)`,
                  opacity: isSwipeComplete ? 0 : 1,
                  transition: isDragging ? "none" : "all 0.3s ease",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onClick={handleCardClick}
              >
                <div className="quizlet-learn-card-inner">
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
                
                {/* Swipe indicators */}
                {swipeOffset > 50 && (
                  <div className="quizlet-swipe-indicator right">
                    <CheckOutlined /> Đã học
                  </div>
                )}
                {swipeOffset < -50 && (
                  <div className="quizlet-swipe-indicator left">
                    <CloseOutlined /> Chưa học
                  </div>
                )}
              </div>
            </div>

            <div className="quizlet-learn-instructions">
              <div className="quizlet-instruction-item">
                <div className="quizlet-instruction-icon left">
                  <LeftOutlined />
                </div>
                <span>Kéo trái = Chưa học</span>
              </div>
              <div className="quizlet-instruction-item">
                <div className="quizlet-instruction-icon right">
                  <RightOutlined />
                </div>
                <span>Kéo phải = Đã học</span>
              </div>
            </div>
          </>
        ) : (
          <div className="quizlet-completion-screen">
            <div className="quizlet-completion-icon">
              <CheckOutlined />
            </div>
            <h2 className="quizlet-completion-title">Hoàn thành!</h2>
            <p className="quizlet-completion-text">
              Bạn đã học {learnedCards.size} / {flashcards.length} thẻ
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isCompleted && (
          <div className="quizlet-completion-actions">
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(`/flashcard/${setId}`)}
              className="quizlet-completion-btn"
              size="large"
            >
              Quay trở lại
            </Button>
            <Button
              type="primary"
              icon={<RedoOutlined />}
              onClick={handleLearnAgain}
              className="quizlet-completion-btn quizlet-learn-again-btn"
              size="large"
            >
              Học lại
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


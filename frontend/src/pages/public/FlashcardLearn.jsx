import React, { useState, useEffect } from "react";
import { Button, Progress, message, Spin, Empty } from "antd";
import {
  RotateLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getFlashcardsBySetId, markCardKnowledge, startStudySession, getStudyStats } from "@services/flashcardService";
import "@shared/styles/FlashcardDetail.css";

export default function FlashcardLearn() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [allFlashcards, setAllFlashcards] = useState([]); // Tất cả flashcard
  const [flashcards, setFlashcards] = useState([]); // Chỉ các flashcard chưa học (để hiển thị)
  const [loading, setLoading] = useState(false);
  const [learnedCards, setLearnedCards] = useState(new Set());
  const [isCardAnimating, setIsCardAnimating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studyStats, setStudyStats] = useState(null);

  useEffect(() => {
    fetchStudySession();
  }, [setId]);

  const fetchStudySession = async () => {
    try {
      setLoading(true);
      // Sử dụng startStudySession để lấy thông tin học tập với trạng thái
      const sessionData = await startStudySession(setId);
      if (sessionData && sessionData.cards) {
        const allCards = Array.isArray(sessionData.cards) ? sessionData.cards : [];
        setAllFlashcards(allCards);
        
        // Chỉ hiển thị các flashcard chưa học (status !== "learned")
        const unlearnedCards = allCards.filter(card => card.status !== "learned");
        setFlashcards(unlearnedCards);
        
        // Khởi tạo learnedCards dựa trên status từ backend
        const initialLearned = new Set();
        allCards.forEach(card => {
          if (card.status === "learned") {
            initialLearned.add(card.cardId);
          }
        });
        setLearnedCards(initialLearned);
        
        // Nếu tất cả đều đã học, đánh dấu hoàn thành
        if (unlearnedCards.length === 0 && allCards.length > 0) {
          setIsCompleted(true);
        }
      } else {
        setAllFlashcards([]);
        setFlashcards([]);
      }
      
      // Lấy thống kê học tập
      try {
        const stats = await getStudyStats(setId);
        setStudyStats(stats);
      } catch (statsError) {
        console.error("Error fetching study stats:", statsError);
        // Không hiển thị lỗi nếu không lấy được stats
      }
    } catch (error) {
      console.error("Error fetching study session:", error);
      const errorMsg = error?.response?.data?.message || "Không thể tải phiên học tập";
      message.error(errorMsg);
      // Fallback: thử lấy danh sách flashcard thông thường
      try {
        const cardsData = await getFlashcardsBySetId(setId);
        const allCards = Array.isArray(cardsData) ? cardsData : [];
        setAllFlashcards(allCards);
        // Với fallback, tất cả đều là "new" (chưa học)
        setFlashcards(allCards);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (!isCardAnimating) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMarkLearned = async () => {
    const card = flashcards[currentCardIndex];
    if (!card) {
      console.log("No card found at index:", currentCardIndex);
      return;
    }

    console.log("Marking card as learned:", card.cardId, card.term);

    try {
      // Mark as known in backend
      const result = await markCardKnowledge({
        cardId: card.cardId,
        isKnown: true,
      });
      console.log("Backend response:", result);
      
      // Cập nhật status của card trong allFlashcards
      const updatedAllCards = [...allFlashcards];
      const allCardIndex = updatedAllCards.findIndex(c => c.cardId === card.cardId);
      if (allCardIndex !== -1) {
        const currentStatus = updatedAllCards[allCardIndex].status;
        const currentCorrectCount = (updatedAllCards[allCardIndex].correctCount || 0) + 1;
        const currentIncorrectCount = updatedAllCards[allCardIndex].incorrectCount || 0;
        
        // Khi người dùng bấm "Đã học", đánh dấu là "learned" ngay lập tức
        // Điều này cho phép người dùng tự quyết định khi nào họ đã học xong
        const newStatus = "learned";
        
        console.log("Card status update:", {
          cardId: card.cardId,
          currentCorrectCount,
          currentIncorrectCount,
          newStatus: "learned (user marked as learned)"
        });
        
        updatedAllCards[allCardIndex] = {
          ...updatedAllCards[allCardIndex],
          status: newStatus,
          correctCount: currentCorrectCount,
          reviewCount: (updatedAllCards[allCardIndex].reviewCount || 0) + 1,
        };
        setAllFlashcards(updatedAllCards);
        
        // Xóa card khỏi danh sách flashcards vì đã học xong
        const updatedCards = flashcards.filter(c => c.cardId !== card.cardId);
        
        // Cập nhật flashcards state
        console.log("Updating flashcards list:", {
          before: flashcards.length,
          after: updatedCards.length,
          removed: true
        });
        setFlashcards(updatedCards);
        
        // Nếu không còn card nào chưa học, hoàn thành
        if (updatedCards.length === 0) {
          setIsCompleted(true);
          message.success("Chúc mừng! Bạn đã học xong tất cả các thẻ!");
          // Refresh stats sau khi hoàn thành
          fetchStudySession();
        }
        
        // Lưu updatedCards để dùng trong setTimeout
        const finalCards = updatedCards;
        
        // Refresh lại từ backend sau một chút để đảm bảo đồng bộ
        setTimeout(() => {
          fetchStudySession();
        }, 500);
        
        const newLearned = new Set(learnedCards);
        newLearned.add(card.cardId);
        setLearnedCards(newLearned);
        setIsCardAnimating(true);
        
        // Animate card out and move to next
        setTimeout(() => {
          setIsCardAnimating(false);
          
          // Chuyển sang card tiếp theo dựa trên danh sách đã cập nhật
          if (finalCards.length > 0) {
            // Tìm index của card tiếp theo
            const nextIndex = Math.min(currentCardIndex, finalCards.length - 1);
            setCurrentCardIndex(nextIndex);
            setIsFlipped(false);
          } else {
            // Tất cả đã học xong
            setCurrentCardIndex(0);
            setIsFlipped(false);
          }
        }, 300);
      } else {
        // Nếu không tìm thấy card trong allFlashcards, vẫn cập nhật UI
        const newLearned = new Set(learnedCards);
        newLearned.add(card.cardId);
        setLearnedCards(newLearned);
        setIsCardAnimating(true);
        
        // Xóa card khỏi danh sách
        const updatedCards = flashcards.filter(c => c.cardId !== card.cardId);
        setFlashcards(updatedCards);
        
        setTimeout(() => {
          setIsCardAnimating(false);
          
          // Chuyển sang card tiếp theo
          if (updatedCards.length > 0) {
            const nextIndex = Math.min(currentCardIndex, updatedCards.length - 1);
            setCurrentCardIndex(nextIndex);
            setIsFlipped(false);
          } else {
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setIsCompleted(true);
            message.success("Chúc mừng! Bạn đã học xong tất cả các thẻ!");
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error marking card as learned:", error);
      message.error("Không thể đánh dấu thẻ đã học. Vui lòng thử lại.");
      // Vẫn cập nhật UI để người dùng có thể tiếp tục
      setIsCardAnimating(false);
    }
  };

  const handleMarkNotLearned = async () => {
    const card = flashcards[currentCardIndex];
    if (!card) return;

    try {
      // Mark as unknown in backend
      await markCardKnowledge({
        cardId: card.cardId,
        isKnown: false,
      });
      
      // Cập nhật status của card trong allFlashcards
      const updatedAllCards = [...allFlashcards];
      const allCardIndex = updatedAllCards.findIndex(c => c.cardId === card.cardId);
      if (allCardIndex !== -1) {
        updatedAllCards[allCardIndex] = {
          ...updatedAllCards[allCardIndex],
          status: "new", // Đánh dấu lại là chưa học
          incorrectCount: (updatedAllCards[allCardIndex].incorrectCount || 0) + 1,
          reviewCount: (updatedAllCards[allCardIndex].reviewCount || 0) + 1,
        };
        setAllFlashcards(updatedAllCards);
        
        // Card vẫn còn trong danh sách flashcards (vì status = "new")
        // Chỉ cần cập nhật lại status
        const updatedCards = [...flashcards];
        const cardIndex = updatedCards.findIndex(c => c.cardId === card.cardId);
        if (cardIndex !== -1) {
          updatedCards[cardIndex] = {
            ...updatedCards[cardIndex],
            status: "new",
            incorrectCount: (updatedCards[cardIndex].incorrectCount || 0) + 1,
            reviewCount: (updatedCards[cardIndex].reviewCount || 0) + 1,
          };
          setFlashcards(updatedCards);
        }
      }
    } catch (error) {
      console.error("Error marking card as not learned:", error);
      // Continue with UI update even if API fails
    }

    const newLearned = new Set(learnedCards);
    newLearned.delete(card.cardId);
    setLearnedCards(newLearned);
    setIsCardAnimating(true);
    
    // Animate card out and move to next
    setTimeout(() => {
      setIsCardAnimating(false);
      
      // Chuyển sang card tiếp theo (card này vẫn còn trong danh sách để học lại)
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // Nếu đã xem hết, quay lại từ đầu để học lại những cái chưa học
        setCurrentCardIndex(0);
        setIsFlipped(false);
        message.info("Đã xem hết! Quay lại học những thẻ chưa học.");
      }
    }, 300);
  };

  const handleLearnAgain = () => {
    // Lọc lại các flashcard chưa học
    const unlearnedCards = allFlashcards.filter(card => card.status !== "learned");
    setFlashcards(unlearnedCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setIsCardAnimating(false);
    
    if (unlearnedCards.length === 0) {
      message.info("Tất cả các thẻ đã được học xong!");
    }
  };

  const currentCard = flashcards[currentCardIndex];
  
  // Tính toán số lượng đã học/chưa học dựa trên allFlashcards
  const learnedCount = allFlashcards.filter(card => card.status === "learned").length;
  const learningCount = allFlashcards.filter(card => card.status === "learning").length;
  const newCount = allFlashcards.filter(card => card.status === "new").length;
  const totalCards = allFlashcards.length;
  
  const progress = totalCards > 0 
    ? (learnedCount / totalCards) * 100 
    : 0;
  const isCurrentCardLearned = currentCard && (
    learnedCards.has(currentCard.cardId) || 
    currentCard.status === "learned" || 
    currentCard.status === "learning"
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu đã hoàn thành, hiển thị màn hình completion
  if (isCompleted && allFlashcards.length > 0) {
    return (
      <div className="quizlet-learn-page">
        <div style={{ marginBottom: 20 }}>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/flashcard/${setId}`)}
            size="large"
          >
            Quay lại
          </Button>
        </div>
        
        <div className="quizlet-learn-container">
          <div className="quizlet-learn-stats">
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Đã học</div>
              <div className="quizlet-stat-value learned">{learnedCount}</div>
            </div>
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Chưa học</div>
              <div className="quizlet-stat-value not-learned">
                {newCount + learningCount}
              </div>
            </div>
            {learningCount > 0 && (
              <div className="quizlet-stat-item">
                <div className="quizlet-stat-label">Đang học</div>
                <div className="quizlet-stat-value" style={{ color: "#1890ff" }}>
                  {learningCount}
                </div>
              </div>
            )}
            {studyStats && (
              <div className="quizlet-stat-item">
                <div className="quizlet-stat-label">Đã ôn tập</div>
                <div className="quizlet-stat-value">{studyStats.totalCardsStudied || 0}</div>
              </div>
            )}
          </div>

          <div className="quizlet-progress-container">
            <Progress
              percent={progress}
              showInfo={false}
              strokeColor="#52c41a"
              className="quizlet-progress"
            />
            <div className="quizlet-progress-text">
              <span style={{ color: "#52c41a", fontWeight: 600 }}>
                Hoàn thành! Đã học: {learnedCount} / {totalCards}
              </span>
            </div>
          </div>

          <div className="quizlet-completion-screen">
            <div className="quizlet-completion-icon">
              <CheckOutlined />
            </div>
            <h2 className="quizlet-completion-title">Hoàn thành!</h2>
            <p className="quizlet-completion-text">
              Bạn đã học xong {learnedCount} / {totalCards} thẻ
            </p>
            {studyStats && (
              <div style={{ marginTop: 16, fontSize: 14, color: "#666" }}>
                <p>Tổng số thẻ đã ôn tập: {studyStats.totalCardsStudied || 0}</p>
              </div>
            )}
          </div>

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
        </div>
      </div>
    );
  }

  // Nếu không có flashcard nào
  if (flashcards.length === 0 && !isCompleted) {
    return (
      <div className="quizlet-learn-page">
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Empty description="Không có thẻ flashcard nào" />
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/flashcard/${setId}`)}
            style={{ marginTop: 20 }}
            size="large"
          >
            Quay trở lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizlet-learn-page">
      {/* Back Button */}
      <div style={{ marginBottom: 20 }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/flashcard/${setId}`)}
          size="large"
        >
          Quay lại
        </Button>
      </div>
      
      <div className="quizlet-learn-container">
        <div className="quizlet-learn-stats">
          <div className="quizlet-stat-item">
            <div className="quizlet-stat-label">Đã học</div>
            <div className="quizlet-stat-value learned">{learnedCount}</div>
          </div>
          <div className="quizlet-stat-item">
            <div className="quizlet-stat-label">Chưa học</div>
            <div className="quizlet-stat-value not-learned">
              {newCount + learningCount}
            </div>
          </div>
          {learningCount > 0 && (
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Đang học</div>
              <div className="quizlet-stat-value" style={{ color: "#1890ff" }}>
                {learningCount}
              </div>
            </div>
          )}
          {studyStats && (
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Đã ôn tập</div>
              <div className="quizlet-stat-value">{studyStats.totalCardsStudied || 0}</div>
            </div>
          )}
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
                Hoàn thành! Đã học: {learnedCount} / {flashcards.length}
              </span>
            ) : (
              `Đã học: ${learnedCount} / ${totalCards}`
            )}
          </div>
        </div>

        {!isCompleted ? (
          <>
            <div className="quizlet-learn-card-wrapper">
              <div
                className={`quizlet-learn-card ${isFlipped ? "flipped" : ""} ${isCurrentCardLearned ? "learned" : ""} ${isCardAnimating ? "card-animating" : ""}`}
                style={{
                  opacity: isCardAnimating ? 0 : 1,
                  transition: "all 0.3s ease",
                }}
                onClick={handleCardClick}
              >
                <div className="quizlet-learn-card-inner">
                  <div className={`quizlet-card-face quizlet-card-front ${isFlipped ? "hidden" : ""}`}>
                    <div className="quizlet-card-content">
                      <div className="quizlet-card-word">{currentCard?.term || currentCard?.frontText}</div>
                      <div className="quizlet-card-hint">
                        <RotateLeftOutlined /> Nhấn để xem nghĩa
                      </div>
                    </div>
                  </div>
                  <div className={`quizlet-card-face quizlet-card-back ${!isFlipped ? "hidden" : ""}`}>
                    <div className="quizlet-card-content">
                      <div className="quizlet-card-word">{currentCard?.definition || currentCard?.backText}</div>
                      <div className="quizlet-card-hint">
                        <RotateLeftOutlined /> Nhấn để xem từ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: 16, 
              marginTop: 32,
              flexWrap: "wrap"
            }}>
              <Button
                type="default"
                danger
                icon={<CloseOutlined />}
                onClick={handleMarkNotLearned}
                size="large"
                disabled={isCardAnimating}
                style={{
                  minWidth: 150,
                  height: 50,
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                Chưa học
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleMarkLearned}
                size="large"
                disabled={isCardAnimating}
                style={{
                  minWidth: 150,
                  height: 50,
                  fontSize: 16,
                  fontWeight: 500,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                Đã học
              </Button>
            </div>
          </>
        ) : (
          <div className="quizlet-completion-screen">
            <div className="quizlet-completion-icon">
              <CheckOutlined />
            </div>
            <h2 className="quizlet-completion-title">Hoàn thành!</h2>
            <p className="quizlet-completion-text">
              Bạn đã học xong {learnedCount} / {totalCards} thẻ
            </p>
            {studyStats && (
              <div style={{ marginTop: 16, fontSize: 14, color: "#666" }}>
                <p>Tổng số thẻ đã ôn tập: {studyStats.totalCardsStudied || 0}</p>
              </div>
            )}
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



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
import { getFlashcardsBySetId, markCardKnowledge, startStudySession, getStudyStats, resetStudySession } from "@services/flashcardService";
import { useAuth } from "@shared/hooks/useAuth";
import "@shared/styles/FlashcardDetail.css";

export default function FlashcardLearn() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [allFlashcards, setAllFlashcards] = useState([]); // Tất cả flashcard
  const [flashcards, setFlashcards] = useState([]); // Chỉ các flashcard chưa học (để hiển thị)
  const [loading, setLoading] = useState(false);
  const [learnedCards, setLearnedCards] = useState(new Set());
  const [isCardAnimating, setIsCardAnimating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [studyStats, setStudyStats] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetchStudySession();
  }, [setId, isAuthenticated]);

  const fetchStudySession = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setAccessDenied(false);
      
      // Nếu chưa đăng nhập, chỉ lấy danh sách flashcard thông thường
      if (!isAuthenticated) {
        const cardsData = await getFlashcardsBySetId(setId);
        const allCards = Array.isArray(cardsData) ? cardsData : [];
        setAllFlashcards(allCards);
        setFlashcards(allCards);
        setLearnedCards(new Set()); // Không có trạng thái học tập cho khách
        setIsCompleted(false);
        setStudyStats(null);
        return;
      }
      
      // Nếu đã đăng nhập, sử dụng startStudySession để lấy thông tin học tập với trạng thái
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
        
        // Cập nhật trạng thái hoàn thành dựa trên dữ liệu mới
        setIsCompleted(unlearnedCards.length === 0 && allCards.length > 0);
      } else {
        setAllFlashcards([]);
        setFlashcards([]);
        setIsCompleted(false);
      }
      
      // Lấy thống kê học tập (chỉ khi đã đăng nhập)
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
      const status = error?.response?.status;
      
      // Kiểm tra nếu là lỗi quyền truy cập (403) hoặc message chứa "Access denied" hoặc "private"
      const isAccessDenied = status === 403 || 
                            errorMsg.toLowerCase().includes("access denied") ||
                            errorMsg.toLowerCase().includes("riêng tư") ||
                            errorMsg.toLowerCase().includes("private");
      
      if (isAccessDenied) {
        setAccessDenied(true);
        message.error("Bạn không có quyền truy cập flashcard này");
        // Tự động chuyển hướng về trang flashcard sau 1 giây
        setTimeout(() => {
          navigate("/flashcard");
        }, 1000);
        if (showLoader) {
          setLoading(false);
        }
        return;
      }
      
      // Chỉ hiển thị lỗi nếu đã đăng nhập và không phải lỗi quyền truy cập
      if (isAuthenticated) {
        message.error(errorMsg);
      }
      // Fallback: thử lấy danh sách flashcard thông thường
      try {
        const cardsData = await getFlashcardsBySetId(setId);
        const allCards = Array.isArray(cardsData) ? cardsData : [];
        setAllFlashcards(allCards);
        // Với fallback, tất cả đều là "new" (chưa học)
        setFlashcards(allCards);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
        // Kiểm tra lại nếu fallback cũng bị lỗi quyền truy cập
        const fallbackStatus = fallbackError?.response?.status;
        const fallbackMsg = fallbackError?.response?.data?.message || "";
        const isFallbackAccessDenied = fallbackStatus === 403 || 
                                      fallbackMsg.toLowerCase().includes("access denied") ||
                                      fallbackMsg.toLowerCase().includes("riêng tư") ||
                                      fallbackMsg.toLowerCase().includes("private");
        
        if (isFallbackAccessDenied) {
          setAccessDenied(true);
          message.error("Bạn không có quyền truy cập flashcard này");
          setTimeout(() => {
            navigate("/flashcard");
          }, 1000);
        }
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
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
      return;
    }

    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để lưu tiến độ học tập");
      // Vẫn cho phép xem flashcard nhưng không lưu trạng thái
      return;
    }


    try {
      // Mark as known in backend
      const result = await markCardKnowledge({
        cardId: card.cardId,
        isKnown: true,
      });
      
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
        
        
        updatedAllCards[allCardIndex] = {
          ...updatedAllCards[allCardIndex],
          status: newStatus,
          correctCount: currentCorrectCount,
          reviewCount: (updatedAllCards[allCardIndex].reviewCount || 0) + 1,
        };
        setAllFlashcards(updatedAllCards);
        
        // Xóa card khỏi danh sách flashcards vì đã nhớ
        const updatedCards = flashcards.filter(c => c.cardId !== card.cardId);
        
        // Cập nhật flashcards state
        setFlashcards(updatedCards);
        
        // Nếu không còn card nào chưa học, hoàn thành
        if (updatedCards.length === 0) {
          setIsCompleted(true);
          message.success("Chúc mừng! Bạn đã nhớ tất cả các thẻ!");
          // Refresh stats sau khi hoàn thành
          fetchStudySession(false);
        }
        
        // Lưu updatedCards để dùng trong setTimeout
        const finalCards = updatedCards;
        
        // Refresh lại từ backend sau một chút để đảm bảo đồng bộ
        setTimeout(() => {
          fetchStudySession(false);
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
            // Tất cả đã nhớ
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
            message.success("Chúc mừng! Bạn đã nhớ tất cả các thẻ!");
          }
        }, 300);
      }
    } catch (error) {
      console.error("Error marking card as learned:", error);
      message.error("Không thể đánh dấu thẻ đã nhớ. Vui lòng thử lại.");
      // Vẫn cập nhật UI để người dùng có thể tiếp tục
      setIsCardAnimating(false);
    }
  };

  const handleMarkNotLearned = async () => {
    const card = flashcards[currentCardIndex];
    if (!card) return;

    // Nếu chưa đăng nhập, chỉ cập nhật local state
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để lưu tiến độ học tập");
      // Vẫn cho phép xem flashcard nhưng không lưu trạng thái
      return;
    }

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
        // Nếu đã xem hết, quay lại từ đầu để ôn tập lại những cái chưa nhớ
        setCurrentCardIndex(0);
        setIsFlipped(false);
        message.info("Đã xem hết! Quay lại ôn tập những thẻ chưa nhớ.");
      }
    }, 300);
  };

  const handleLearnAgain = async () => {
    // Nếu chưa đăng nhập, không cho reset
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để sử dụng chức năng này");
      return;
    }

    try {
      setLoading(true);
      await resetStudySession(setId);
      message.success("Đã đặt lại tiến trình. Bắt đầu học lại từ đầu!");
      // Reset trạng thái để giao diện chuyển sang chế độ học ngay lập tức
      setIsCompleted(false);
      setIsFlipped(false);
      setCurrentCardIndex(0);
      await fetchStudySession(false);
    } catch (error) {
      console.error("Error resetting study session:", error);
      const errorMsg = error?.response?.data?.message || "Không thể đặt lại tiến trình học";
      message.error(errorMsg);
    } finally {
      setLoading(false);
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

  if (loading || accessDenied) {
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
              <div className="quizlet-stat-label">Đã nhớ</div>
              <div className="quizlet-stat-value learned">{learnedCount}</div>
            </div>
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Chưa nhớ</div>
              <div className="quizlet-stat-value not-learned">
                {newCount + learningCount}
              </div>
            </div>
            {learningCount > 0 && (
              <div className="quizlet-stat-item">
                <div className="quizlet-stat-label">Đang ôn tập</div>
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
                Hoàn thành! Đã nhớ: {learnedCount} / {totalCards}
              </span>
            </div>
          </div>

          <div className="quizlet-completion-screen">
            <div className="quizlet-completion-icon">
              <CheckOutlined />
            </div>
            <h2 className="quizlet-completion-title">Hoàn thành!</h2>
            <p className="quizlet-completion-text">
              Bạn đã nhớ {learnedCount} / {totalCards} thẻ
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
            <div className="quizlet-stat-label">Đã nhớ</div>
            <div className="quizlet-stat-value learned">{learnedCount}</div>
          </div>
          <div className="quizlet-stat-item">
            <div className="quizlet-stat-label">Chưa nhớ</div>
            <div className="quizlet-stat-value not-learned">
              {newCount + learningCount}
            </div>
          </div>
          {learningCount > 0 && (
            <div className="quizlet-stat-item">
              <div className="quizlet-stat-label">Đang ôn tập</div>
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
                Hoàn thành! Đã nhớ: {learnedCount} / {flashcards.length}
              </span>
            ) : (
              `Đã nhớ: ${learnedCount} / ${totalCards}`
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
                  <div className="quizlet-card-word">
                    {currentCard?.term || currentCard?.frontText}
                  </div>
                  {(currentCard?.pronunciation || currentCard?.wordType) && (
                    <div className="quizlet-card-meta">
                      {currentCard?.pronunciation && (
                        <span className="quizlet-card-pron">{currentCard.pronunciation}</span>
                      )}
                      {currentCard?.wordType && (
                        <span className="quizlet-card-type">({currentCard.wordType})</span>
                      )}
                    </div>
                  )}
                      <div className="quizlet-card-hint">
                        <RotateLeftOutlined /> Nhấn để xem nghĩa
                      </div>
                    </div>
                  </div>
                  <div className={`quizlet-card-face quizlet-card-back ${!isFlipped ? "hidden" : ""}`}>
                    <div className="quizlet-card-content">
                      <div className="quizlet-card-word">
                        {currentCard?.definition || currentCard?.backText}
                      </div>

                      {Array.isArray(currentCard?.examples) && currentCard.examples.length > 0 && (
                        <div className="quizlet-card-section">
                          <div className="quizlet-card-section-title">Ví dụ</div>
                          <ul className="quizlet-card-examples">
                            {currentCard.examples.map((ex, idx) => (
                              <li key={idx}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentCard?.notes && (
                        <div className="quizlet-card-section quizlet-card-notes">
                          <div className="quizlet-card-section-title">Ghi chú</div>
                          <div className="quizlet-card-notes-text">{currentCard.notes}</div>
                        </div>
                      )}

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
                Chưa nhớ
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
                Đã nhớ
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
              Bạn đã nhớ {learnedCount} / {totalCards} thẻ
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



import React, { useState, useEffect } from "react";
import { Button, Card, Space, Row, Col, message, Empty, Spin, Tag } from "antd";
import {
  ArrowLeftOutlined,
  LeftOutlined,
  RightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  RotateLeftOutlined,
  CheckOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getFlashcardSetById, getFlashcardsBySetId, deleteFlashcard, startStudySession } from "@services/flashcardService";
import { useAuth } from "@shared/hooks/useAuth";
import { textToSpeech } from "@shared/utils/textToSpeech";
import AddFlashcardModal from "@shared/components/Flashcard/AddFlashcardModal";
import UpdateFlashcardSetModal from "@shared/components/Flashcard/UpdateFlashcardSetModal";
import UpdateFlashcardModal from "@shared/components/Flashcard/UpdateFlashcardModal";
import "@shared/styles/FlashcardDetail.css";

export default function FlashcardDetail() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [cardStatusMap, setCardStatusMap] = useState(new Map()); // Map cardId -> status
  const [loading, setLoading] = useState(false);
  const [studyMode, setStudyMode] = useState("flashcard"); // flashcard, learn
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [editSetModalOpen, setEditSetModalOpen] = useState(false);
  const [editCardModalOpen, setEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    if (setId) {
      fetchFlashcardDetail();
    }
  }, [setId, isAuthenticated]);

  const fetchFlashcardDetail = async () => {
    try {
      setLoading(true);
      const [setData, cardsData] = await Promise.all([
        getFlashcardSetById(setId),
        getFlashcardsBySetId(setId),
      ]);

      setFlashcardSet(setData);
      setFlashcards(Array.isArray(cardsData) ? cardsData : []);
      
      // Nếu user đã đăng nhập, lấy thông tin trạng thái học tập
      if (isAuthenticated) {
        try {
          const sessionData = await startStudySession(setId);
          if (sessionData && sessionData.cards) {
            const statusMap = new Map();
            sessionData.cards.forEach(card => {
              statusMap.set(card.cardId, card.status);
            });
            setCardStatusMap(statusMap);
          }
        } catch (studyError) {
          console.error("Error fetching study session:", studyError);
          // Không hiển thị lỗi, chỉ không hiển thị trạng thái
        }
      }
    } catch (error) {
      console.error("Error fetching flashcard detail:", error);
      const errorMsg = error?.response?.data?.message || "Không thể tải chi tiết flashcard";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusTag = (cardId) => {
    const status = cardStatusMap.get(cardId);
    if (!status) return null;
    
    if (status === "learned") {
      return <Tag color="green" style={{ marginLeft: 8 }}>Đã học</Tag>;
    } else if (status === "learning") {
      return <Tag color="blue" style={{ marginLeft: 8 }}>Đang học</Tag>;
    } else if (status === "new") {
      return <Tag color="default" style={{ marginLeft: 8 }}>Chưa học</Tag>;
    }
    return null;
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

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation();
    try {
      await deleteFlashcard(cardId);
      message.success("Xóa thẻ thành công");
      // Reload cards
      const cardsData = await getFlashcardsBySetId(setId);
      setFlashcards(Array.isArray(cardsData) ? cardsData : []);
      // Reset to first card if current card was deleted
      if (currentCardIndex >= flashcards.length - 1) {
        setCurrentCardIndex(Math.max(0, flashcards.length - 2));
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      const errorMsg = error?.response?.data?.message || "Không thể xóa thẻ";
      message.error(errorMsg);
    }
  };

  const handlePlayAudio = (e, text, lang = 'en-US') => {
    e?.stopPropagation();
    
    if (!textToSpeech.isSupported()) {
      message.warning("Trình duyệt của bạn không hỗ trợ tính năng phát âm");
      return;
    }

    if (!text || text.trim() === '') {
      message.warning("Không có văn bản để phát âm");
      return;
    }

    try {
      if (lang.startsWith('en')) {
        textToSpeech.speakEnglish(text);
      } else if (lang.startsWith('vi')) {
        textToSpeech.speakVietnamese(text);
      } else {
        textToSpeech.speak(text, { lang });
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      message.error("Không thể phát âm");
    }
  };


  const currentCard = flashcards[currentCardIndex];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="quizlet-container">
      {/* Back Button */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/flashcard")}
          size="large"
          style={{
            borderRadius: 8,
            height: 40,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 500,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            border: "1px solid #d9d9d9",
          }}
        >
          Quay lại 
        </Button>
      </div>

      {/* Header */}
      <div className="quizlet-header">
       
            {flashcardSet && (
          <div className="quizlet-title-section">
            <h1 className="quizlet-title">{flashcardSet.title}</h1>
            {flashcardSet.description && (
              <p className="quizlet-subtitle">{flashcardSet.description}</p>
            )}
          </div>
        )}
      </div>


      {/* All Buttons in One Row */}
      <div className="quizlet-all-buttons">
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
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={() => setAddCardModalOpen(true)}
          className="quizlet-action-btn"
        >
          Thêm thẻ
        </Button>
        <Button
          type="default"
          icon={<EditOutlined />}
          onClick={() => setEditSetModalOpen(true)}
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
              onClick={() => {
                const text = currentCard?.term || currentCard?.frontText || '';
                const lang = flashcardSet?.language || 'en-US';
                handlePlayAudio(null, text, lang);
              }}
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
                  <div className="quizlet-vocab-term">
                    {card.term || card.frontText}
                    {isAuthenticated && getStatusTag(card.cardId)}
                  </div>
                  <div className="quizlet-vocab-definition">{card.definition || card.backText}</div>
                </div>
                <div className="quizlet-vocab-actions">
                  <Button
                    type="text"
                    icon={<SoundOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const text = card.term || card.frontText || '';
                      const lang = flashcardSet?.language || 'en-US';
                      handlePlayAudio(e, text, lang);
                    }}
                    className="quizlet-vocab-action-icon"
                    title="Phát âm"
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCard(card);
                      setEditCardModalOpen(true);
                    }}
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

      <AddFlashcardModal
        open={addCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
        onSuccess={() => {
          fetchFlashcardDetail();
        }}
        setId={parseInt(setId)}
      />

      <UpdateFlashcardSetModal
        open={editSetModalOpen}
        onClose={() => setEditSetModalOpen(false)}
        onSuccess={() => {
          fetchFlashcardDetail();
        }}
        setId={parseInt(setId)}
      />

      <UpdateFlashcardModal
        open={editCardModalOpen}
        onClose={() => {
          setEditCardModalOpen(false);
          setEditingCard(null);
        }}
        onSuccess={() => {
          fetchFlashcardDetail();
        }}
        card={editingCard}
      />
    </div>
  );
}


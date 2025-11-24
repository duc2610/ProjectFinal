/**
 * Tiện ích Text to Speech sử dụng Web Speech API
 * Hỗ trợ nhiều ngôn ngữ và giọng đọc
 */

export const textToSpeech = {
    /**
     * Kiểm tra trình duyệt có hỗ trợ speech synthesis hay không
     */
    isSupported: () => {
      return 'speechSynthesis' in window;
    },
  
    /**
     * Lấy danh sách các giọng đọc có sẵn trong trình duyệt
     */
    getVoices: () => {
      return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          // Chờ giọng đọc load xong
          speechSynthesis.onvoiceschanged = () => {
            resolve(speechSynthesis.getVoices());
          };
        }
      });
    },
  
    /**
     * Phát giọng đọc từ text với các tùy chọn
     * @param {string} text - Chuỗi văn bản cần đọc
     * @param {object} options - Tuỳ chọn đọc
     * @param {string} options.lang - Mã ngôn ngữ (vd: 'en-US', 'vi-VN')
     * @param {number} options.rate - Tốc độ đọc (0.1 - 10, mặc định: 1)
     * @param {number} options.pitch - Độ cao giọng (0 - 2, mặc định: 1)
     * @param {number} options.volume - Âm lượng (0 - 1, mặc định: 1)
     * @param {string} options.voiceURI - Giọng đọc cụ thể (tuỳ chọn)
     */
    speak: (text, options = {}) => {
      if (!textToSpeech.isSupported()) {
        console.warn('Trình duyệt không hỗ trợ speech synthesis');
        return null;
      }
  
      // Hủy các tác vụ đang đọc trước đó
      speechSynthesis.cancel();
  
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Thiết lập giá trị mặc định
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
  
      // Nếu có voiceURI thì chọn giọng chính xác
      if (options.voiceURI) {
        textToSpeech.getVoices().then(voices => {
          const voice = voices.find(v => v.voiceURI === options.voiceURI);
          if (voice) {
            utterance.voice = voice;
          }
          speechSynthesis.speak(utterance);
        });
      } else {
        // Nếu không, auto chọn giọng phù hợp nhất với ngôn ngữ
        textToSpeech.getVoices().then(voices => {
          const langVoices = voices.filter(v => v.lang.startsWith(options.lang || 'en-US'));
          if (langVoices.length > 0) {
            // Ưu tiên giọng native
            const nativeVoice = langVoices.find(v => v.localService) || langVoices[0];
            utterance.voice = nativeVoice;
          }
          speechSynthesis.speak(utterance);
        });
      }
  
      return utterance;
    },
  
    /**
     * Dừng đọc ngay lập tức
     */
    stop: () => {
      if (textToSpeech.isSupported()) {
        speechSynthesis.cancel();
      }
    },
  
    /**
     * Tạm dừng đọc
     */
    pause: () => {
      if (textToSpeech.isSupported()) {
        speechSynthesis.pause();
      }
    },
  
    /**
     * Tiếp tục đọc sau khi pause
     */
    resume: () => {
      if (textToSpeech.isSupported()) {
        speechSynthesis.resume();
      }
    },
  
    /**
     * Kiểm tra xem giọng đọc có đang hoạt động không
     */
    isSpeaking: () => {
      return textToSpeech.isSupported() && speechSynthesis.speaking;
    },
  
    /**
     * Đọc văn bản tiếng Anh (tối ưu cho English)
     */
    speakEnglish: (text, options = {}) => {
      return textToSpeech.speak(text, {
        lang: 'en-US',
        rate: 0.9,
        pitch: 1,
        ...options
      });
    },
  
    /**
     * Đọc văn bản tiếng Việt (tối ưu cho Vietnamese)
     */
    speakVietnamese: (text, options = {}) => {
      return textToSpeech.speak(text, {
        lang: 'vi-VN',
        rate: 0.9,
        pitch: 1,
        ...options
      });
    }
  };
  
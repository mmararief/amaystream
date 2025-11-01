import { useState, useEffect } from "react";
import { useAISearch } from "../contexts/AISearchContext";

export default function AISearchNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { openAISearch } = useAISearch();

  useEffect(() => {
    // Cek apakah notifikasi sudah pernah ditutup
    const dismissed = localStorage.getItem("ai_search_notification_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      return;
    }

    // Tampilkan notifikasi setelah delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Muncul setelah 2 detik

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("ai_search_notification_dismissed", "true");
    openAISearch();
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("ai_search_notification_dismissed", "true");
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="ai-search-notification" onClick={handleClick}>
      <div className="ai-search-notification-content">
        <div className="ai-search-notification-icon">✨</div>
        <div className="ai-search-notification-text">
          <strong>Pusing mau cari film apa?</strong>
          <span>Coba cari di AI yuk!</span>
        </div>
      </div>
      <button
        className="ai-search-notification-close"
        onClick={handleClose}
        aria-label="Tutup"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4l8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}



import { useEffect, useState } from 'react';
import './GuideModal.css';

export default function GuideModal() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            return;
        }

        setIsVisible(true);
        const hideTimer = setTimeout(() => setIsVisible(false), 8000);

        return () => {
            clearTimeout(hideTimer);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="guide-modal" role="status" aria-live="polite">
            <button
                type="button"
                className="guide-modal-close-button"
                aria-label="Close keyboard navigation guide"
                onClick={() => setIsVisible(false)}
            >
                ×
            </button>
            <div className="guide-modal-body">
                <div className="guide-modal-row">
                    <span className="guide-modal-keys">hjkl / ←↑→⇩</span>
                    <span className="guide-modal-label">movement</span>
                </div>
                <div className="guide-modal-row">
                    <span className="guide-modal-keys">Enter / Esc</span>
                    <span className="guide-modal-label">決定 / 戻る</span>
                </div>
            </div>
        </div>
    );
}

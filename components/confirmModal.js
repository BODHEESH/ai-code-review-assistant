
// components/ConfirmationModal.js
import styles from '../styles/Dashboard.module.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText }) {
    if (!isOpen) return null;

    return (
        <div className={`${styles.fixedInView} flex items-center justify-center z-50`}>
            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>{title}</h3>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className={`${styles.modalButton} ${styles.cancelButton} hover:bg-gray-400`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`${styles.modalButton} ${styles.confirmButton} hover:bg-red-700`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

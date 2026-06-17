'use client';

import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  message = '정말 삭제하시겠습니까?',
  confirmLabel = '삭제',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

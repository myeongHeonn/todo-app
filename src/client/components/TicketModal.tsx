'use client';

import { useState, useEffect } from 'react';
import type { TicketWithMeta, UpdateTicketInput } from '@/shared/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { TicketDetailView } from './TicketDetailView';
import { TicketForm } from './TicketForm';
import { ConfirmDialog } from './ConfirmDialog';

interface TicketModalProps {
  ticket: TicketWithMeta;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTicketInput) => void;
  onDelete: (id: number) => void;
}

export function TicketModal({ ticket, isOpen, onClose, onUpdate, onDelete }: TicketModalProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsDeleteConfirmOpen(false);
  }, [isOpen]);

  function handleDeleteConfirm() {
    onDelete(ticket.id);
    setIsDeleteConfirmOpen(false);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={ticket.title}>
        <TicketDetailView ticket={ticket} />
        <TicketForm
          mode="edit"
          initialData={ticket}
          onSubmit={(data) => onUpdate(ticket.id, data as UpdateTicketInput)}
          onCancel={onClose}
        />
        <div className="modal-footer">
          <Button variant="danger" onClick={() => setIsDeleteConfirmOpen(true)}>
            삭제
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
}

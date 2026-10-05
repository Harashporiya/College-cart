import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './deleteProduct.module.css';
import { getToken } from '../../util/tokenService';
import axios from 'axios';
const backend_url = import.meta.env.VITE_BACKEND_API_URL;
import toast, { Toaster } from 'react-hot-toast';

const DeleteProduct = ({ isOpen, onClose, productId, bookId, onDeleted }) => {
  const dialogRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) return;
    if (isOpen) {
      if (!dialogElement.open) dialogElement.showModal();
    } else if (dialogElement.open) {
      dialogElement.close();
    }
  }, [isOpen]);
  
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };
  
  const handleDelete = async () => {
    if (isDeleting) return;

    const token = getToken();
    setIsDeleting(true);

    try {
      if (productId) {
        await axios.delete(`${backend_url}/${productId}/product-delete`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    
      if (bookId) {
        await axios.delete(`${backend_url}/${bookId}/deleteId`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      toast.success("Product deleted successfully");
      onDeleted?.(productId || bookId);
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error("Error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <dialog
        ref={dialogRef}
        className={styles.dialogContainer}
        onCancel={handleClose}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.openDialog}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={styles.deleteText}>Delete Product</h2>
              <p className={styles.deleteConfirmation}>
                Are you sure you want to delete this product?
              </p>
              <div className={styles.buttonContainer}>
                <button
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  aria-busy={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
      <Toaster/>
    </>
  );
};

export default DeleteProduct; 
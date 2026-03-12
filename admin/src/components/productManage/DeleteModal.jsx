import React from "react";
import { Trash2, Loader2 } from "lucide-react";

const DeleteModal = ({ product, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-sm shadow-2xl w-full max-w-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Delete Product?
            </h3>
            <p className="text-xs text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-800 line-clamp-2">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{product.price}</p>
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 border-2 border-gray-200 rounded-sm text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-sm text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50">
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DeleteModal;

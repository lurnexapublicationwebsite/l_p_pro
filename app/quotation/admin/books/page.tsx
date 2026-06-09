"use client";

import { useEffect, useState } from "react";

interface Book {
  id: string;
  book_name: string;
  description: string;
  created_at: string;
}

export default function BooksManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [bookName, setBookName] = useState("");
  const [description, setDescription] = useState("");
  const [targetBook, setTargetBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Books Management - Book Quotation System";
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);
      const res = await fetch("/api/quotation/books");
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err: any) {
      setError(err.message || "Failed to load books.");
    } finally {
      setLoading(false);
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/quotation/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_name: bookName, description }),
      });

      if (!res.ok) throw new Error("Failed to add book");
      
      // Refresh list
      await fetchBooks();
      setShowAddModal(false);
      setBookName("");
      setDescription("");
    } catch (err: any) {
      alert(err.message || "Error adding book.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditOpen = (book: Book) => {
    setTargetBook(book);
    setBookName(book.book_name);
    setDescription(book.description || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBook) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quotation/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetBook.id, book_name: bookName, description }),
      });

      if (!res.ok) throw new Error("Failed to update book");
      
      // Refresh list
      await fetchBooks();
      setShowEditModal(false);
      setTargetBook(null);
      setBookName("");
      setDescription("");
    } catch (err: any) {
      alert(err.message || "Error updating book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!targetBook) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quotation/books?id=${targetBook.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete book");
      
      setBooks(books.filter((b) => b.id !== targetBook.id));
      setShowDeleteModal(false);
      setTargetBook(null);
    } catch (err: any) {
      alert(err.message || "Error deleting book.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading books...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div className="max-w-[1000px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
          Books Management
        </h1>
        <button
          onClick={() => {
            setBookName("");
            setDescription("");
            setShowAddModal(true);
          }}
          className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          + Add New Book
        </button>
      </div>

      {/* Books Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#374151] font-semibold">
              <tr>
                <th className="px-6 py-4">Book Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-[#111827]">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-[#6b7280]">
                    No books added yet.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold align-middle">{book.book_name}</td>
                    <td className="px-6 py-4 align-middle text-[#4b5563]">
                      {book.description || <span className="text-[#9ca3af] italic">No description</span>}
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <button
                        onClick={() => handleEditOpen(book)}
                        className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg text-xs transition mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setTargetBook(book);
                          setShowDeleteModal(true);
                        }}
                        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div 
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity"
        >
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-[480px] w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="h-1.5 w-full bg-[#4f46e5]"></div>
            <div className="px-6 py-5 flex justify-between items-center border-b border-[#e5e7eb]">
              <h5 className="font-bold text-lg text-[#111827]">Add New Book</h5>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#374151] mb-2">Book Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter book name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm transition focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#e0e7ff]"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#374151] mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide a brief description of the book (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm transition focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#e0e7ff]"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  {saving ? "Saving..." : "Save Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div 
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity"
        >
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-[480px] w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="h-1.5 w-full bg-[#4f46e5]"></div>
            <div className="px-6 py-5 flex justify-between items-center border-b border-[#e5e7eb]">
              <h5 className="font-bold text-lg text-[#111827]">Edit Book</h5>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#374151] mb-2">Book Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter book name"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm transition focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#e0e7ff]"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#374151] mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide a brief description of the book (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm transition focus:bg-white focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#e0e7ff]"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Book Modal */}
      {showDeleteModal && targetBook && (
        <div 
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity"
        >
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-[440px] w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-250">
            <div className="h-1.5 w-full bg-red-600"></div>
            <div className="px-6 py-5 flex justify-between items-center border-b border-[#e5e7eb]">
              <h5 className="font-bold text-lg text-[#111827] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-red-600">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                </svg>
                Confirm Deletion
              </h5>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-[#4b5563] leading-relaxed mb-6">
                Are you sure you want to delete the book <strong>&quot;{targetBook.book_name}&quot;</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 border-t border-[#e5e7eb] pt-5">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition shadow-sm"
                >
                  {saving ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

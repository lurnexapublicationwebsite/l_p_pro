"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  book_name: string;
  description?: string;
}

interface SelectedBook {
  book_name: string;
  quantity: number;
}

export default function QuotationRequestPage() {
  const router = useRouter();
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);
  const [institutionName, setInstitutionName] = useState("");
  const [authorizedPerson, setAuthorizedPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown open and search state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch books
  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/quotation/books");
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooksList(data.books || []);
      } catch (err: any) {
        console.error(err);
        setError("Error loading books. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBookSelect = (bookName: string) => {
    if (selectedBooks.some((b) => b.book_name === bookName)) {
      // Remove it if clicked again (toggle behavior like select2 multiple)
      setSelectedBooks(selectedBooks.filter((b) => b.book_name !== bookName));
    } else {
      setSelectedBooks([...selectedBooks, { book_name: bookName, quantity: 1 }]);
    }
    setSearchTerm("");
  };

  const handleQuantityChange = (bookName: string, qty: number) => {
    setSelectedBooks(
      selectedBooks.map((b) => (b.book_name === bookName ? { ...b, quantity: Math.max(1, qty) } : b))
    );
  };

  const handleRemoveBook = (bookName: string) => {
    setSelectedBooks(selectedBooks.filter((b) => b.book_name !== bookName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooks.length === 0) {
      alert("Please select at least one book.");
      return;
    }
    if (contactNumber.length !== 10) {
      alert("Please enter exactly 10 numeric digits for the contact number.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quotation/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution_name: institutionName,
          authorized_person: authorizedPerson,
          contact_number: contactNumber,
          email,
          items: selectedBooks,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }

      router.push("/quotation/success");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  const filteredBooks = booksList.filter((book) =>
    book.book_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] pt-10 pb-[60px] font-sans antialiased text-[#111827]">
      <div className="mx-auto max-w-[700px] px-4">
        <form onSubmit={handleSubmit}>
          {/* Header Card */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border-t-[8px] border-t-[#4f46e5]">
            <h1 className="text-[32px] font-bold tracking-tight text-[#111827] mb-3 leading-tight">
              Book Quotation Request
            </h1>
            <p className="text-[15px] text-[#4b5563] leading-relaxed mb-0">
              Please fill out this form to request a formal quotation for the books you need. We will review your request and get back to you shortly.
            </p>
            <hr className="mt-4 mb-0 border-t border-t-[#dadce0]" />
            <p className="mt-3 mb-0 text-[13px] text-[#d93025]">* Indicates required question</p>
          </div>

          {error && (
            <div className="mb-5 rounded-[12px] bg-red-50 p-4 border border-red-200 text-[#d93025] text-sm">
              {error}
            </div>
          )}

          {/* Institution Name */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <label className="block text-[16px] font-semibold text-[#374151] mb-4">
              Institution Name <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-b-[#e5e7eb] px-0 py-2.5 text-[15px] outline-none transition-colors duration-300 focus:border-b-[#4f46e5]"
              placeholder="Your answer"
              required
              suppressHydrationWarning
              autoComplete="off"
            />
          </div>

          {/* Authorized Person */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <label className="block text-[16px] font-semibold text-[#374151] mb-4">
              Authorized Person <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="text"
              value={authorizedPerson}
              onChange={(e) => setAuthorizedPerson(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-b-[#e5e7eb] px-0 py-2.5 text-[15px] outline-none transition-colors duration-300 focus:border-b-[#4f46e5]"
              placeholder="Your answer"
              required
              suppressHydrationWarning
              autoComplete="off"
            />
          </div>

          {/* Contact Number */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <label className="block text-[16px] font-semibold text-[#374151] mb-4">
              Contact Number <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full bg-transparent border-0 border-b-2 border-b-[#e5e7eb] px-0 py-2.5 text-[15px] outline-none transition-colors duration-300 focus:border-b-[#4f46e5]"
              placeholder="Your answer"
              pattern="\d{10}"
              minLength={10}
              maxLength={10}
              title="Please enter exactly 10 numeric digits"
              required
              suppressHydrationWarning
              autoComplete="off"
            />
          </div>

          {/* Email Address */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <label className="block text-[16px] font-semibold text-[#374151] mb-4">
              Email Address <span className="text-[#d93025]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-b-[#e5e7eb] px-0 py-2.5 text-[15px] outline-none transition-colors duration-300 focus:border-b-[#4f46e5]"
              placeholder="Your answer"
              pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
              title="Please enter a valid email address (e.g., name@example.com)"
              required
              suppressHydrationWarning
              autoComplete="off"
            />
          </div>

          {/* Select Books */}
          <div className="mb-5 rounded-[12px] bg-white p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <label className="block text-[16px] font-semibold text-[#374151] mb-4">
              Select Books <span className="text-[#d93025]">*</span>
            </label>

            {loading ? (
              <div className="text-[14px] text-[#5f6368]">Loading available books...</div>
            ) : (
              <div ref={dropdownRef} className="relative w-full">
                {/* Select2 Look-alike Input Trigger */}
                <div
                  onClick={() => setDropdownOpen(true)}
                  className="w-full min-h-[42px] bg-transparent border-b border-b-[#d9d9d9] pb-1.5 flex flex-wrap gap-1.5 items-center cursor-pointer"
                >
                  {selectedBooks.length === 0 ? (
                    <span className="text-[14px] text-[#757575] pl-1">Choose books</span>
                  ) : (
                    selectedBooks.map((sb) => (
                      <span
                        key={sb.book_name}
                        className="inline-flex items-center gap-1 bg-[#f1f3f4] text-[#202124] text-[13px] font-medium px-2 py-0.5 rounded-[4px] border border-[#dadce0]"
                      >
                        {sb.book_name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBook(sb.book_name);
                          }}
                          className="hover:text-[#d93025] font-bold text-[14px] px-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Options */}
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-[220px] overflow-y-auto bg-white border border-[#ccc] shadow-lg rounded-b-[4px]">
                    <div className="p-2 border-b border-[#eee]">
                      <input
                        type="text"
                        placeholder="Search books..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-2 py-1 text-[13px] border border-[#d9d9d9] outline-none rounded"
                        autoFocus
                      />
                    </div>
                    {filteredBooks.length === 0 ? (
                      <div className="p-3 text-[14px] text-gray-500">No books found</div>
                    ) : (
                      filteredBooks.map((book) => {
                        const isSelected = selectedBooks.some((sb) => sb.book_name === book.book_name);
                        return (
                          <div
                            key={book.id}
                            onClick={() => handleBookSelect(book.book_name)}
                            className={`p-2.5 text-[14px] hover:bg-[#f3f4f6] cursor-pointer transition-colors ${
                              isSelected ? "bg-[#e8ebfa] text-[#4f46e5] font-medium" : "text-[#202124]"
                            }`}
                          >
                            {book.book_name}
                            {book.description && (
                              <span className="block text-[12px] text-gray-500 font-normal">
                                {book.description}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Quantity Rows */}
            {selectedBooks.length > 0 && (
              <div className="mt-6 border-t border-[#f1f3f4] pt-4">
                {selectedBooks.map((sb) => (
                  <div
                    key={sb.book_name}
                    className="flex items-center justify-between py-2 border-b border-[#f1f3f4] last:border-b-0"
                  >
                    <div className="text-[14px] text-[#202124] pr-4">{sb.book_name}</div>
                    <div className="flex items-center gap-2.5 min-w-[150px] justify-end">
                      <label className="text-[14px] text-[#5f6368]">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={sb.quantity}
                        onChange={(e) => handleQuantityChange(sb.book_name, parseInt(e.target.value) || 1)}
                        className="w-20 rounded border border-[#e5e7eb] px-2 py-1 text-center text-[14px] focus:outline-none focus:border-[#4f46e5]"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="mt-3 mb-10 flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[6px] bg-[#4f46e5] hover:bg-[#4338ca] text-white px-7 py-3 font-semibold text-[15px] transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] disabled:opacity-50"
              suppressHydrationWarning
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <span className="text-[12px] text-gray-500">
              Never submit passwords through Google Forms.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

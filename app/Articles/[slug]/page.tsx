"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getArticleBySlug } from '@/lib/data/articles';
import NavigationPage from '@/components/Home/nav/page';
import { ArrowLeft, Download, FileText, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [isLoadingText, setIsLoadingText] = useState<boolean>(true);

  useEffect(() => {
    if (slug) {
      const found = getArticleBySlug(slug);
      if (found) {
        setArticle(found);
      } else {
        router.push('/Articles');
      }
    }
  }, [slug, router]);

  useEffect(() => {
    if (article?.pdfUrl) {
      setIsLoadingText(true);
      fetch(article.pdfUrl)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const pageSelectors = ['page_0', 'page_1', 'page_2', 'page1', 'page2', 'page3'];
          let textDivs: Element[] = [];
          
          pageSelectors.forEach(id => {
            const page = doc.getElementById(id);
            if (page) {
                textDivs.push(...Array.from(page.querySelectorAll('.pdf24_01, .pc1 .t')));
            }
          });
          
          if (textDivs.length > 0) {
              let pList: string[] = [];
              let currentParagraph: string[] = [];
              let lastTop: number | null = null;
              let lastBottom: number | null = null;

              textDivs.forEach(d => {
                  const text = d.textContent?.replace(/\s+/g, ' ').trim();
                  if (!text) return;

                  const style = d.getAttribute('style') || '';
                  const topMatch = style.match(/top:([\d.]+)em/);
                  const bottomMatch = style.match(/bottom:([\d.]+)em/);

                  let top = null;
                  let bottom = null;
                  if (topMatch) top = parseFloat(topMatch[1]);
                  if (bottomMatch) bottom = parseFloat(bottomMatch[1]);

                  if (lastTop !== null && top !== null) {
                      if (Math.abs(top - lastTop) > 2.0) {
                          pList.push(currentParagraph.join(' '));
                          currentParagraph = [];
                      }
                  } else if (lastBottom !== null && bottom !== null) {
                      if (Math.abs(bottom - lastBottom) > 2.0) {
                          pList.push(currentParagraph.join(' '));
                          currentParagraph = [];
                      }
                  }
                  
                  currentParagraph.push(text);
                  if (top !== null) lastTop = top;
                  if (bottom !== null) lastBottom = bottom;
              });

              if (currentParagraph.length > 0) {
                  pList.push(currentParagraph.join(' '));
              }

              // Clean up: join paragraphs if the next one starts with a lowercase letter
              let cleanedPList: string[] = [];
              for (let i = 0; i < pList.length; i++) {
                  let p = pList[i].trim();
                  if (!p) continue;
                  
                  if (cleanedPList.length > 0) {
                      const firstChar = p.charAt(0);
                      // If it starts with a lowercase letter, or if the previous paragraph ended with a colon/comma
                      const prevP = cleanedPList[cleanedPList.length - 1];
                      if ((firstChar === firstChar.toLowerCase() && firstChar !== firstChar.toUpperCase()) || 
                          prevP.endsWith(':') || 
                          prevP.endsWith(',')) {
                          cleanedPList[cleanedPList.length - 1] += ' ' + p;
                          continue;
                      }
                  }
                  cleanedPList.push(p);
              }

              // Filter out very short lines like page numbers, but keep things like 'ABSTRACT'
              cleanedPList = cleanedPList.filter(p => p.length > 5);
              
              // Try to find the start of the abstract
              let abstractIndex = cleanedPList.findIndex(p => {
                  const upper = p.toUpperCase().trim();
                  return upper === 'ABSTRACT' || upper.startsWith('ABSTRACT ') || upper.startsWith('ABSTRACT:') || upper.startsWith('ABSTRACT.');
              });
              
              if (abstractIndex !== -1) {
                  cleanedPList = cleanedPList.slice(abstractIndex);
                  
                  // If the "Abstract" heading is merged with the text, let's separate it for better styling
                  const firstP = cleanedPList[0];
                  if (firstP.toUpperCase().trim().startsWith('ABSTRACT') && firstP.length > 10) {
                      const match = firstP.match(/^(Abstract[\s:]+)(.*)/i);
                      if (match && match[2].trim().length > 0) {
                          cleanedPList[0] = match[1].trim();
                          cleanedPList.splice(1, 0, match[2].trim());
                      }
                  }
              }
              
              // Only take text up to the introduction
              let finalPreviewList: string[] = [];
              for (const p of cleanedPList) {
                  // If we hit introduction, we stop to maintain abstract-only preview
                  const upperP = p.toUpperCase().trim();
                  if ((upperP.includes('INTRODUCTION') && p.length < 50) || upperP.startsWith('1. INTRODUCTION') || upperP.startsWith('INTRODUCTION ')) {
                      break;
                  }
                  finalPreviewList.push(p);
              }

              // Fallback length limit just in case there's no introduction header
              if (finalPreviewList.length > 30) {
                  finalPreviewList = finalPreviewList.slice(0, 15); 
              }

              setParagraphs(finalPreviewList);
            } else {
              // Try body if no specific page classes found
              setParagraphs([doc.body?.textContent?.replace(/\s+/g, ' ').trim() || "Preview text not available."]);
            }
        })
        .catch(err => {
          console.error("Error fetching article text:", err);
          setParagraphs(["Failed to load article preview text."]);
        })
        .finally(() => {
          setIsLoadingText(false);
        });
    }
  }, [article]);

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalLength = paragraphs.join(' ').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <NavigationPage />

      <main className="max-w-4xl mx-auto px-4 pt-32">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-semibold text-sm"
        >
          <ArrowLeft size={16} /> Back to Articles
        </button>

        <header className="mb-10 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-orange-500 bg-orange-50 px-3 py-1 rounded-full mb-4 inline-block">
            {article.category} • {article.journal}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight max-w-3xl mx-auto">
            {article.title}
          </h1>
          <p className="text-slate-500 font-medium">By {article.author}</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col items-center">

          {/* First Page Text Preview */}
          <div className="w-full relative border-b border-slate-100 bg-white">
            <div className="px-8 py-10 md:px-12 md:py-16">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <FileText className="text-orange-500" size={24} />
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-widest">First Page Abstract Preview</h2>
              </div>

              {isLoadingText ? (
                <div className="animate-pulse flex flex-col gap-5">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div
                    className="text-slate-700 leading-relaxed text-justify flex flex-col gap-4 relative z-10 pb-6"
                  >
                    {paragraphs.map((p, i) => {
                      // Detect headers if short and no ending punctuation (like '1. INTRODUCTION') or 'Abstract'
                      const isHeader = (p.length < 80 && !/[.!?]$/.test(p) && p === p.toUpperCase()) || p.trim().toLowerCase() === 'abstract';

                      // Detect meta-data lines like Keywords or JEL
                      const isMeta = p.startsWith('Keywords:') || p.startsWith('JEL Classification');

                      return (
                        <p key={i} className={`
                                        ${isHeader ? 'font-bold text-slate-900 text-[1.1rem] mt-6 mb-2 tracking-wide' : 'text-slate-600'}
                                    `}>
                          {isMeta ? (
                            <>
                              <strong className="text-slate-900 font-semibold">{p.split(':')[0]}:</strong>
                              {p.split(':').slice(1).join(':')}
                            </>
                          ) : (
                            p
                          )}
                        </p>
                      );
                    })}
                  </div>
                  {totalLength > 800 && (
                    <div className="text-center mt-6 relative z-30 flex justify-center pb-8">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 px-6 py-2.5 rounded-full inline-flex items-center gap-2 cursor-default shadow-sm">
                          <BookOpen size={14} className="text-orange-500" />
                          End of Preview
                        </span>
                      </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Article Metadata Bar */}
          <div className="w-full px-8 py-5 flex flex-wrap gap-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal</span>
              <span className="text-sm font-semibold text-slate-700">{article.journal} ({article.subJournal})</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pages</span>
              <span className="text-sm font-semibold text-slate-700">{article.pages}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</span>
              <span className="text-sm font-semibold text-slate-700">{article.author}</span>
            </div>
          </div>

          {/* Call to Action Bar */}
          <div className="w-full px-8 py-8 flex items-center justify-between text-center flex-col md:flex-row gap-6 bg-white">
            <div className="text-left md:text-left text-center w-full md:w-auto flex-grow">
              <h3 className="font-bold text-slate-900 text-xl">Download Full Manuscript</h3>
              <p className="text-slate-500 text-sm mt-1">{article.pages} • Full Article PDF</p>
            </div>
            <a
              href={article.downloadUrl}
              download={`${article.title.substring(0, 30)}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 hover:-translate-y-1"
            >
              <Download size={20} /> Download Article
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}

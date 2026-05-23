import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";

export default function PeerReviewPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <header className="border-b border-gray-200 pb-8 mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            PEER REVIEW POLICY
          </h2>
        </header>

        <div className="space-y-12">
          {/* 1. Overview */}
          <section>
            <h3 className="text-2xl font-bold mb-4">1. Overview of Peer Review System</h3>
            <p className="mb-4">
              GJPIR adopts a rigorous double-blind peer review system to uphold the highest standards of academic integrity, transparency, and scholarly excellence.
            </p>
            <p className="font-semibold mb-2">Under this system:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>The identity of authors is concealed from reviewers</li>
              <li>The identity of reviewers is concealed from authors</li>
              <li>Editorial decisions are made based solely on academic merit and quality</li>
            </ul>
            <p>
              This approach minimizes bias and ensures an impartial evaluation process. All manuscripts submitted to the journal undergo a multi-stage evaluation process before acceptance for publication.
            </p>
          </section>

          {/* 2. Initial Assessment */}
          <section className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <h3 className="text-2xl font-bold mb-4">2. Initial Editorial Assessment (Desk Review)</h3>
            <p className="mb-4">
              Upon submission, each manuscript is subjected to an initial screening conducted by the editorial office or handling editor.
            </p>
            <p className="font-semibold mb-2">The purpose of this stage is to evaluate:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 text-gray-700">
              <li>Relevance to the aims and scope of the journal</li>
              <li>Compliance with author guidelines and formatting requirements</li>
              <li>Basic academic quality and clarity of presentation</li>
              <li>Originality of the manuscript, including plagiarism screening</li>
              <li>Ethical compliance (e.g., approvals, declarations if applicable)</li>
            </ul>
            <p className="font-semibold mb-2">Possible Outcomes at this Stage:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proceed to peer review</li>
              <li>Request for technical corrections</li>
              <li>Desk rejection (if unsuitable or below minimum standards)</li>
            </ul>
            <p className="mt-4 text-sm italic">
              This step ensures that only academically sound and relevant manuscripts proceed to external review.
            </p>
          </section>

          {/* 3 & 4. Reviewers & Process */}
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-700">3. Assignment to Reviewers</h3>
              <p className="text-sm leading-relaxed mb-3">
                Manuscripts that pass the initial screening are assigned to at least two independent expert reviewers.
              </p>
              <p className="font-semibold text-sm mb-1">Reviewer Selection Criteria:</p>
              <ul className="text-sm list-disc pl-5 space-y-1 text-gray-600">
                <li>Subject-matter expertise</li>
                <li>Academic and research experience</li>
                <li>No conflict of interest with the authors</li>
                <li>Prior reviewing or publication experience (preferred)</li>
              </ul> 
              <p className="font-semibold text-sm mb-1">Reviewers may be selected from:</p>
              <ul className="text-sm list-disc pl-5 space-y-1 text-gray-600">
               <li>Academic institutions</li>
               <li>Research organizations</li>
               <li>Industry experts (where relevant)</li>
              </ul>
            </section>
            <section>
              <h3 className="text-xl font-bold mb-3 text-blue-700">4. Double-Blind Review Process</h3>
              <p className="text-sm leading-relaxed mb-3">
                The journal strictly follows a double-blind review mechanism, ensuring authors do not know reviewer identities and reviewers do not know author identities.
              </p>
              <p className="text-sm text-gray-600">
                All identifying information is removed from the manuscript prior to review.
              </p>
            </section>
          </div>

          {/* 5. Evaluation Criteria */}
          <section>
            <h3 className="text-2xl font-bold mb-6">5. Evaluation Criteria</h3>
            <div className="grid sm:grid-cols-2 gap-6">
            <p className="font-semibold text-sm mb-1">Reviewers are requested to assess manuscripts based on the following criteria:</p>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">5.1 Originality and Contribution</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Novelty of the research</li>
                  <li>Contribution to existing literature</li>
                  <li>Relevance to current academic or industry developments</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">5.2 Methodological Rigor</h4>
                 <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Appropriateness of research design</li>
                  <li>Validity and reliability of methods</li>
                  <li>Data analysis and interpretation</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">5.3 Clarity and Structure</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Logical organization of content</li>
                  <li>Clarity of language and presentation</li>
                  <li>Coherence between sections</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">5.4 Relevance and Impact</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Alignment with journal scope</li>
                  <li>Practical or theoretical significance</li>
                  <li>Potential for future research or application</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-bold">5.5 Ethical Compliance</h4>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Proper citation and referencing</li>
                  <li>Absence of plagiarism</li>
                  <li>Ethical conduct of research</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6, 7 & 8. Recommendations & Decision */}
          <section className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-3">6. Reviewer Recommendations</h3>
              <p className="mb-4 italic text-gray-700">After evaluation, reviewers provide detailed comments and one of the following recommendations:</p>
              <p className="mb-2 italic text-gray-700">Options include: Accept without revision, Accept with minor revisions, Major revisions required, or Reject.</p>
              <p>Reviewers are encouraged to provide constructive, specific, and actionable feedback.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">7. Editorial Decision-Making</h3>
              <p>The final decision is made by the Editor-in-Chief or assigned editor, based on:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Reviewer comments and recommendations</li>
                <li>Quality and validity of the manuscript</li>
                <li>Journal standards and priorities</li>
              </ul>
              <p>In case of conflicting reviews:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>A third reviewer may be assigned</li>
                <li>Editorial judgment will be applied</li>
              </ul>
              <p>The editorial decision is final and binding.</p>
              <p>The final decision is made by the Editor-in-Chief based on reviews and journal standards. The editorial decision is final and binding.</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">8. Revision Process</h3>
            
 <p className="mb-4 italic text-gray-700" >If revisions are requested:</p>

    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
      <li>Authors must submit a revised manuscript along with a response to reviewer comments</li>
      <li>Each comment must be addressed clearly</li>
      <li>Revised manuscripts may be sent for re-review</li>
    </ul>
    <p>Failure to submit revisions within the specified time may result in withdrawal of the manuscript.</p>

            </div>
          </section>

          {/* 9. Timeline Table */}
          <section>
            <h3 className="text-2xl font-bold mb-4">9. Review Timeline</h3>
            <p className="text-sm text-gray-600 italic">GJPIR strives to maintain an efficient and timely review process:</p>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr><td className="px-6 py-3 font-medium">Initial screening</td><td className="px-6 py-3">3–5 working days</td></tr>
                  <tr><td className="px-6 py-3 font-medium">Reviewer assignment</td><td className="px-6 py-3">2–3 days</td></tr>
                  <tr><td className="px-6 py-3 font-medium">Peer review process</td><td className="px-6 py-3">2–4 weeks</td></tr>
                  <tr><td className="px-6 py-3 font-medium">Final decision</td><td className="px-6 py-3">Within 30 days (average)</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm italic text-gray-600">Delays may occur in exceptional cases, but efforts are made to minimize them.</p>  
          </section>

          {/* 10 - 14. Professional Standards */}
        {/* 10. Confidentiality and Anonymity */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-3">10. Confidentiality and Anonymity</h3>
            <p>The journal maintains strict confidentiality throughout the review process:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Manuscripts are treated as confidential documents</li>
              <li>Reviewers must not share, discuss, or use manuscript content</li>
              <li>Reviewer identities are not disclosed to authors</li>
            </ul>
            <p className="mt-3">Any breach of confidentiality will be considered a serious ethical violation.</p>
          </section>

          {/* 11. Conflict of Interest */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-3">11. Conflict of Interest</h3>
            <p>All participants in the review process must disclose any potential conflicts of interest. Reviewers must decline review if:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>They have a personal or professional relationship with the authors</li>
              <li>They have competing research interests</li>
              <li>Any bias may affect objective judgment</li>
            </ul>
            <p className="mt-3">Editors will ensure that conflicts are managed appropriately.</p>
          </section>

          {/* 12. Ethical Oversight During Review */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-3">12. Ethical Oversight During Review</h3>
            <p>If ethical concerns arise during review (e.g., plagiarism, data fabrication, duplicate submission):</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>The manuscript may be suspended or rejected</li>
              <li>Authors may be asked for clarification</li>
              <li>Further action may be taken as per journal policies</li>
            </ul>
          </section>

          {/* 13. Reviewer Conduct and Responsibilities */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-3">13. Reviewer Conduct and Responsibilities</h3>
            <p>Reviewers are expected to:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Provide objective, unbiased, and constructive feedback</li>
              <li>Complete reviews within the assigned timeline</li>
              <li>Maintain professionalism in comments</li>
              <li>Avoid personal criticism</li>
            </ul>
            <p className="mt-3">The journal values reviewers’ contributions as essential to maintaining publication quality.</p>
          </section>

          {/* 14. Transparency and Accountability */}
          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-3">14. Transparency and Accountability</h3>
            <p>GJPIR is committed to:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Maintaining a transparent review process</li>
              <li>Ensuring accountability at all stages</li>
              <li>Continuously improving editorial and review standards</li>
            </ul>
          </section>
          {/* Final Note */}
          <footer className="bg-blue-50 p-6 rounded-lg text-center border border-blue-100">
            <p className="text-blue-900 font-medium italic">
              *Note: This peer review system ensures that all published articles meet high academic, ethical, and quality standards, contributing to the advancement of knowledge across disciplines.*
            </p>
          </footer>
          
        </div>
      </main>
       <FooterSection />
    </div>
  );
}
import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { Footer } from "react-day-picker";

export default function CopyrightLicensingPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <header className="border-b border-gray-200 pb-8 mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
            COPYRIGHT & LICENSING POLICY
          </h2>
        </header>

        <div className="space-y-10">
          {/* 1. Copyright Ownership */}
          <section>
            <h3 className="text-2xl font-bold mb-3">1. Copyright Ownership</h3>
            <p className="mb-3">Authors retain the copyright of their work.</p>
            <p className="mb-2">By submitting and publishing in GJPIR, authors grant the journal a non-exclusive license to:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Publish</li>
              <li>Distribute</li>
              <li>Archive</li>
            </ul>
          </section>

          {/* 2. Licensing Terms */}
          <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-2xl font-bold mb-3">2. Licensing Terms</h3>
            <p className="mb-3">All articles are published under:</p>
            <p className="font-bold text-blue-700 mb-3">Creative Commons Attribution 4.0 International License (CC BY 4.0)</p>
            <p className="mb-2">This license enables:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Free access to all published content</li>
              <li>Sharing and redistribution in any medium</li>
              <li>Adaptation, modification, and commercial use</li>
            </ul>
          </section>

          {/* 3. Conditions of Use */}
          <section>
            <h3 className="text-2xl font-bold mb-3">3. Conditions of Use</h3>
            <p className="mb-2">Users must:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Provide appropriate credit to the author(s)</li>
              <li>Cite the journal as the original source</li>
              <li>Include a link to the license</li>
              <li>Indicate if any changes were made</li>
            </ul>
          </section>

          {/* 4. Author Rights */}
          <section>
            <h3 className="text-2xl font-bold mb-3">4. Author Rights</h3>
            <p className="mb-2">Authors are permitted to:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>Share their articles on personal or institutional websites</li>
              <li>Deposit in repositories</li>
              <li>Use for teaching, research, and professional purposes</li>
            </ul>
          </section>

          {/* 5. Open Access Policy */}
          <section className="border-l-4 border-blue-600 pl-6 py-2">
            <h3 className="text-2xl font-bold mb-3">5. Open Access Policy</h3>
            <p className="mb-2 text-slate-800 font-semibold text-lg">GJPIR is a fully open-access journal, meaning:</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>All content is freely accessible</li>
              <li>No subscription fees are charged to readers</li>
            </ul>
          </section>

          {/* 6. Licensing Statement */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="text-xl font-bold mb-3 text-blue-900">6. Licensing Statement (Mandatory Display)</h3>
            <p className="text-blue-800 leading-relaxed italic">
              © Author(s). This article is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0), permitting unrestricted use, distribution, and reproduction in any medium, provided proper credit is given.
            </p>
          </section>

          {/* 7 & 8 Bottom Grid */}
          <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
            <section>
              <h3 className="text-xl font-bold mb-3">7. Third-Party Content</h3>
              <p className="text-sm text-gray-600 mb-2">Authors must ensure that:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Any third-party material used has proper permissions</li>
                <li>Copyright compliance is maintained</li>
              </ul>
            </section>
            <section>
              <h3 className="text-xl font-bold mb-3">8. Archiving and Preservation</h3>
              <p className="text-sm text-gray-600 mb-2">The journal ensures long-term digital preservation of published content through:</p>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>Website archiving</li>
                <li>Repository storage mechanisms</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

    <FooterSection />
    </div>
  );
}
import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-highlight">Legal Notice</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">According to § 5 TMG:</h2>
              <p className="leading-relaxed">
                <strong>Tim Kramny</strong><br/>
                Hohenbrunner Straße 67<br/>
                85521 Riemerling<br/>
                Germany
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Contact:</h2>
              <p className="leading-relaxed">
                E-Mail: <a href="mailto:[YOUR_EMAIL]" className="text-highlight hover:underline">tim@ximus.io</a><br/>
                Telefon: +49 173 949 3652
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">VAT-ID:</h2>
              <p className="leading-relaxed">
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br/>
                DE362721671
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Responsible for the content according to § 55 Abs. 2 RStV:</h2>
              <p className="leading-relaxed">
                Tim Kramny<br/>
                Hohenbrunner Straße 67<br/>
                85521 Riemerling<br/>
                Germany
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">EU Online Dispute Resolution</h2>
              <p className="leading-relaxed">
                The European Commission provides a platform for online dispute resolution (OS):<br/>
                <a 
                  href="https://ec.europa.eu/consumers/odr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-highlight hover:underline break-all"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="leading-relaxed mt-4">
                Our email address can be found above in the legal notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-white">Consumer Dispute Resolution/Universal Mediation Service:</h2>
              <p className="leading-relaxed">
                We are not willing or obliged to participate in dispute resolution proceedings before a consumer mediation service.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <Link 
                href="/" 
                className="inline-flex items-center text-highlight hover:underline"
              >
                ← Back to the start page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
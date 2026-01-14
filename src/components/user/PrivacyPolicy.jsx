import React from "react";

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#FAF7F2] text-[#1F1B16]">
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#8E1B1B]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[#6F675E]">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-10 space-y-8 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-2 text-[#6F675E]">
              Bihari Flavours (“we”, “our”, “us”) respects your privacy. This
              policy explains what information we collect, how we use it, and
              the choices you have when using our website.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Information We Collect</h2>
            <ul className="mt-2 list-disc pl-5 text-[#6F675E] space-y-2">
              <li>
                Contact details (such as name, phone number, email) when you
                create an account, place an order, or contact support.
              </li>
              <li>
                Order and transaction details (products purchased, delivery
                address, payment confirmation status).
              </li>
              <li>
                Basic device and usage data (browser type, pages visited) for
                analytics and security.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">How We Use Your Information</h2>
            <ul className="mt-2 list-disc pl-5 text-[#6F675E] space-y-2">
              <li>To process orders and deliver products.</li>
              <li>To provide customer support and respond to queries.</li>
              <li>To improve website performance and user experience.</li>
              <li>To prevent fraud and maintain security.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Sharing of Information</h2>
            <p className="mt-2 text-[#6F675E]">
              We do not sell your personal information. We may share limited
              information with service providers (e.g., delivery partners or
              payment providers) only as required to complete your order and
              operate the service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Data Security</h2>
            <p className="mt-2 text-[#6F675E]">
              We use reasonable safeguards to protect your data. However, no
              method of transmission over the internet is completely secure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Your Choices</h2>
            <p className="mt-2 text-[#6F675E]">
              You can request updates or deletion of your account information by
              contacting us at{" "}
              <a
                className="text-[#8E1B1B] hover:underline"
                href="mailto:support@bihariflavours.in"
              >
                support@bihariflavours.in
              </a>
              .
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(142,27,27,0.2)] bg-white/60 p-5">
            <h2 className="text-lg font-semibold">Contact</h2>
            <p className="mt-2 text-[#6F675E]">
              Email:{" "}
              <a
                className="text-[#8E1B1B] hover:underline"
                href="mailto:support@bihariflavours.in"
              >
                support@bihariflavours.in
              </a>
              <br />
              Phone:{" "}
              <a className="text-[#8E1B1B] hover:underline" href="tel:+9185211754329">
                +91 85211 754329
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

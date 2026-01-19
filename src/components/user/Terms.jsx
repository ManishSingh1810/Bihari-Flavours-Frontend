import React from "react";

export default function Terms() {
  return (
    <main className="bg-[#F8FAFC] text-[#1F1B16]">
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[#8E1B1B]">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm text-[#6F675E]">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="mt-10 space-y-8 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold">Agreement</h2>
            <p className="mt-2 text-[#6F675E]">
              By accessing or using the Bihari Flavours website, you agree to
              these Terms & Conditions. If you do not agree, please do not use
              the website.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Orders & Payments</h2>
            <ul className="mt-2 list-disc pl-5 text-[#6F675E] space-y-2">
              <li>Prices and availability may change without notice.</li>
              <li>
                Orders are confirmed only after successful payment/confirmation.
              </li>
              <li>
                We may refuse or cancel an order in case of suspected fraud or
                incorrect information.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Delivery</h2>
            <p className="mt-2 text-[#6F675E]">
              Delivery timelines are estimates and may vary due to location,
              weather, or operational constraints. Please ensure delivery details
              are correct.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Returns & Refunds</h2>
            <p className="mt-2 text-[#6F675E]">
              Due to the nature of food products, returns may be limited. If you
              receive a damaged or incorrect item, contact support within 24
              hours of delivery with photos and order details.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">User Responsibilities</h2>
            <ul className="mt-2 list-disc pl-5 text-[#6F675E] space-y-2">
              <li>
                You agree not to misuse the website, attempt unauthorized access,
                or disrupt services.
              </li>
              <li>
                You are responsible for keeping your account credentials secure.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Limitation of Liability</h2>
            <p className="mt-2 text-[#6F675E]">
              To the maximum extent permitted by law, Bihari Flavours will not
              be liable for indirect or consequential losses arising from your
              use of the website or products.
            </p>
          </div>

          <div className="rounded-xl border border-[rgba(142,27,27,0.2)] bg-white/60 p-5">
            <h2 className="text-lg font-semibold">Support</h2>
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
              <br />
              Hours: Monday – Friday, 9:00 AM to 6:00 PM
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

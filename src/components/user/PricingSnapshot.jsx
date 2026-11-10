import { formatINR } from "../../utils/storeSettings";

export default function PricingSnapshot({ pricing }) {
  if (!pricing) return null;

  const rows = [
    ["Subtotal", pricing.subtotal, false],
    ["Coupon discount", pricing.couponDiscount, true],
    ["Delivery", pricing.deliveryCharge, false],
    ["COD fee", pricing.codHandlingFee, false],
  ].filter(([, amount]) => Number(amount) > 0);

  if (!rows.length) return null;

  return (
    <div className="mt-3 space-y-1 border-t border-black/5 pt-3 text-sm font-normal text-[#6F675E]">
      {rows.map(([label, amount, negative]) => (
        <div key={label} className="flex justify-between">
          <span>{label}</span>
          <span className="tabular-nums">
            {negative ? "-" : ""}
            {formatINR(amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PriceSectionProps {
  price: number;
  discountPercent: number;
  formatPrice: (price: number) => string;
}

const PriceSection = ({
  price,
  discountPercent,
  formatPrice,
}: PriceSectionProps) => {
  const priceValue = Number(price) || 0;
  const discount = Number(discountPercent) || 0;
  const finalPrice =
    discount > 0 ? priceValue * (1 - discount / 100) : priceValue;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-primary">
          Đơn giá
        </p>
        {discount > 0 && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-black text-secondary-foreground shadow-sm">
            Tiết kiệm {discount}%
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <div className="text-3xl font-black text-primary sm:text-4xl">
          {formatPrice(finalPrice)}
        </div>
        {discount > 0 && (
          <span className="text-sm font-semibold text-muted-foreground line-through">
            {formatPrice(priceValue)}
          </span>
        )}
      </div>
    </div>
  );
};

export default PriceSection;


import { FoodPreview } from "@/interface/index";
import FoodCard from "../food-card";

interface FoodGridProps {
  foods: FoodPreview[];
  formatPrice: (price: number) => string;
  name: string;
}

export default function FoodGrid({
  foods,
  formatPrice,
  name,
}: FoodGridProps) {
  return (
    <section className="py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="type-metadata font-bold text-primary">
            Tất cả lựa chọn
          </p>
          <h2 className="type-section-title mt-2">{name}</h2>
        </div>
      </div>

      {foods.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-base text-muted-foreground">
            Chưa tìm thấy món ăn phù hợp.
          </p>
        </div>
      )}
    </section>
  );
}

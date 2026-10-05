interface FoodDescriptionProps {
  description: string;
}

const FoodDescription = ({ description }: FoodDescriptionProps) => {
  return (
    <div className="rounded-lg border border-border bg-card/70 p-5 shadow-sm">
      <h2 className="text-lg font-black text-foreground">
        Mô tả món ăn
      </h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  );
};

export default FoodDescription;

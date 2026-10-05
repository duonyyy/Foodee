import { EmptyState } from '@/components/ui/feedback-state';
import { useRouter } from 'next/navigation';

export const EmptyCart = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] items-center justify-center py-10">
      <EmptyState
        title="Giỏ hàng của bạn đang trống"
        description="Không tìm thấy món ăn nào để thanh toán. Hãy chọn các món ngon bạn yêu thích và quay lại nhé!"
        actionLabel="Khám phá món ăn ngay"
        onAction={() => router.push('/search')}
        className="max-w-lg bg-card shadow-md"
      />
    </div>
  );
};
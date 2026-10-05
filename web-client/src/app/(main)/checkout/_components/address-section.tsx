import { Button } from "@/components/ui/button";
import { Address } from "@/interface";
import { AlertCircle, Check, Plus } from "lucide-react";
import Link from "next/link";

interface AddressSectionProps {
  userAddresses: Address[];
  selectedUserAddressId: string | null;
  onSetDefaultAddress: (addressId: string) => void;
}

export const AddressSection = ({
  userAddresses,
  selectedUserAddressId,
  onSetDefaultAddress,
}: AddressSectionProps) => {
  return (
    <div className="space-y-3">
      {userAddresses.length === 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-bold text-foreground">Bạn chưa lưu địa chỉ giao hàng nào</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Thêm địa chỉ vào sổ địa chỉ để đặt món nhanh hơn trong các lần sau.
            </p>
          </div>
          <Link href="/profile">
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl font-bold">
              <Plus className="h-4 w-4" /> Thêm địa chỉ
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {userAddresses.map((addr) => {
            const isSelected = selectedUserAddressId === addr.id;
            const fullAddress = [addr.street, addr.ward, addr.district, addr.city]
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={addr.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (addr.id) onSetDefaultAddress(addr.id);
                  }
                }}
                onClick={() => {
                  if (addr.id) onSetDefaultAddress(addr.id);
                }}
                className={`relative flex min-h-[64px] cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 transition ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                    : "border-border bg-card/60 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-foreground">
                        {addr.label || `Địa chỉ #${addr.id?.substring(0, 5)}`}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-md bg-secondary/15 px-2 py-0.5 text-[10px] font-black text-secondary">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {fullAddress || "Chưa có chi tiết"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`h-8 rounded-lg px-3 text-xs font-bold ${
                      isSelected ? "bg-primary text-primary-foreground pointer-events-none" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (addr.id) onSetDefaultAddress(addr.id);
                    }}
                  >
                    {isSelected ? "Đang chọn" : "Chọn"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!selectedUserAddressId && userAddresses.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-bold text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Vui lòng chọn 1 địa chỉ giao hàng ở trên để hệ thống tính phí chính xác.</span>
        </div>
      )}
    </div>
  );
};
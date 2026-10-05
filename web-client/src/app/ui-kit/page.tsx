"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Leaf,
  MoreHorizontal,
  Salad,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/feedback-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const swatches = [
  { name: "Primary", className: "bg-primary", value: "Lá rừng" },
  { name: "Secondary", className: "bg-secondary", value: "Cam quýt" },
  { name: "Tertiary", className: "bg-tertiary", value: "Xanh ngọc" },
  { name: "Surface", className: "bg-surface", value: "Kem ấm" },
  { name: "Success", className: "bg-success", value: "Thành công" },
  {
    name: "Destructive",
    className: "bg-destructive",
    value: "Cảnh báo",
  },
];

export default function UIKitPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Chuyển tới nội dung chính
      </a>

      <main id="main-content" className="overflow-hidden">
        <section className="relative border-b border-border/70 px-page py-16 sm:py-24">
          <div
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
                  <UtensilsCrossed
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
                <span className="type-metadata">
                  Foodee Kitchen System · 01
                </span>
              </div>

              <h1 className="type-display max-w-4xl">
                Tươi trong sắc vị.
                <span className="block text-primary">
                  Rõ trong từng thao tác.
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
                Nền tảng giao diện Foodee kết hợp cảm giác của một khu
                chợ thực phẩm hiện đại với tính chính xác của một sản
                phẩm số dễ tiếp cận.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="lg">
                  Khám phá hệ thống
                  <ArrowRight aria-hidden="true" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline">
                      Mở hộp thoại
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Thêm địa chỉ giao hàng
                      </DialogTitle>
                      <DialogDescription>
                        Thông tin rõ ràng, vùng chạm thoải mái và
                        focus được giữ an toàn bên trong hộp thoại.
                      </DialogDescription>
                    </DialogHeader>
                    <FormField
                      label="Tên địa chỉ"
                      description="Ví dụ: Nhà riêng hoặc Văn phòng."
                      required
                    >
                      <Input placeholder="Nhập tên gợi nhớ" />
                    </FormField>
                    <DialogFooter>
                      <Button variant="outline">Để sau</Button>
                      <Button>Lưu địa chỉ</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card variant="highlighted" className="overflow-hidden">
              <CardHeader>
                <div className="mb-5 flex items-center justify-between">
                  <Badge variant="success">
                    <Check aria-hidden="true" />
                    Đang hoạt động
                  </Badge>
                  <Leaf className="text-primary" aria-hidden="true" />
                </div>
                <CardTitle>Một ngôn ngữ, mọi hành trình</CardTitle>
                <CardDescription>
                  Token và primitive dùng chung cho khách hàng, chủ
                  quán và quản trị viên.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {["44px", "AA", "5 states"].map((value) => (
                  <div
                    key={value}
                    className="rounded-xl border border-primary/15 bg-card/80 p-3 text-center"
                  >
                    <strong className="block text-lg text-primary">
                      {value}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      Chuẩn UI
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-section px-page py-section">
          <section aria-labelledby="color-heading">
            <div className="mb-8 max-w-2xl">
              <p className="type-metadata">01 · Color language</p>
              <h2
                id="color-heading"
                className="type-section-title mt-2"
              >
                Màu sắc lấy cảm hứng từ nguyên liệu tươi
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {swatches.map((swatch) => (
                <Card key={swatch.name} className="overflow-hidden">
                  <div className={`h-24 ${swatch.className}`} />
                  <CardContent className="flex items-center justify-between pt-5 sm:pt-6">
                    <div>
                      <p className="font-bold">{swatch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {swatch.value}
                      </p>
                    </div>
                    <span className="h-3 w-3 rounded-full bg-foreground/15" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="type-heading"
            className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]"
          >
            <div>
              <p className="type-metadata">02 · Typography</p>
              <h2
                id="type-heading"
                className="type-section-title mt-2"
              >
                Editorial nhưng vẫn gần gũi
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Serif dành cho khoảnh khắc thương hiệu; sans-serif
                dành cho dữ liệu và thao tác cần đọc nhanh.
              </p>
            </div>
            <Card variant="elevated">
              <CardContent className="space-y-8 pt-5 sm:pt-6">
                <p className="type-page-title">
                  Bữa ngon đang chờ bạn.
                </p>
                <p className="type-section-title">
                  Món nổi bật hôm nay
                </p>
                <p className="type-body max-w-2xl">
                  Khám phá món ăn được chuẩn bị từ nguyên liệu tươi,
                  giao đến bạn trong thời gian ngắn nhất.
                </p>
                <p className="type-metadata">Giao trong 25–35 phút</p>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="component-heading">
            <div className="mb-8">
              <p className="type-metadata">03 · Components</p>
              <h2
                id="component-heading"
                className="type-section-title mt-2"
              >
                Trạng thái rõ ràng, phản hồi tự nhiên
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Buttons & status</CardTitle>
                  <CardDescription>
                    Mọi hành động chính đều có tap target tối thiểu
                    44px.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button>Đặt món ngay</Button>
                  <Button variant="secondary">Xem ưu đãi</Button>
                  <Button variant="outline">Chi tiết</Button>
                  <Button variant="ghost">Bỏ qua</Button>
                  <Button variant="destructive">Xóa món</Button>
                  <Button loading>Đang lưu</Button>
                  <Button disabled>Không khả dụng</Button>
                </CardContent>
                <CardFooter className="flex-wrap gap-2">
                  <Badge variant="success">Đã xác nhận</Badge>
                  <Badge variant="warning">Đang chuẩn bị</Badge>
                  <Badge variant="info">Đang giao</Badge>
                  <Badge variant="destructive">Đã hủy</Badge>
                </CardFooter>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Form pattern</CardTitle>
                  <CardDescription>
                    Label, mô tả và lỗi luôn liên kết với đúng
                    control.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField
                    label="Tên người nhận"
                    description="Tên này sẽ hiển thị cho tài xế giao hàng."
                    required
                  >
                    <Input placeholder="Nguyễn Văn An" />
                  </FormField>
                  <Select>
                    <FormField
                      label="Khu vực giao hàng"
                      description="Chọn khu vực gần bạn nhất."
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                    </FormField>
                    <SelectContent>
                      <SelectItem value="district-1">
                        Quận 1
                      </SelectItem>
                      <SelectItem value="district-3">
                        Quận 3
                      </SelectItem>
                      <SelectItem value="thu-duc">
                        Thành phố Thủ Đức
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormField
                    label="Ghi chú"
                    error="Ghi chú không được chứa số điện thoại."
                  >
                    <Textarea
                      defaultValue="Gọi mình theo số 090..."
                      placeholder="Ví dụ: Giao tại lễ tân"
                    />
                  </FormField>
                </CardContent>
              </Card>

              <Card variant="interactive" className="group">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Salad aria-hidden="true" />
                    </span>
                    <Badge variant="outline">Phù hợp ăn chay</Badge>
                  </div>
                  <CardTitle>Salad bơ hạt rang</CardTitle>
                  <CardDescription>
                    Một ví dụ cho Card interactive với chiều sâu,
                    focus và chuyển động vừa đủ.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between">
                  <div>
                    <p className="font-bold text-primary">89.000đ</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      20–25 phút
                    </p>
                  </div>
                  <Button
                    size="icon"
                    aria-label="Thêm salad bơ vào giỏ"
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </CardFooter>
              </Card>

              <Card variant="highlighted">
                <CardHeader>
                  <CardTitle>Overlay primitives</CardTitle>
                  <CardDescription>
                    Dialog, drawer và menu tự quản lý focus, Escape và
                    click ngoài.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline">Mở drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Giỏ hàng của bạn</DrawerTitle>
                        <DrawerDescription>
                          2 món từ Bếp xanh Foodee.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="overflow-y-auto px-5 pb-6 sm:px-6">
                        <Card>
                          <CardContent className="flex items-center gap-4 pt-5 sm:pt-6">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
                              <Salad aria-hidden="true" />
                            </span>
                            <div className="flex-1">
                              <p className="font-bold">
                                Salad bơ hạt rang
                              </p>
                              <p className="text-sm text-muted-foreground">
                                1 phần · 89.000đ
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <DrawerFooter>
                        <Button>Tiếp tục thanh toán</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Đóng</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Tùy chọn
                        <ChevronDown aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>
                        Thao tác nhanh
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Sparkles aria-hidden="true" />
                        Xem gợi ý
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MoreHorizontal aria-hidden="true" />
                        Thêm tùy chọn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </div>
          </section>

          <section aria-labelledby="feedback-heading">
            <div className="mb-8">
              <p className="type-metadata">04 · Feedback</p>
              <h2
                id="feedback-heading"
                className="type-section-title mt-2"
              >
                Luôn cho người dùng biết chuyện gì đang xảy ra
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              <Card>
                <CardContent className="space-y-4 pt-5 sm:pt-6">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
              <EmptyState
                title="Chưa có món yêu thích"
                description="Lưu món bạn thích để quay lại nhanh hơn vào lần sau."
              />
              <ErrorState
                title="Chưa tải được thực đơn"
                description="Kết nối đang gián đoạn. Dữ liệu của bạn vẫn được giữ an toàn."
              />
            </div>
          </section>

          <section className="dark overflow-hidden rounded-2xl border border-white/10 bg-background p-6 text-foreground shadow-floating sm:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="type-metadata">Dark mode parity</p>
                <h2 className="type-section-title mt-2">
                  Tương phản được giữ nguyên khi ánh sáng thay đổi.
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                  Toàn bộ semantic token có cặp màu dành cho nền tối,
                  không dùng màu sắc làm tín hiệu duy nhất.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Accent</Button>
                <Badge variant="success">Hoạt động</Badge>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

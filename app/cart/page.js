import CartView from "@/components/CartView";

export const metadata = { title: "My Cart – Rose Glow" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-5 font-display text-3xl font-bold text-pink-700">My Cart</h1>
      <CartView />
    </div>
  );
}

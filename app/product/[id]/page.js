"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { api } from "@/lib/api";
import {
  itemKey,
  makeItem,
  useStore,
} from "@/lib/store";
import {
  BTN,
  BTN_O,
  placeholder,
  tk,
} from "@/lib/config";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const {
    cart,
    ready,
    addToCart,
    setQty,
    removeItem,
  } = useStore();

  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [variant, setVariant] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    setP(null);
    setErr("");
    setReviews([]);
    setVariant("");

    api(`/api/products/${id}`)
      .then((product) => {
        if (cancelled) return;

        setP(product);
        setVariant(product.variants?.[0] || "");
      })
      .catch((error) => {
        if (!cancelled) setErr(error.message);
      });

    api(`/api/products/${id}/reviews`)
      .then((data) => {
        if (!cancelled) setReviews(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (err) {
    return (
      <p className="py-20 text-center text-gray-500">
        {err}
      </p>
    );
  }

  if (!p) {
    return (
      <p className="py-20 text-center text-gray-500">
        Loading...
      </p>
    );
  }

  // Read the selected variant's quantity directly from the shared cart.
  const key = itemKey(makeItem(p, variant));
  const cartItem = cart.find((item) => itemKey(item) === key);
  const quantity = cartItem?.qty || 0;

  const stock = Math.max(0, Number(p.stock) || 0);
  const out = stock === 0;
  const atLimit = quantity >= stock;

  const off =
    p.comparePrice > p.price
      ? Math.round(100 - (p.price / p.comparePrice) * 100)
      : 0;

  const avg = reviews.length
    ? (
        reviews.reduce(
          (total, review) => total + Number(review.rating),
          0,
        ) / reviews.length
      ).toFixed(1)
    : null;

  function increaseQuantity() {
    if (!ready || out || atLimit) return;

    addToCart(p, variant, 1);
  }

  function decreaseQuantity() {
    if (!ready || quantity === 0) return;

    if (quantity === 1) {
      removeItem(key);
    } else {
      setQty(key, quantity - 1);
    }
  }

  function buyNow() {
    if (!ready || out) return;

    const buyQuantity = Math.min(
      Math.max(1, quantity),
      stock,
    );

    sessionStorage.setItem(
      "buynow",
      JSON.stringify([
        makeItem(p, variant, buyQuantity),
      ]),
    );

    router.push("/checkout?mode=buy");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <img
          src={p.image || placeholder}
          alt={p.name}
          className="w-full rounded-3xl border border-pink-100 bg-pink-50 object-cover"
        />

        <div>
          <p className="text-sm text-pink-500">
            {p.category}
            {p.brand && ` · ${p.brand}`}
          </p>

          <h1 className="mt-1 font-display text-3xl font-bold">
            {p.name}
          </h1>

          {avg && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <Star
                size={16}
                className="fill-pink-400 text-pink-400"
              />
              {avg} ({reviews.length} reviews)
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-pink-600">
              {tk(p.price)}
            </span>

            {off > 0 && (
              <>
                <span className="text-gray-400 line-through">
                  {tk(p.comparePrice)}
                </span>

                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          <p
            className={`mt-2 text-sm ${
              out ? "text-red-500" : "text-green-600"
            }`}
          >
            {out
              ? "Out of stock"
              : `In stock (${stock} available)`}
          </p>

          {p.variants?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">
                Size / Shade
              </p>

              <div className="flex flex-wrap gap-2">
                {p.variants.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={variant === value}
                    onClick={() => setVariant(value)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${
                      variant === value
                        ? "border-pink-500 bg-pink-500 text-white"
                        : "border-pink-200 hover:bg-pink-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 items-stretch gap-3">
            {quantity > 0 ? (
              <div
                role="group"
                aria-label={`Cart quantity for ${p.name}${
                  variant ? `, ${variant}` : ""
                }`}
                className="flex min-h-12 min-w-0 items-center justify-between overflow-hidden rounded-full bg-pink-600 text-white"
              >
                <button
                  type="button"
                  disabled={!ready}
                  onClick={decreaseQuantity}
                  aria-label={`Remove one ${p.name}`}
                  className="flex min-h-12 w-11 shrink-0 items-center justify-center text-xl transition hover:bg-pink-700 disabled:opacity-50"
                >
                  −
                </button>

                <span
                  aria-live="polite"
                  aria-atomic="true"
                  className="whitespace-nowrap text-sm font-semibold"
                >
                  {quantity} in cart
                </span>

                <button
                  type="button"
                  disabled={!ready || out || atLimit}
                  onClick={increaseQuantity}
                  aria-label={`Add one ${p.name}`}
                  className="flex min-h-12 w-11 shrink-0 items-center justify-center text-xl transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!ready || out}
                onClick={increaseQuantity}
                className={`${BTN_O} min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {out ? "Out of Stock" : "Add to Cart"}
              </button>
            )}

            <button
              type="button"
              disabled={!ready || out}
              onClick={buyNow}
              className={`${BTN} min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Buy Now
            </button>
          </div>

          {quantity > 0 && (
            <p
              className="mt-3 text-sm text-pink-600"
              aria-live="polite"
            >
              Subtotal:{" "}
              <span className="font-semibold">
                {tk(p.price * quantity)}
              </span>
              {atLimit && (
                <span className="ml-2 text-xs text-gray-500">
                  Maximum stock reached
                </span>
              )}
            </p>
          )}

          <div className="mt-8">
            <h2 className="mb-2 font-semibold">
              Product Details
            </h2>

            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {p.description || "No description."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-3 font-display text-xl font-bold text-pink-700">
          Customer Reviews
        </h2>

        {reviews.length ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="rounded-xl border border-pink-100 bg-white p-4"
              >
                <p className="text-sm font-medium">
                  {review.userName}

                  <span className="ml-2 text-pink-500">
                    {"★".repeat(review.rating)}
                  </span>
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
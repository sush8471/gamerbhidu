"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Package,
  ShieldCheck,
  User,
  History,
  Sparkles,
  ExternalLink,
  Edit3,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllOrders,
  verifyOrderCode,
  updateOrderDelivery,
  type DbOrder,
  type CustomerHistory,
} from "@/lib/db/order-db";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Bill Code Verification Lookup
  const [lookupQuery, setLookupQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<{
    order: DbOrder;
    customerHistory: CustomerHistory;
  } | null>(null);

  // List filters
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "delivered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit / Delivery Notes Modal
  const [editingOrder, setEditingOrder] = useState<DbOrder | null>(null);
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<"pending" | "delivered">("pending");
  const [editDeliveryNotes, setEditDeliveryNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Copy state tracker
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle Bill Code Verification
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsVerifying(true);
    try {
      const result = await verifyOrderCode(lookupQuery);
      if (!result) {
        toast.error(`No order found matching code: "${lookupQuery}"`);
        setVerifiedResult(null);
      } else {
        setVerifiedResult(result);
        toast.success(`Verified bill: ${result.order.order_code}!`);
      }
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    toast.success("UTR copied to clipboard!");
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const openEditModal = (order: DbOrder) => {
    setEditingOrder(order);
    setEditDeliveryStatus(order.delivery_status || "pending");
    setEditDeliveryNotes(order.delivery_notes || "");
  };

  const handleSaveDelivery = async () => {
    if (!editingOrder) return;
    setIsSaving(true);
    try {
      await updateOrderDelivery(
        editingOrder.order_id,
        editDeliveryStatus,
        editDeliveryNotes
      );
      toast.success(`Order ${editingOrder.order_code} updated!`);
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === editingOrder.order_id
            ? {
                ...o,
                delivery_status: editDeliveryStatus,
                status: editDeliveryStatus === "delivered" ? "delivered" : "pending",
                delivery_notes: editDeliveryNotes,
              }
            : o
        )
      );

      // If this was also in verified result, update that too
      if (verifiedResult?.order.order_id === editingOrder.order_id) {
        setVerifiedResult((prev) =>
          prev
            ? {
                ...prev,
                order: {
                  ...prev.order,
                  delivery_status: editDeliveryStatus,
                  status: editDeliveryStatus === "delivered" ? "delivered" : "pending",
                  delivery_notes: editDeliveryNotes,
                },
              }
            : null
        );
      }

      setEditingOrder(null);
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered orders for list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && order.delivery_status !== "delivered") ||
        (filterStatus === "delivered" && order.delivery_status === "delivered");

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.order_code.toLowerCase().includes(query) ||
        order.order_id.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_email.toLowerCase().includes(query) ||
        order.utr_number.toLowerCase().includes(query) ||
        order.items?.some((i) => i.name.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.delivery_status !== "delivered").length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.delivery_status === "delivered").length,
    [orders]
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Orders & Bill Verification
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Live Store
            </span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Verify WhatsApp bill codes, inspect customer purchase history, and update manual delivery.
          </p>
        </div>

        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* ── SECTION 1: WHATSAPP BILL CODE VERIFICATION & CUSTOMER DOSSIER ── */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/[0.08] to-card p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2.5 text-primary text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="h-4 w-4" />
          Instant WhatsApp Bill Lookup & Customer Dossier
        </div>

        <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Paste Bill Code (e.g. GB-8492) or 12-Digit UPI UTR..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/80 border border-white/15 text-white placeholder:text-muted-foreground text-sm font-mono tracking-wide focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || !lookupQuery.trim()}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 shrink-0"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Verify Bill
              </>
            )}
          </button>
        </form>

        {/* VERIFIED BILL DOSSIER CARD */}
        {verifiedResult && (
          <div className="mt-5 pt-5 border-t border-white/10 grid lg:grid-cols-12 gap-5 animate-fadeIn">
            {/* Left: Current Verified Order */}
            <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-white">
                      {verifiedResult.order.order_code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        verifiedResult.order.delivery_status === "delivered"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {verifiedResult.order.delivery_status === "delivered"
                        ? "Delivered ✓"
                        : "Pending Verification"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order ID: {verifiedResult.order.order_id} •{" "}
                    {new Date(verifiedResult.order.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => openEditModal(verifiedResult.order)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Update Delivery
                </button>
              </div>

              {/* UTR reference with copy */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04] border border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">
                    12-Digit UPI UTR / Reference No
                  </span>
                  <span className="text-base font-mono font-bold text-white tracking-wider">
                    {verifiedResult.order.utr_number || "Not provided"}
                  </span>
                </div>
                {verifiedResult.order.utr_number && (
                  <button
                    onClick={() => handleCopyUtr(verifiedResult.order.utr_number)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-xs font-bold transition-all"
                  >
                    {copiedUtr === verifiedResult.order.utr_number ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy UTR
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Games in this Bill */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-2">
                  Purchased Games ({verifiedResult.order.items?.length || 0})
                </span>
                <div className="space-y-2">
                  {verifiedResult.order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.image && (
                          <div className="relative w-8 h-11 rounded overflow-hidden bg-white/5 shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium text-white truncate">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-white shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/10 text-sm">
                  <span className="font-semibold text-muted-foreground">Total Paid:</span>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    ₹{verifiedResult.order.total}
                  </span>
                </div>
              </div>

              {/* Delivery Notes */}
              {verifiedResult.order.delivery_notes && (
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                  <span className="font-bold text-muted-foreground block mb-0.5">
                    Delivery Notes:
                  </span>
                  <p className="text-white whitespace-pre-wrap">
                    {verifiedResult.order.delivery_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Recurring Customer Dossier */}
            <div className="lg:col-span-5 bg-black/30 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <User className="h-4 w-4 text-primary" />
                    Customer Dossier
                  </div>
                  {verifiedResult.customerHistory.isRecurring ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ★ Recurring Buyer ({verifiedResult.customerHistory.totalOrders} Orders)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                      First-Time Buyer
                    </span>
                  )}
                </div>

                {/* Customer Details */}
                <div className="rounded-lg bg-white/[0.03] p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-white font-semibold">
                      {verifiedResult.order.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-white font-mono break-all">
                      {verifiedResult.order.customer_email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lifetime Spend:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      ₹{verifiedResult.customerHistory.totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Lifetime Games Bought (For Upselling & Recommendations) */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                    <History className="h-3.5 w-3.5" />
                    All Games Bought by this User:
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {Array.from(
                      new Set(
                        verifiedResult.customerHistory.orders.flatMap(
                          (o) => o.items?.map((i) => i.name) || []
                        )
                      )
                    ).map((gameName, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2.5 py-1.5 rounded bg-white/[0.04] text-white/90 truncate flex items-center justify-between"
                      >
                        <span>{gameName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 text-[11px] text-muted-foreground leading-snug">
                💡 <strong className="text-white">Tip:</strong> Mention their past purchases on WhatsApp when sending their new credentials for a great personalized experience!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: ORDERS FEED & FILTERS ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === "all"
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === "pending"
                  ? "bg-amber-500 text-black shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("delivered")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === "delivered"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Delivered ({deliveredCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, name, UTR..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-card border border-white/10 text-white placeholder:text-muted-foreground text-xs focus:outline-none focus:border-white/25 transition-all"
            />
          </div>
        </div>

        {/* Orders Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading orders database...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-white/10 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 text-white/20" />
            <p className="font-semibold text-white">No orders match your filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              New customer checkouts on the website will instantly appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isDelivered = order.delivery_status === "delivered";
              return (
                <div
                  key={order.id || order.order_id}
                  className="rounded-xl border border-white/10 bg-card p-4 sm:p-5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-base text-white">
                        {order.order_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDelivered
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {isDelivered ? "Delivered ✓" : "Pending Verification"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} at{" "}
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="text-white font-medium">
                        👤 {order.customer_name}
                      </span>
                      <span className="text-muted-foreground">
                        📧 {order.customer_email || "N/A"}
                      </span>
                      <span className="font-mono text-muted-foreground flex items-center gap-1.5">
                        💳 UTR:{" "}
                        <strong className="text-white">
                          {order.utr_number || "None"}
                        </strong>
                        {order.utr_number && (
                          <button
                            onClick={() => handleCopyUtr(order.utr_number)}
                            className="text-primary hover:text-white"
                            title="Copy UTR"
                          >
                            {copiedUtr === order.utr_number ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </span>
                    </div>

                    {/* Games badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {order.items?.map((item, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-white/80 border border-white/5 truncate max-w-[220px]"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>

                    {order.delivery_notes && (
                      <p className="text-xs text-muted-foreground italic bg-white/[0.02] p-1.5 rounded">
                        Note: {order.delivery_notes}
                      </p>
                    )}
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Amount</span>
                      <span className="text-lg font-bold font-mono text-white">
                        ₹{order.total}
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Manage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EDIT DELIVERY MODAL ── */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-card border border-white/15 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Fulfill Order {editingOrder.order_code}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: {editingOrder.customer_name} ({editingOrder.customer_email})
                </p>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-muted-foreground hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Delivery Status Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Delivery Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditDeliveryStatus("pending")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    editDeliveryStatus === "pending"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                  }`}
                >
                  Pending
                </button>
                <button
                  type="button"
                  onClick={() => setEditDeliveryStatus("delivered")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    editDeliveryStatus === "delivered"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                      : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                  }`}
                >
                  Delivered ✓
                </button>
              </div>
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Delivery Notes (Steam keys, credentials, fulfillment time)
              </label>
              <textarea
                value={editDeliveryNotes}
                onChange={(e) => setEditDeliveryNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Steam ID & Pass delivered via WhatsApp at 11:15 PM"
                className="w-full bg-background border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDelivery}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";

export function useInvoiceUtils(invoice) {
  const utils = useMemo(() => {
    if (!invoice) return null;

    const isFullyPaid = invoice.paidAmount >= invoice.totalAmount;
    const remainingAmount = invoice.totalAmount - invoice.paidAmount;

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: invoice.currency || "ARS",
      }).format(amount);
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return {
      isFullyPaid,
      remainingAmount,
      formatCurrency,
      formatDate,
    };
  }, [invoice]);

  return utils;
}

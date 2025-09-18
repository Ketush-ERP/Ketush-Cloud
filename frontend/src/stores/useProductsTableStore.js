import { create } from "zustand";

const useProductsTableStore = create((set) => ({
  offset: 1,
  pageSize: 100,
  search: "",
  selectedSupplierId: "", // Nuevo: ID del proveedor seleccionado
  setOffset: (offset) => {
    console.log("setOffset called with:", offset);
    set({ offset: Number(offset) });
  },
  setPageSize: (pageSize) => {
    console.log("setPageSize called with:", pageSize);
    set({ pageSize: Number(pageSize) });
  },
  setSearch: (search) => {
    console.log("setSearch called with:", search);
    set({ search, offset: 1 });
  },
  setSelectedSupplierId: (supplierId) => {
    console.log("setSelectedSupplierId called with:", supplierId);
    set({ selectedSupplierId: supplierId, offset: 1 }); // Resetear a la primera página
  },
  clearFilters: () => {
    console.log("clearFilters called");
    set({ search: "", selectedSupplierId: "", offset: 1 });
  },
}));
export default useProductsTableStore;

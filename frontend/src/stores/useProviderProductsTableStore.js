import { create } from "zustand";

const useProviderProductsTableStore = create((set) => ({
  offset: 1,
  pageSize: 100,
  search: "",
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
}));

export default useProviderProductsTableStore;

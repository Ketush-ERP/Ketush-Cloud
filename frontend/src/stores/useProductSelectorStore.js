import { create } from "zustand";

export const useProductSelectorStore = create((set, get) => ({
  // Productos seleccionados (Set de IDs)
  selectedProductIds: new Set(),

  // Agregar producto seleccionado
  addSelectedProduct: (productId) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedProductIds);
      newSelectedIds.add(productId);
      return { selectedProductIds: newSelectedIds };
    });
  },

  // Remover producto seleccionado
  removeSelectedProduct: (productId) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedProductIds);
      newSelectedIds.delete(productId);
      return { selectedProductIds: newSelectedIds };
    });
  },

  // Toggle selección de producto
  toggleProductSelection: (productId) => {
    const { selectedProductIds, addSelectedProduct, removeSelectedProduct } =
      get();
    if (selectedProductIds.has(productId)) {
      removeSelectedProduct(productId);
    } else {
      addSelectedProduct(productId);
    }
  },

  // Seleccionar todos los productos visibles
  selectAllVisible: (visibleProductIds) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedProductIds);
      visibleProductIds.forEach((id) => newSelectedIds.add(id));
      return { selectedProductIds: newSelectedIds };
    });
  },

  // Deseleccionar todos los productos visibles
  deselectAllVisible: (visibleProductIds) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedProductIds);
      visibleProductIds.forEach((id) => newSelectedIds.delete(id));
      return { selectedProductIds: newSelectedIds };
    });
  },

  // Toggle selección de todos los productos visibles
  toggleAllVisible: (visibleProductIds) => {
    const { selectedProductIds, selectAllVisible, deselectAllVisible } = get();
    const allVisibleSelected = visibleProductIds.every((id) =>
      selectedProductIds.has(id)
    );

    if (allVisibleSelected) {
      deselectAllVisible(visibleProductIds);
    } else {
      selectAllVisible(visibleProductIds);
    }
  },

  // Limpiar todas las selecciones
  clearAllSelections: () => {
    set({ selectedProductIds: new Set() });
  },

  // Verificar si un producto está seleccionado
  isProductSelected: (productId) => {
    return get().selectedProductIds.has(productId);
  },

  // Obtener cantidad de productos seleccionados
  getSelectedCount: () => {
    return get().selectedProductIds.size;
  },
}));

// src/components/Tables/DataTable.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import "./DataTable.css";

export const DataTable = ({
  columns,
  rows,
  pageSize = 5,
  rowCount,
  page,
  paginationMode = "client",
  onPageChange,
  onPageSizeChange,
  toolbar = true,
}) => {
  console.log("DataTable props:", {
    pageSize,
    rowCount,
    page,
    paginationMode,
    onPageChange: !!onPageChange,
  });

  //   usar paginationModel
  const paginationModel = {
    page: page || 0,
    pageSize: pageSize || 5,
  };

  // Si pageSize es -1, mostrar todos los productos
  const effectivePageSize = pageSize === -1 ? rowCount : pageSize;

  // Referencia para mantener la posición del scroll
  const containerRef = React.useRef(null);

  // Mantener la posición del scroll cuando cambian los datos
  React.useEffect(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      // Usar requestAnimationFrame para asegurar que el DOM se ha actualizado
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollTop;
        }
      });
    }
  }, [rows.length]);

  const columnsStyled = columns.map((col) => {
    if (col.field === "code" || col.field === "codigo") {
      return {
        ...col,
        renderCell: (params) => (
          <span className="bold-cell">{params.value}</span>
        ),
      };
    }
    return col;
  });

  return (
    <div ref={containerRef} className="w-full h-full">
      <DataGrid
        rows={rows}
        columns={columnsStyled}
        paginationModel={{ ...paginationModel, pageSize: effectivePageSize }}
        pageSizeOptions={[25, 50, 100, { label: "Todos", value: -1 }]}
        pagination
        paginationMode={paginationMode}
        rowCount={rowCount}
        onPaginationModelChange={(model) => {
          console.log("DataGrid onPaginationModelChange:", model);
          console.log("onPageChange function exists:", !!onPageChange);
          console.log("onPageSizeChange function exists:", !!onPageSizeChange);

          if (onPageChange && model.page !== paginationModel.page) {
            onPageChange(model.page);
          }
          if (onPageSizeChange && model.pageSize !== paginationModel.pageSize) {
            onPageSizeChange(model.pageSize);
          }
        }}
        disableRowSelectionOnClick
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        getRowClassName={() => "custom-row"}
      />
    </div>
  );
};

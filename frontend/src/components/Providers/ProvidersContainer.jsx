import React from "react";

const ProvidersContainer = ({ children }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
      {children}
    </div>
  );
};

export default ProvidersContainer;

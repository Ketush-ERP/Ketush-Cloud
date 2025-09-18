export const Info = ({ label, value, highlight = "" }) => (
  <p>
    <span className="font-semibold">{label}:</span>{" "}
    <span className={highlight}>
      {value || <span className="text-gray-400">N/A</span>}
    </span>
  </p>
);

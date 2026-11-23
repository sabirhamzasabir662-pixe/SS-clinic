import React from "react";

/**
 * Reusable developer credit footer.
 * - login prop: compact style for Login page right panel
 * - default: inner pages footer with top border, auto margin to push to bottom
 */
export default function Footer({ login = false }) {
  if (login) {
    return (
      <p
        style={{ color: "#6B7280", fontSize: "13px" }}
        className="text-center mt-5 select-none"
      >
        Developed by{" "}
        <span style={{ color: "#1E4FD8", fontWeight: 600 }}>
          Hamza Sabir Shah
        </span>
      </p>
    );
  }

  return (
    <footer
      className="w-full text-center select-none"
      style={{
        borderTop: "1px solid #e5e7eb",
        padding: "14px 16px",
        marginTop: "auto",
        color: "#6B7280",
        fontSize: "13px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      Developed by{" "}
      <span style={{ color: "#1E4FD8", fontWeight: 600 }}>
        Hamza Sabir Shah
      </span>
    </footer>
  );
}

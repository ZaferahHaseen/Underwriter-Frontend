import "./StatusStamp.css";

/**
 * A rotated "rubber stamp" badge for the underwriting decision —
 * a nod to the real-world artifact of a stamped insurance file.
 */
function StatusStamp({ status }) {
  const map = {
    APPROVED: { text: "Approved", cls: "stamp-approved" },
    REJECTED: { text: "Rejected", cls: "stamp-rejected" },
    PENDING: { text: "Pending Review", cls: "stamp-pending" },
  };
  const s = map[status] || map.PENDING;

  return (
    <div className={`status-stamp ${s.cls}`}>
      <span>{s.text}</span>
    </div>
  );
}

export default StatusStamp;

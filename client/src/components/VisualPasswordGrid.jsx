import React from "react";

const images = [
  "🐶",
  "⭐",
  "🌳",
  "🚗",
  "🏠",
  "🎸",
  "📱",
  "🛡️",
  "🔒"
];

export default function VisualPasswordGrid({
  selected,
  setSelected,
  disabled = false,
}) {
  const handleClick = (img) => {
    if (disabled) return;

    if (selected.includes(img)) return;

    if (selected.length < 3) {
      setSelected([...selected, img]);
    }
  };

  return (
    <div style={styles.grid}>
      {images.map((img) => (
        <div
          key={img}
          style={styles.item}
        >
          {img}
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "12px",
    marginTop: "15px",
  },

  item: {
    fontSize: "2rem",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },
};
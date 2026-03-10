import React from "react";
import ItemCard from "./ItemCard"; // Import the new modular component

const ItemComp = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <ItemCard key={item._id} item={item} />
      ))}
    </>
  );
};

export default ItemComp;

import { useEffect, useState } from "react";
import { useProducts } from "../../product/hook/useProducts";
import { useWishlist } from "../context/WishlistContext";
import EmptyWishlist from "./EmptyWishlist";
import MoveToCartPopUp from "../components/pop-up/MoveToCartPopUp";
import { WishlistCard } from "../components/cards/WishlistCard";
import NotificationProduct from "../../../components/cards/NotificationProduct";

const WishlistPage = () => {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  console.log(wishlist);
  const { getProductById } = useProducts();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [notification, setNotification] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* -------------------------
     NOTIFICATION
  -------------------------- */
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000);
  };

  /* -------------------------
     LOAD PRODUCTS FROM IDS
  -------------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      if (!wishlist.length) {
        setProducts([]);
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      try {
        const data = await Promise.all(
          wishlist.map((item) => getProductById(item.productId)),
        );
        setProducts(data.filter(Boolean));
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [wishlist, getProductById]);

  /* -------------------------
     LOADING STATE
  -------------------------- */
  if (wishlistLoading || loadingProducts) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* -------------------------
     RENDER
  -------------------------- */
  return (
    <div className="max-w-9xl mt-15 md:mt-35 mx-auto px-1 md:px-4 py-3 md:py-5">
      {/* Notification */}
      {notification && (
        <NotificationProduct
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={2000}
        />
      )}

      {/* Empty */}
      {products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <>
          <h2 className="ml-3 text-[20px] font-[crimsonPro] uppercase mb-6">
            My Wishlist
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {products.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                showNotification={showNotification}
                onMoveToCart={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        </>
      )}

      {/* Move to cart */}
      {selectedProduct && (
        <MoveToCartPopUp
          open
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onCompleted={() => {
            showNotification("Added to cart!", "success");
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default WishlistPage;

// import { useState, useEffect, useCallback } from "react";
// import { wishlistService } from "../services/wishlistService";
// import { auth } from "../../../../config/firebase";

// export const useWishlist = (productId = null) => {
//   const [wishlist, setWishlist] = useState([]);
//   const [isLiked, setIsLiked] = useState(false);

//   const [loadingList, setLoadingList] = useState(true);
//   const [loadingAction, setLoadingAction] = useState(false);
//   const [ready, setReady] = useState(false);

//   // App ready after auth init
//   useEffect(() => {
//     const unsub = auth.onAuthStateChanged(() => {
//       setReady(true);
//     });
//     return () => unsub();
//   }, []);

//   const loadWishlist = useCallback(async () => {
//     if (!ready) return;

//     setLoadingList(true);
//     try {
//       const items = await wishlistService.getWishlist();
//       setWishlist(items);

//       if (productId) {
//         setIsLiked(items.some((i) => i.productId === productId));
//       }
//     } finally {
//       setLoadingList(false);
//     }
//   }, [ready, productId]);

//   const addToWishlist = useCallback(
//     async (id) => {
//       setLoadingAction(true);
//       try {
//         const item = await wishlistService.addToWishlist(id);
//         setWishlist((prev) => [...prev, item]);
//         if (id === productId) setIsLiked(true);
//       } finally {
//         setLoadingAction(false);
//       }
//     },
//     [productId],
//   );

//   const removeFromWishlist = useCallback(
//     async (id) => {
//       setLoadingAction(true);
//       try {
//         await wishlistService.removeFromWishlistByProductId(id);
//         setWishlist((prev) => prev.filter((i) => i.productId !== id));
//         if (id === productId) setIsLiked(false);
//       } finally {
//         setLoadingAction(false);
//       }
//     },
//     [productId],
//   );

//   const toggleWishlist = useCallback(() => {
//     if (!productId) return;
//     return isLiked
//       ? removeFromWishlist(productId)
//       : addToWishlist(productId);
//   }, [isLiked, productId, addToWishlist, removeFromWishlist]);

//   useEffect(() => {
//     if (ready) loadWishlist();
//   }, [ready, loadWishlist]);

//   return {
//     wishlist,
//     isLiked,
//     loading: loadingList || loadingAction,
//     loadingList,
//     loadingAction,
//     toggleWishlist,
//     addToWishlist,
//     removeFromWishlist,
//     reload: loadWishlist,
//     count: wishlist.length,
//   };
// };

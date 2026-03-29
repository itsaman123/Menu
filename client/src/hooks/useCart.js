import { useState, useEffect } from 'react';

const useCart = () => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.menuItemId === item._id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((i) => i.menuItemId !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return removeFromCart(itemId);
    setCart((prevCart) =>
      prevCart.map((i) => (i.menuItemId === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount };
};

export default useCart;

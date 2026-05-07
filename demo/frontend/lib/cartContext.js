"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  items: [],
  lastAdded: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload };
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) => item.category === action.payload.category
      );
      let updatedItems = [...state.items];
      if (existingIndex >= 0) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
      } else {
        updatedItems.push({ ...action.payload, quantity: 1 });
      }
      return {
        ...state,
        items: updatedItems,
        lastAdded: action.payload.category,
      };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.category !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.category === action.payload.category
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      return { ...state, items: updatedItems };
    }
    case "CLEAR_CART":
      return { ...initialState };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("crosssell_cart");
      if (stored) {
        dispatch({ type: "SET_STATE", payload: JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load cart", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("crosssell_cart", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save cart", error);
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  const { state, dispatch } = context;

  const addItem = (item) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (category) =>
    dispatch({ type: "REMOVE_ITEM", payload: category });
  const updateQuantity = (category, quantity) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { category, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  return {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};

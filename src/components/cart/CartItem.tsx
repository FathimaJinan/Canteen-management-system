import React from "react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, IndianRupee } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { menuItem, quantity } = item;

  return (
    <div className="flex gap-4 p-4 bg-card rounded-lg border">
      <img
        src={menuItem.image}
        alt={menuItem.name}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{menuItem.name}</h3>
        <p className="text-sm text-muted-foreground">{menuItem.category}</p>
        <div className="flex items-center font-medium text-primary mt-1">
          <IndianRupee className="h-3 w-3" />
          {menuItem.price}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeFromCart(menuItem.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(menuItem.id, quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(menuItem.id, quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItemComponent;

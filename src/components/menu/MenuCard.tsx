import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Clock, IndianRupee } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  
  const isOutOfStock = !item.available || (item.stockQuantity !== undefined && item.stockQuantity <= 0);
  const showLowStock = item.stockQuantity !== undefined && item.stockQuantity > 0 && item.stockQuantity <= 5;

  return (
    <Card className="overflow-hidden card-hover group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">
          {item.category}
        </Badge>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg font-bold">Out of Stock</Badge>
          </div>
        )}
        {showLowStock && (
          <Badge className="absolute top-3 right-3 bg-amber-500 text-white font-bold animate-pulse">
            Only {item.stockQuantity} left!
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{item.preparationTime} min</span>
          </div>
          {item.stockQuantity !== undefined && item.stockQuantity > 0 && (
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Stock: {item.stockQuantity}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center font-bold text-lg text-primary">
            <IndianRupee className="h-4 w-4" />
            {item.price}
          </div>
          <Button
            size="sm"
            onClick={() => addToCart(item)}
            disabled={isOutOfStock}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MenuCard;

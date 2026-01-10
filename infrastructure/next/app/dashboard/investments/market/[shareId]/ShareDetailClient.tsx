"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useShare, useOrderBook } from "@/hooks/useShares";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useTradingAccount } from "@/hooks/useTradingAccount";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface ShareDetailClientProps {
  shareId: string;
}

export default function ShareDetailClient({
  shareId,
}: ShareDetailClientProps) {
  const router = useRouter();
  const { share, isLoading: shareLoading, refresh: refreshShare } = useShare(shareId);
  const { orderBook, isLoading: orderBookLoading, refresh: refreshOrderBook } = useOrderBook(shareId);
  const { placeOrder, isLoading: placing } = usePlaceOrder();
  const { hasTradingAccount } = useTradingAccount();

  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [priceLimit, setPriceLimit] = useState("");
  const [validity, setValidity] = useState<"day" | "until_cancelled">("day");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || !priceLimit) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const quantityNum = parseInt(quantity);
    const priceNum = parseFloat(priceLimit);

    if (quantityNum <= 0 || priceNum <= 0) {
      toast.error("La quantité et le prix doivent être positifs");
      return;
    }

    try {
      await placeOrder({
        shareId,
        direction: orderType,
        quantity: quantityNum,
        priceLimit: priceNum,
        validity,
      });

      toast.success("Ordre placé avec succès !");
      setQuantity("");
      setPriceLimit("");
      refreshShare();
      refreshOrderBook();
      router.push("/dashboard/investments/orders");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors du placement de l'ordre"
      );
    }
  };

  if (shareLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="p-12 text-center">
            <p className="text-destructive">Action introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPrice = share.lastExecutedPrice ?? share.initialPrice;
  const priceChange =
    share.lastExecutedPrice && share.initialPrice
      ? ((share.lastExecutedPrice - share.initialPrice) / share.initialPrice) * 100
      : 0;
  const isPositive = priceChange >= 0;

  const estimatedTotal = quantity && priceLimit
    ? parseFloat(priceLimit) * parseInt(quantity) + 1
    : 0;

  const bids = orderBook?.bids || [];
  const asks = orderBook?.asks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{share.name}</h1>
            <p className="text-muted-foreground">
              {share.totalNumberOfParts.toLocaleString("fr-FR")} parts disponibles
            </p>
          </div>
        </div>
        {share.lastExecutedPrice && (
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className="gap-1 px-4 py-2"
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {priceChange > 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prix actuel</CardTitle>
          <CardDescription>Dernier prix exécuté</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold">{currentPrice.toFixed(2)} €</p>
            {share.lastExecutedPrice && (
              <p className="text-muted-foreground">
                (initial: {share.initialPrice.toFixed(2)} €)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Carnet d&apos;ordres</CardTitle>
            <CardDescription>Offres d&apos;achat et de vente en cours</CardDescription>
          </CardHeader>
          <CardContent>
            {orderBookLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8" />
                ))}
              </div>
            ) : (
              <Tabs defaultValue="buy">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">
                    Achats ({bids.length})
                  </TabsTrigger>
                  <TabsTrigger value="sell">
                    Ventes ({asks.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="buy" className="space-y-2 mt-4">
                  {bids.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun ordre d&apos;achat
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                        <span>Prix</span>
                        <span className="text-right">Quantité</span>
                      </div>
                      {bids.map((bid, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 text-sm py-2 hover:bg-muted/50 rounded px-2"
                        >
                          <span className="font-medium text-green-600">
                            {bid.price.toFixed(2)} €
                          </span>
                          <span className="text-right text-muted-foreground">
                            {bid.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sell" className="space-y-2 mt-4">
                  {asks.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun ordre de vente
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                        <span>Prix</span>
                        <span className="text-right">Quantité</span>
                      </div>
                      {asks.map((ask, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-2 text-sm py-2 hover:bg-muted/50 rounded px-2"
                        >
                          <span className="font-medium text-red-600">
                            {ask.price.toFixed(2)} €
                          </span>
                          <span className="text-right text-muted-foreground">
                            {ask.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passer un ordre</CardTitle>
            <CardDescription>
              Frais : 1€ par transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-2">
                <Label>Type d&apos;ordre</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={orderType === "buy" ? "default" : "outline"}
                    onClick={() => setOrderType("buy")}
                    className="w-full"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Achat
                  </Button>
                  <Button
                    type="button"
                    variant={orderType === "sell" ? "default" : "outline"}
                    onClick={() => setOrderType("sell")}
                    className="w-full"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Vente
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="Nombre d'actions"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceLimit">Prix limite (€)</Label>
                <Input
                  id="priceLimit"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Prix par action"
                  value={priceLimit}
                  onChange={(e) => setPriceLimit(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">Validité</Label>
                <Select
                  value={validity}
                  onValueChange={(value: "day" | "until_cancelled") =>
                    setValidity(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Jour</SelectItem>
                    <SelectItem value="until_cancelled">
                      Jusqu&apos;à annulation
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {estimatedTotal > 0 && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant</span>
                    <span>
                      {(parseFloat(priceLimit) * parseInt(quantity)).toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frais</span>
                    <span>1.00 €</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total estimé</span>
                    <span>{estimatedTotal.toFixed(2)} €</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={placing || !quantity || !priceLimit || !hasTradingAccount}
                title={!hasTradingAccount ? "Vous devez créer un compte titre pour passer des ordres" : ""}
              >
                {placing ? "Placement en cours..." : !hasTradingAccount ? "Compte titre requis" : "Placer l'ordre"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

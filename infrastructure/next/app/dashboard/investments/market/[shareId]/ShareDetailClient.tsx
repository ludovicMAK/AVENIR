"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

const orderSchema = z.object({
  direction: z.enum(["buy", "sell"], {
    error: "Veuillez sélectionner une direction",
  }),
  quantity: z
    .number()
    .int({ message: "La quantité doit être un nombre entier" })
    .positive({ message: "La quantité doit être positive" })
    .min(1, { message: "La quantité minimum est 1" }),
  priceLimit: z
    .number()
    .positive({ message: "Le prix doit être positif" })
    .min(0.01, { message: "Le prix minimum est 0.01€" }),
  validity: z.enum(["day", "until_cancelled"], {
    error: "Veuillez sélectionner une validité",
  }),
});

interface ShareDetailClientProps {
  shareId: string;
}

type OrderFormValues = z.infer<typeof orderSchema>;

export default function ShareDetailClient({
  shareId,
}: ShareDetailClientProps) {
  const router = useRouter();
  const { share, isLoading: shareLoading, refresh: refreshShare } = useShare(shareId);
  const { orderBook, isLoading: orderBookLoading, refresh: refreshOrderBook } = useOrderBook(shareId);
  const { placeOrder, isLoading: placing } = usePlaceOrder();
  const { hasTradingAccount } = useTradingAccount();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      direction: "buy",
      quantity: 1,
      priceLimit: share?.currentPrice || 0,
      validity: "day",
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      await placeOrder({
        shareId,
        direction: data.direction,
        quantity: data.quantity,
        priceLimit: data.priceLimit,
        validity: data.validity,
      });

      toast.success("Ordre placé avec succès !");
      form.reset();
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

  const watchedQuantity = form.watch("quantity");
  const watchedPriceLimit = form.watch("priceLimit");
  const estimatedTotal = watchedQuantity && watchedPriceLimit
    ? watchedPriceLimit * watchedQuantity + 1
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d&apos;ordre</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={field.value === "buy" ? "default" : "outline"}
                            onClick={() => field.onChange("buy")}
                            className="w-full"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Achat
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "sell" ? "default" : "outline"}
                            onClick={() => field.onChange("sell")}
                            className="w-full"
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Vente
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Nombre d'actions"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix limite (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Prix par action"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Prix actuel: {currentPrice.toFixed(2)} €
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validité</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">Jour</SelectItem>
                          <SelectItem value="until_cancelled">
                            Jusqu&apos;à annulation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {estimatedTotal > 0 && (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant</span>
                      <span>
                        {(watchedPriceLimit * watchedQuantity).toFixed(2)} €
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
                  disabled={form.formState.isSubmitting || !hasTradingAccount}
                  title={!hasTradingAccount ? "Vous devez créer un compte titre pour passer des ordres" : ""}
                >
                  {form.formState.isSubmitting ? "Placement en cours..." : !hasTradingAccount ? "Compte titre requis" : "Placer l'ordre"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

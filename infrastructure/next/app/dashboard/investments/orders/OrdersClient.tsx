"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrders, useCancelOrder } from "@/hooks/useOrders";
import { useTranslations } from "@/lib/i18n/simple-i18n";
import { Order } from "@/api/orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function OrdersClient() {
  const router = useRouter();
  const { orders, isLoading, refresh } = useOrders();
  const { cancelOrder, isLoading: cancelling } = useCancelOrder();
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const t = useTranslations('orders');

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      await cancelOrder(orderToCancel.id);
      toast.success("Ordre annulé avec succès");
      refresh();
      setOrderToCancel(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'annulation de l'ordre"
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case "executed":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Exécuté
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDirectionBadge = (direction: "buy" | "sell") => {
    return direction === "buy" ? (
      <Badge variant="default" className="bg-blue-600">
        Achat
      </Badge>
    ) : (
      <Badge variant="default" className="bg-orange-600">
        Vente
      </Badge>
    );
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const executedOrders = orders.filter((o) => o.status === "executed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const OrdersTable = ({ orders }: { orders: Order[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>{t('share')}</TableHead>
          <TableHead>{t('type')}</TableHead>
          <TableHead>{t('quantity')}</TableHead>
          <TableHead>{t('limitPrice')}</TableHead>
          <TableHead>{t('total')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('validity')}</TableHead>
          <TableHead className="text-right">{t('view')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-12">
              <p className="text-muted-foreground">{t('noOrders')}</p>
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                {format(new Date(order.dateCaptured), "dd/MM/yyyy HH:mm", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell className="font-medium">{order.shareId}</TableCell>
              <TableCell>{getDirectionBadge(order.direction)}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.priceLimit.toFixed(2)} €</TableCell>
              <TableCell>{order.blockedAmount.toFixed(2)} €</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {order.validity === "day" ? "Jour" : "Jusqu'à annulation"}
              </TableCell>
              <TableCell className="text-right">
                {order.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrderToCancel(order)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/investments/market")}>
          Passer un ordre
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-3xl">{pendingOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Exécutés</CardDescription>
            <CardTitle className="text-3xl">{executedOrders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Annulés</CardDescription>
            <CardTitle className="text-3xl">{cancelledOrders.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des ordres</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                Tous ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                En attente ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="executed">
                Exécutés ({executedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Annulés ({cancelledOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <OrdersTable orders={orders} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <OrdersTable orders={pendingOrders} />
            </TabsContent>

            <TabsContent value="executed" className="mt-6">
              <OrdersTable orders={executedOrders} />
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <OrdersTable orders={cancelledOrders} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l&apos;ordre</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cet ordre ? Cette action est
              irréversible et les fonds bloqués seront libérés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelOrder} disabled={cancelling}>
              {cancelling ? "Annulation..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

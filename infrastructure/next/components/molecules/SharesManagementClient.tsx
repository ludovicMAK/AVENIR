"use client";

import { useState, useCallback, useEffect } from "react";
import { sharesApi, Share } from "@/api/shares";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";

type ErrorMessageInput = Error | { message?: string } | string;

const extractErrorMessage = (
  error: ErrorMessageInput,
  fallback: string
): string =>
  typeof error === "string"
    ? error
    : error instanceof Error
    ? error.message
    : error.message || fallback;

export default function SharesManagementClient() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShare, setSelectedShare] = useState<Share | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    totalNumberOfParts: "",
    initialPrice: "",
  });

  const alertError = (error: ErrorMessageInput, fallback: string) =>
    alert(extractErrorMessage(error, fallback));

  const loadShares = useCallback(async () => {
    setLoading(true);

    let fetched: Share[] | null = null;
    await sharesApi
      .getAll()
      .then((data) => {
        fetched = data;
      })
      .catch((error: ErrorMessageInput) =>
        alertError(error, "Erreur: Impossible de charger les actions")
      );

    if (fetched) {
      setShares(fetched);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const created = await sharesApi
      .create({
        name: formData.name,
        totalNumberOfParts: parseInt(formData.totalNumberOfParts),
        initialPrice: parseFloat(formData.initialPrice),
      })
      .then(() => true)
      .catch((error: ErrorMessageInput) => {
        alert(`Erreur: ${extractErrorMessage(error, "Impossible de créer l'action")}`);
        return false;
      });

    if (!created) return;

    alert("Action créée avec succès");
    setIsCreateDialogOpen(false);
    setFormData({ name: "", totalNumberOfParts: "", initialPrice: "" });
    loadShares();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShare) return;

    const updated = await sharesApi
      .update(selectedShare.id, {
        name: formData.name || undefined,
        totalNumberOfParts: formData.totalNumberOfParts
          ? parseInt(formData.totalNumberOfParts)
          : undefined,
      })
      .then(() => true)
      .catch((error: ErrorMessageInput) => {
        alert(`Erreur: ${extractErrorMessage(error, "Impossible de modifier l'action")}`);
        return false;
      });

    if (!updated) return;

    alert("Action modifiée avec succès");
    setIsEditDialogOpen(false);
    setSelectedShare(null);
    setFormData({ name: "", totalNumberOfParts: "", initialPrice: "" });
    loadShares();
  };

  const handleDelete = async () => {
    if (!selectedShare) return;

    const deleted = await sharesApi
      .delete(selectedShare.id)
      .then(() => true)
      .catch((error: ErrorMessageInput) => {
        alert(`Erreur: ${extractErrorMessage(error, "Impossible de supprimer l'action")}`);
        return false;
      });

    if (!deleted) return;

    alert("Action supprimée avec succès");
    setIsDeleteDialogOpen(false);
    setSelectedShare(null);
    loadShares();
  };

  const openEditDialog = (share: Share) => {
    setSelectedShare(share);
    setFormData({
      name: share.name,
      totalNumberOfParts: share.totalNumberOfParts.toString(),
      initialPrice: share.initialPrice.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (share: Share) => {
    setSelectedShare(share);
    setIsDeleteDialogOpen(true);
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des actions
          </h1>
          <p className="text-muted-foreground">
            Créez, modifiez et supprimez les actions disponibles sur le marché
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle action
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Actions disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement...
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune action disponible. Créez-en une pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="text-right">Nombre de parts</TableHead>
                  <TableHead className="text-right">Prix initial</TableHead>
                  <TableHead className="text-right">Dernier cours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share) => (
                  <TableRow key={share.id}>
                    <TableCell className="font-medium">{share.name}</TableCell>
                    <TableCell className="text-right">
                      {share.totalNumberOfParts.toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(share.initialPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPrice(share.lastExecutedPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(share)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(share)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle action</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle action disponible sur le marché
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom de l&apos;action</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ex: Apple Inc."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalNumberOfParts">
                  Nombre total de parts
                </Label>
                <Input
                  id="totalNumberOfParts"
                  type="number"
                  min="1"
                  value={formData.totalNumberOfParts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalNumberOfParts: e.target.value,
                    })
                  }
                  placeholder="ex: 1000000"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="initialPrice">Prix initial (€)</Label>
                <Input
                  id="initialPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.initialPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, initialPrice: e.target.value })
                  }
                  placeholder="ex: 175.50"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;action</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l&apos;action. Le prix initial ne
              peut pas être modifié.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom de l&apos;action</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ex: Apple Inc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-totalNumberOfParts">
                  Nombre total de parts
                </Label>
                <Input
                  id="edit-totalNumberOfParts"
                  type="number"
                  min="0"
                  value={formData.totalNumberOfParts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalNumberOfParts: e.target.value,
                    })
                  }
                  placeholder="ex: 1200000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-initialPrice">
                  Prix initial (non modifiable)
                </Label>
                <Input
                  id="edit-initialPrice"
                  value={formData.initialPrice}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l&apos;action{" "}
              <strong>{selectedShare?.name}</strong> ?
              <br />
              <br />
              Cette action ne peut être supprimée que si :
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Aucun client ne possède d&apos;actions</li>
                <li>Il n&apos;y a pas d&apos;ordres actifs</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { TrendingUp, CheckCircle, Clock, Package, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Restock() {
  const utils = trpc.useUtils();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const { data: pendingOrders, isLoading } = trpc.restock.pending.useQuery();
  const { data: lowStockProducts } = trpc.products.lowStock.useQuery();

  const createOrderMutation = trpc.restock.create.useMutation({
    onSuccess: () => {
      utils.restock.pending.invalidate();
      utils.products.lowStock.invalidate();
      toast.success("Orden de reposición creada exitosamente");
    },
    onError: () => {
      toast.error("Error al crear la orden de reposición");
    },
  });

  const confirmOrderMutation = trpc.restock.confirm.useMutation({
    onSuccess: () => {
      utils.restock.pending.invalidate();
      setConfirmDialogOpen(false);
      setSelectedOrder(null);
      toast.success("Orden confirmada exitosamente");
    },
    onError: () => {
      toast.error("Error al confirmar la orden");
    },
  });

  const handleCreateOrder = async (productId: number, quantity: number) => {
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + 7);

    await createOrderMutation.mutateAsync({
      productId,
      quantity,
      predictedDate,
      notes: "Reposición automática por nivel crítico",
    });
  };

  const handleConfirmOrder = (orderId: number) => {
    setSelectedOrder(orderId);
    setConfirmDialogOpen(true);
  };

  const confirmOrder = async () => {
    if (selectedOrder) {
      await confirmOrderMutation.mutateAsync({ id: selectedOrder });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reposición Predictiva</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el reabastecimiento automático de productos
          </p>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <CardTitle>Productos con Stock Crítico</CardTitle>
              </div>
              <CardDescription>
                {lowStockProducts.length} producto(s) requieren reposición inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock actual: {product.stock} {product.unit} (Mínimo: {product.minStock})
                      </p>
                    </div>
                    <Button
                      onClick={() => handleCreateOrder(product.id, product.minStock * 2)}
                      disabled={createOrderMutation.isPending}
                      size="sm"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Reponer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Pendientes</CardTitle>
            <CardDescription>
              Revisa y confirma las órdenes de reposición sugeridas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : pendingOrders && pendingOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">Orden #{order.id}</p>
                        <Badge variant="outline" className="status-badge-warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendiente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cantidad: {order.quantity} unidades
                      </p>
                      {order.predictedDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fecha estimada: {new Date(order.predictedDate).toLocaleDateString("es-CL")}
                        </p>
                      )}
                      {order.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleConfirmOrder(order.id)}
                        disabled={confirmOrderMutation.isPending}
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay órdenes pendientes</h3>
                <p className="text-muted-foreground">
                  El sistema generará automáticamente órdenes cuando detecte niveles críticos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predictive Analysis */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Pronóstico de Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">+15%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Incremento esperado próximos 30 días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ahorro Estimado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$450.000</div>
              <p className="text-xs text-muted-foreground mt-1">
                Por optimización de inventario
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan">92%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Precisión de predicciones
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Orden de Reposición</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas confirmar esta orden? Se procederá con el pedido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={confirmOrderMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmOrder}
              disabled={confirmOrderMutation.isPending}
            >
              {confirmOrderMutation.isPending ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

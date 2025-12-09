import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Plus, MapPin, FileText, Camera, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function Incidents() {
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
  });

  const { data: incidents, isLoading } = trpc.incidents.list.useQuery();

  const createIncidentMutation = trpc.incidents.create.useMutation({
    onSuccess: () => {
      utils.incidents.list.invalidate();
      setDialogOpen(false);
      setFormData({ location: "", description: "", severity: "medium" });
      toast.success("Incidente reportado exitosamente");
    },
    onError: () => {
      toast.error("Error al reportar el incidente");
    },
  });

  const updateStatusMutation = trpc.incidents.updateStatus.useMutation({
    onSuccess: () => {
      utils.incidents.list.invalidate();
      toast.success("Estado actualizado");
    },
  });

  const handleSubmit = async () => {
    if (!formData.location || !formData.description) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    await createIncidentMutation.mutateAsync(formData);
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: { label: "Baja", className: "status-badge-info" },
      medium: { label: "Media", className: "status-badge-warning" },
      high: { label: "Alta", className: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
      critical: { label: "Crítica", className: "status-badge-danger" },
    };
    return variants[severity as keyof typeof variants] || variants.medium;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { label: "Abierto", icon: AlertCircle, className: "status-badge-warning" },
      in_progress: { label: "En Progreso", icon: Clock, className: "status-badge-info" },
      resolved: { label: "Resuelto", icon: CheckCircle, className: "status-badge-success" },
    };
    return variants[status as keyof typeof variants] || variants.open;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reporte de Incidentes</h1>
            <p className="text-muted-foreground mt-1">
              Documenta y gestiona incidentes de higiene y seguridad
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reportar Nuevo Incidente</DialogTitle>
                <DialogDescription>
                  Completa la información del incidente para su registro y seguimiento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Ubicación
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ej: Zona de carga, Cocina principal, Almacén"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidad</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Descripción Detallada
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe el incidente con el mayor detalle posible..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    <Camera className="h-4 w-4 inline mr-1" />
                    Evidencia Fotográfica (Opcional)
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para agregar una foto
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={createIncidentMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createIncidentMutation.isPending}
                >
                  {createIncidentMutation.isPending ? "Enviando..." : "Enviar Reporte"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Abiertos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {incidents?.filter((i) => i.status === "open").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {incidents?.filter((i) => i.status === "resolved").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Completados exitosamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Incidentes</CardTitle>
            <CardDescription>
              Todos los incidentes reportados y su estado actual
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
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-3">
                {incidents.map((incident) => {
                  const severityBadge = getSeverityBadge(incident.severity);
                  const statusBadge = getStatusBadge(incident.status);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={incident.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{incident.location}</span>
                            <Badge variant="outline" className={severityBadge.className}>
                              {severityBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {incident.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reportado: {new Date(incident.createdAt).toLocaleString("es-CL")}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusBadge.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>

                      {incident.status !== "resolved" && (
                        <div className="flex gap-2 pt-3 border-t">
                          {incident.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: incident.id,
                                  status: "in_progress",
                                })
                              }
                            >
                              Marcar en Progreso
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: incident.id,
                                status: "resolved",
                              })
                            }
                          >
                            Marcar como Resuelto
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay incidentes reportados</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza reportando un nuevo incidente
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Reportar Incidente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

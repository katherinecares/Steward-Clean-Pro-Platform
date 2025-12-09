import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, CheckCircle, XCircle, Clock, Plus, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Audit() {
  const utils = trpc.useUtils();
  const [selectedCriterion, setSelectedCriterion] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: latestAudit, isLoading } = trpc.audit.latest.useQuery();
  const { data: criteria } = trpc.audit.criteria.useQuery();

  const createAuditMutation = trpc.audit.create.useMutation({
    onSuccess: () => {
      utils.audit.latest.invalidate();
      toast.success("Nueva auditoría iniciada");
    },
    onError: () => {
      toast.error("Error al crear la auditoría");
    },
  });

  const updateResultMutation = trpc.audit.updateResult.useMutation({
    onSuccess: () => {
      utils.audit.latest.invalidate();
      setDialogOpen(false);
      setSelectedCriterion(null);
      setNotes("");
      toast.success("Resultado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar el resultado");
    },
  });

  const handleStartAudit = async () => {
    await createAuditMutation.mutateAsync();
  };

  const handleUpdateResult = async (status: "pass" | "fail") => {
    if (!latestAudit?.audit || !selectedCriterion) return;

    await updateResultMutation.mutateAsync({
      auditId: latestAudit.audit.id,
      criteriaId: selectedCriterion,
      status,
      notes: notes || undefined,
    });
  };

  const openCriterionDialog = (criterionId: number) => {
    setSelectedCriterion(criterionId);
    const existingResult = latestAudit?.results?.find((r) => r.criteriaId === criterionId);
    setNotes(existingResult?.notes || "");
    setDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "fail") return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: { label: "Aprobado", className: "status-badge-success" },
      fail: { label: "No Cumple", className: "status-badge-danger" },
      pending: { label: "Pendiente", className: "status-badge-warning" },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const selectedCriterionData = criteria?.find((c) => c.id === selectedCriterion);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Auditoría y Cumplimiento</h1>
            <p className="text-muted-foreground mt-1">
              Evalúa el cumplimiento de criterios de higiene y seguridad
            </p>
          </div>
          {!latestAudit?.audit || latestAudit.audit.status === "completed" ? (
            <Button onClick={handleStartAudit} disabled={createAuditMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {createAuditMutation.isPending ? "Iniciando..." : "Nueva Auditoría"}
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : latestAudit?.audit ? (
          <>
            {/* Current Audit Status */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Auditoría #{latestAudit.audit.id}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Iniciada el{" "}
                      {new Date(latestAudit.audit.createdAt).toLocaleDateString("es-CL")}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      latestAudit.audit.status === "completed"
                        ? "status-badge-success"
                        : "status-badge-info"
                    }
                  >
                    {latestAudit.audit.status === "completed" ? "Completada" : "En Progreso"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso de Evaluación</span>
                    <span className="text-sm font-bold">
                      {latestAudit.results?.filter((r) => r.status !== "pending").length || 0} de{" "}
                      {latestAudit.results?.length || 0} criterios
                    </span>
                  </div>
                  <Progress
                    value={
                      ((latestAudit.results?.filter((r) => r.status !== "pending").length || 0) /
                        (latestAudit.results?.length || 1)) *
                      100
                    }
                    className="h-3"
                  />
                </div>

                {latestAudit.audit.overallScore !== null && (
                  <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Puntuación General</p>
                      <p
                        className={`text-3xl font-bold ${getComplianceColor(
                          latestAudit.audit.overallScore
                        )}`}
                      >
                        {latestAudit.audit.overallScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Aprobados</p>
                      <p className="text-2xl font-bold text-green-600">
                        {latestAudit.results?.filter((r) => r.status === "pass").length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">No Cumplen</p>
                      <p className="text-2xl font-bold text-red-600">
                        {latestAudit.results?.filter((r) => r.status === "fail").length || 0}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Criteria Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Checklist de Criterios</CardTitle>
                <CardDescription>
                  Evalúa cada criterio y registra el estado de cumplimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {latestAudit.criteria?.map((criterion) => {
                    const result = latestAudit.results?.find(
                      (r) => r.criteriaId === criterion.id
                    );
                    const statusBadge = getStatusBadge(result?.status || "pending");

                    return (
                      <div
                        key={criterion.id}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => openCriterionDialog(criterion.id)}
                      >
                        <div className="flex-shrink-0">
                          {getStatusIcon(result?.status || "pending")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{criterion.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {criterion.description}
                          </p>
                          {result?.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              Notas: {result.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay auditorías en progreso</h3>
              <p className="text-muted-foreground mb-4">
                Inicia una nueva auditoría para evaluar el cumplimiento
              </p>
              <Button onClick={handleStartAudit} disabled={createAuditMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createAuditMutation.isPending ? "Iniciando..." : "Iniciar Auditoría"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCriterionData?.name}</DialogTitle>
              <DialogDescription>{selectedCriterionData?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="notes">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Notas de Evaluación (Opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Agrega observaciones o detalles sobre esta evaluación..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={updateResultMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleUpdateResult("fail")}
                disabled={updateResultMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                No Cumple
              </Button>
              <Button
                onClick={() => handleUpdateResult("pass")}
                disabled={updateResultMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

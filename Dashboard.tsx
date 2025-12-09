import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Award, Leaf, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery();

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Aceptable";
    return "Requiere Atención";
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen general de tu operación
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Alertas de Stock */}
              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Alertas de Stock
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary?.stockAlerts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Productos bajo nivel mínimo
                  </p>
                  {(summary?.stockAlerts || 0) > 0 && (
                    <Badge variant="outline" className="mt-2 status-badge-warning">
                      Requiere atención
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Cumplimiento */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cumplimiento
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getComplianceColor(summary?.complianceScore || 0)}`}>
                    {summary?.complianceScore || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getComplianceStatus(summary?.complianceScore || 0)}
                  </p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        (summary?.complianceScore || 0) >= 80
                          ? "bg-green-500"
                          : (summary?.complianceScore || 0) >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${summary?.complianceScore || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Certificación */}
              <Card className="border-l-4 border-l-cyan">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Certificación
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary?.certificationLevel === 1 && "Bronze"}
                    {summary?.certificationLevel === 2 && "Silver"}
                    {summary?.certificationLevel === 3 && "Gold"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Progreso: {summary?.certificationProgress || 0}%
                  </p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan"
                      style={{ width: `${summary?.certificationProgress || 0}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Impacto Ambiental */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Impacto Ambiental
                  </CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {((summary?.environmentalImpact?.co2Saved || 0) / 1000).toFixed(1)} kg
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CO₂ ahorrado este mes
                  </p>
                  <Badge variant="outline" className="mt-2 status-badge-success">
                    Sostenible
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Detalles adicionales */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Impacto</CardTitle>
                  <CardDescription>
                    Contribución ambiental del mes actual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CO₂ Ahorrado</span>
                    <span className="font-semibold">
                      {((summary?.environmentalImpact?.co2Saved || 0) / 1000).toFixed(2)} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Agua Ahorrada</span>
                    <span className="font-semibold">
                      {summary?.environmentalImpact?.waterSaved || 0} L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Residuos Reducidos</span>
                    <span className="font-semibold">
                      {((summary?.environmentalImpact?.wasteReduced || 0) / 1000).toFixed(2)} kg
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                  <CardDescription>
                    Accesos directos a funciones principales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="/products"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Ver Portafolio</p>
                      <p className="text-xs text-muted-foreground">Explorar productos disponibles</p>
                    </div>
                  </a>
                  <a
                    href="/incidents"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">Reportar Incidente</p>
                      <p className="text-xs text-muted-foreground">Registrar un nuevo incidente</p>
                    </div>
                  </a>
                  <a
                    href="/audit"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Iniciar Auditoría</p>
                      <p className="text-xs text-muted-foreground">Evaluar cumplimiento</p>
                    </div>
                  </a>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

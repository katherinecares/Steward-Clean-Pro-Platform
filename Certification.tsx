import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, CheckCircle, Circle, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Certification() {
  const { data: certStatus, isLoading } = trpc.certification.userStatus.useQuery();

  const getLevelColor = (levelName: string) => {
    const colors = {
      Bronze: "text-orange-700",
      Silver: "text-gray-600",
      Gold: "text-yellow-600",
      Platinum: "text-cyan",
    };
    return colors[levelName as keyof typeof colors] || "text-muted-foreground";
  };

  const getLevelBadgeClass = (levelName: string) => {
    const classes = {
      Bronze: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      Silver: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      Gold: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      Platinum: "bg-cyan/10 text-cyan border-cyan/20",
    };
    return classes[levelName as keyof typeof classes] || "";
  };

  const currentLevel = certStatus?.levels?.find(
    (l) => l.id === certStatus.current?.levelId
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programa de Certificación</h1>
          <p className="text-muted-foreground mt-1">
            Avanza en tu certificación de higiene y seguridad
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Current Status */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Trophy className={`h-6 w-6 ${currentLevel ? getLevelColor(currentLevel.name) : ""}`} />
                      Nivel Actual: {currentLevel?.name || "Sin Certificación"}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {currentLevel?.description || "Comienza tu camino hacia la certificación"}
                    </CardDescription>
                  </div>
                  {currentLevel && (
                    <Badge
                      variant="outline"
                      className={`text-lg px-4 py-2 ${getLevelBadgeClass(currentLevel.name)}`}
                    >
                      {currentLevel.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progreso General</span>
                    <span className="text-sm font-bold text-primary">
                      {certStatus?.current?.progress || 0}%
                    </span>
                  </div>
                  <Progress value={certStatus?.current?.progress || 0} className="h-3" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Puntuación Actual</p>
                    <p className="text-2xl font-bold">
                      {certStatus?.current?.currentScore || 0} pts
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Certificado Desde</p>
                    <p className="text-sm font-medium">
                      {certStatus?.current?.achievedAt
                        ? new Date(certStatus.current.achievedAt).toLocaleDateString("es-CL")
                        : "Sin certificar"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certification Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Certificación</CardTitle>
                <CardDescription>
                  Progresa a través de los diferentes niveles de certificación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certStatus?.levels?.map((level, index) => {
                    const isCurrentLevel = level.id === certStatus.current?.levelId;
                    const isPastLevel = certStatus.current && level.order < (currentLevel?.order || 0);
                    const isFutureLevel = certStatus.current && level.order > (currentLevel?.order || 0);

                    return (
                      <div
                        key={level.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrentLevel
                            ? "border-primary bg-primary/5"
                            : isPastLevel
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isPastLevel
                                ? "bg-green-500 text-white"
                                : isCurrentLevel
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isPastLevel ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : isCurrentLevel ? (
                              <Award className="h-6 w-6" />
                            ) : (
                              <Circle className="h-6 w-6" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`text-lg font-semibold ${getLevelColor(level.name)}`}>
                                {level.name}
                              </h3>
                              {isCurrentLevel && (
                                <Badge variant="outline" className="status-badge-info">
                                  Nivel Actual
                                </Badge>
                              )}
                              {isPastLevel && (
                                <Badge variant="outline" className="status-badge-success">
                                  Completado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {level.description}
                            </p>

                            <div className="grid gap-2 md:grid-cols-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Puntuación mínima:</span>
                                <span className="ml-2 font-semibold">{level.requiredScore} pts</span>
                              </div>
                              {level.benefits && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Beneficios:</span>
                                  <span className="ml-2 font-semibold">
                                    {JSON.parse(level.benefits).length} beneficios
                                  </span>
                                </div>
                              )}
                            </div>

                            {level.benefits && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Beneficios:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {JSON.parse(level.benefits).map((benefit: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Plan de Acción</CardTitle>
                <CardDescription>
                  Pasos recomendados para avanzar en tu certificación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Completa una auditoría</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Evalúa tu cumplimiento actual en todos los criterios
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm">Implementa mejoras</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Trabaja en los criterios que necesitan atención
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm">Solicita re-evaluación</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Una vez completadas las mejoras, solicita una nueva auditoría
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

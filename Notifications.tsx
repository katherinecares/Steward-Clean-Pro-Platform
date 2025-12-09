import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Package, AlertCircle, Award, CheckCircle, Clock, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();

  const getNotificationIcon = (type: string) => {
    const icons = {
      stock_alert: Package,
      restock_recommendation: Package,
      incident_alert: AlertCircle,
      certification_update: Award,
    };
    return icons[type as keyof typeof icons] || MessageSquare;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      stock_alert: "text-yellow-600",
      restock_recommendation: "text-cyan",
      incident_alert: "text-red-600",
      certification_update: "text-primary",
    };
    return colors[type as keyof typeof colors] || "text-muted-foreground";
  };

  const getNotificationLabel = (type: string) => {
    const labels = {
      stock_alert: "Alerta de Stock",
      restock_recommendation: "Recomendación de Reposición",
      incident_alert: "Alerta de Incidente",
      certification_update: "Actualización de Certificación",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pendiente", icon: Clock, className: "status-badge-warning" },
      sent: { label: "Enviado", icon: CheckCircle, className: "status-badge-success" },
      failed: { label: "Fallido", icon: AlertCircle, className: "status-badge-danger" },
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const groupedNotifications = notifications?.reduce((acc, notif) => {
    const date = new Date(notif.createdAt).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Historial de alertas y notificaciones enviadas
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Enviadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications?.filter((n) => n.status === "sent").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Notificaciones exitosas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {notifications?.filter((n) => n.type === "stock_alert").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Productos críticos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notifications?.filter((n) => n.type === "incident_alert").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reportes de incidentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Certificación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {notifications?.filter((n) => n.type === "certification_update").length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Actualizaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Notificaciones</CardTitle>
            <CardDescription>
              Todas las notificaciones enviadas a través de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : groupedNotifications && Object.keys(groupedNotifications).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedNotifications).map(([date, notifs]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                    <div className="space-y-3">
                      {notifs.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const iconColor = getNotificationColor(notification.type);
                        const statusBadge = getStatusBadge(notification.status);
                        const StatusIcon = statusBadge.icon;

                        return (
                          <div
                            key={notification.id}
                            className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <div
                              className={`h-12 w-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ${iconColor}`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {getNotificationLabel(notification.type)}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                </div>
                                <Badge variant="outline" className={statusBadge.className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusBadge.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleTimeString("es-CL", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {notification.sentAt && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Send className="h-3 w-3" />
                                    Enviado a las{" "}
                                    {new Date(notification.sentAt).toLocaleTimeString("es-CL", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
                <p className="text-muted-foreground">
                  Las notificaciones aparecerán aquí cuando se generen alertas automáticas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-l-4 border-l-cyan">
          <CardHeader>
            <CardTitle className="text-lg">Acerca de las Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Las notificaciones de WhatsApp se envían automáticamente cuando:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Un producto alcanza su nivel de stock crítico</li>
              <li>Se genera una recomendación de reposición</li>
              <li>Se reporta un incidente de higiene o seguridad</li>
              <li>Hay actualizaciones en tu nivel de certificación</li>
            </ul>
            <p className="mt-4">
              Todas las notificaciones quedan registradas en este historial para tu referencia.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Package, 
  TrendingUp, 
  Shield, 
  Bell, 
  Award, 
  ClipboardCheck,
  AlertTriangle,
  Leaf,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2B49] via-[#1A2B49] to-[#00B8D9]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1A2B49]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B8D9] to-[#4CAF50] rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Steward Clean Pro</h1>
              <p className="text-xs text-gray-300">Plataforma Integral de Gestión</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white">
                  Iniciar Sesión
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#4CAF50]/20 text-[#4CAF50] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            Sostenibilidad y Cumplimiento
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Gestión Integral para el
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00B8D9] to-[#4CAF50]">
              Sector HORECA
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Plataforma profesional de gestión de productos de limpieza y sanitización con enfoque en cumplimiento normativo, trazabilidad y certificación.
          </p>
          {!isAuthenticated && (
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white text-lg px-8 py-6">
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00B8D9] to-[#00B8D9]/70 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Portafolio de Productos</h3>
              <p className="text-gray-300 text-sm">
                Gestión completa de productos con categorías, certificaciones y control de stock en tiempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-[#4CAF50]/70 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reposición Predictiva</h3>
              <p className="text-gray-300 text-sm">
                Detección automática de niveles críticos y análisis de tendencias de consumo.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00B8D9] to-[#4CAF50] rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Dashboard del Cliente</h3>
              <p className="text-gray-300 text-sm">
                Indicadores de cumplimiento, alertas de stock y métricas de impacto ambiental.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reporte de Incidentes</h3>
              <p className="text-gray-300 text-sm">
                Sistema de captura con ubicación, descripción y evidencia fotográfica.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Notificaciones WhatsApp</h3>
              <p className="text-gray-300 text-sm">
                Alertas automáticas de stock crítico y recomendaciones de reposición.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Certificación</h3>
              <p className="text-gray-300 text-sm">
                Programa de certificación progresivo con niveles Bronze, Silver y Gold.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Auditoría y Cumplimiento</h3>
              <p className="text-gray-300 text-sm">
                Checklist integral con sistema de semáforo visual y seguimiento en tiempo real.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Impacto Ambiental</h3>
              <p className="text-gray-300 text-sm">
                Métricas de sostenibilidad con seguimiento de CO₂, agua y residuos reducidos.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            ¿Por qué elegir Steward Clean Pro?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Cumplimiento Normativo</h4>
                <p className="text-gray-300 text-sm">
                  Sistema integral de auditoría y certificación que garantiza el cumplimiento de normativas de higiene y seguridad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Trazabilidad Completa</h4>
                <p className="text-gray-300 text-sm">
                  Seguimiento detallado de productos, incidentes y auditorías con historial completo y reportes automáticos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Gestión Inteligente</h4>
                <p className="text-gray-300 text-sm">
                  Reposición predictiva basada en análisis de consumo y alertas automáticas de stock crítico.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Sostenibilidad</h4>
                <p className="text-gray-300 text-sm">
                  Métricas de impacto ambiental con seguimiento de CO₂, agua ahorrada y residuos reducidos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Comienza a gestionar tu operación hoy
            </h3>
            <p className="text-gray-300 mb-8">
              Accede a la plataforma completa de gestión integral para el sector HORECA
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white text-lg px-8 py-6">
                Acceder a la Plataforma
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#1A2B49]/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00B8D9] to-[#4CAF50] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Steward Clean Pro</p>
                <p className="text-xs text-gray-400">Plataforma Integral de Gestión</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                Desarrollado por <span className="font-semibold text-[#00B8D9]">Katherine Cares</span>
              </p>
              <p className="text-gray-400 text-xs mt-1">
                © 2024 Steward Clean Pro. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

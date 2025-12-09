import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Package, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories, isLoading: loadingCategories } = trpc.products.categories.useQuery();
  const { data: products, isLoading: loadingProducts } = trpc.products.list.useQuery();

  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(cents / 100);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin stock", variant: "destructive" as const };
    if (stock <= minStock) return { label: "Stock bajo", variant: "outline" as const, className: "status-badge-warning" };
    return { label: "Disponible", variant: "outline" as const, className: "status-badge-success" };
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portafolio de Productos</h1>
          <p className="text-muted-foreground mt-1">
            Explora nuestro catálogo completo de productos certificados
          </p>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories tabs */}
        {loadingCategories ? (
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setSelectedCategory(null)}>
                Todos
              </TabsTrigger>
              {categories?.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.slug}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Products grid */}
        {loadingProducts ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStock);
              const certifications = product.certifications
                ? JSON.parse(product.certifications)
                : [];

              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription className="mt-1">
                          SKU: {product.sku}
                        </CardDescription>
                      </div>
                      <Badge {...stockStatus}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {certifications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Certificaciones:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {certifications.map((cert: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs status-badge-info"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Precio</p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="text-lg font-semibold">
                          {product.stock} {product.unit}
                        </p>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Package className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

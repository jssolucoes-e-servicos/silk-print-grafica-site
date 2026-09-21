import React, { useState, useEffect } from 'react';
import { AdminERPPage } from './components/pages/AdminERPPage';
import { Product, Category } from './types';
import { getCatalog } from './lib/api';

export default function App() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCatalog = async () => {
    try {
      setIsLoading(true);
      const data = await getCatalog();
      if (data) {
        if (data.products && Array.isArray(data.products)) {
          setProductsList(data.products);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
      }
    } catch (err) {
      console.warn('[Silk ERP] Erro ao carregar catálogo da API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCatalog();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans">
      <AdminERPPage
        onBackToStore={() => {
          const storeUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STORE_URL) || 'https://silkprint.com.br';
          window.open(storeUrl, '_blank');
        }}
        products={productsList}
        categories={categoriesList}
        onRefreshCatalog={refreshCatalog}
      />
    </div>
  );
}

import { getDbPool } from './db.js';
import { 
  catalogState, 
  suppliersState, 
  collaboratorsState, 
  customersState, 
  ordersLog as ordersState,
  createId
} from './catalogData.js';
import { Category, Product, Order } from '../types/index.js';
import catalogJson from '../data/catalog.json';



/**
 * Seed initial catalog data to PostgreSQL if tables are empty
 */
export async function seedPostgresCatalogIfEmpty() {
  const pool = getDbPool();
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      // 1. Check categories
      const { rows: catRows } = await client.query('SELECT COUNT(*) as count FROM categories');
      if (parseInt(catRows[0].count, 10) === 0) {
        console.log('[PostgreSQL] Seeding default categories to database...');
        for (const cat of catalogState.categories) {
          await client.query(
            `INSERT INTO categories (id, name, slug, icon, "count", description)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (slug) DO NOTHING`,
            [cat.id, cat.name, cat.slug, cat.icon || '', cat.count || '', cat.description || '']
          );
        }
      }

      // 2. Check products
      const { rows: prodRows } = await client.query('SELECT COUNT(*) as count FROM products');
      if (parseInt(prodRows[0].count, 10) === 0) {
        console.log('[PostgreSQL] Seeding default products to database...');
        for (const prod of catalogState.products) {
          await client.query(
            `INSERT INTO products (
              id, slug, name, category, category_slug, short_description, description,
              base_price, image, badge, popular, production_time_hours, formats,
              default_format, papers, color_modes, finishes, quantities, bleed_specs, gabaritos
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            ) ON CONFLICT (slug) DO NOTHING`,
            [
              prod.id,
              prod.slug,
              prod.name,
              prod.category,
              prod.categorySlug,
              prod.shortDescription || '',
              prod.description || '',
              prod.basePrice,
              prod.image,
              prod.badge || '',
              Boolean(prod.popular),
              prod.productionTimeHours || 24,
              JSON.stringify(prod.formats || []),
              prod.defaultFormat || 'Padrão',
              JSON.stringify(prod.papers || []),
              JSON.stringify(prod.colorModes || []),
              JSON.stringify(prod.finishes || []),
              JSON.stringify(prod.quantities || []),
              JSON.stringify(prod.bleedSpecs || {}),
              JSON.stringify(prod.gabaritos || [])
            ]
          );
        }
      }

      // 3. Check pickup_points
      const { rows: pickRows } = await client.query('SELECT COUNT(*) as count FROM pickup_points');
      if (parseInt(pickRows[0].count, 10) === 0 && catalogState.pickupPoints?.length > 0) {
        console.log('[PostgreSQL] Seeding pickup points to database...');
        for (const p of catalogState.pickupPoints) {
          await client.query(
            `INSERT INTO pickup_points (id, name, state, city, neighborhood, address, cep, opening_hours, price)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING`,
            [p.id, p.name, p.state, p.city, p.neighborhood || '', p.address, p.cep, p.openingHours || '', p.price || 0]
          );
        }
      }

      // 4. Check coupons
      const { rows: coupRows } = await client.query('SELECT COUNT(*) as count FROM coupons');
      if (parseInt(coupRows[0].count, 10) === 0 && catalogState.coupons?.length > 0) {
        console.log('[PostgreSQL] Seeding coupons to database...');
        for (const c of catalogState.coupons) {
          await client.query(
            `INSERT INTO coupons (id, code, discount_percent, free_shipping, description, min_spend, active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (code) DO NOTHING`,
            [c.id || createId(), c.code, c.discountPercent, Boolean(c.freeShipping), c.description || '', c.minSpend || 0, c.active !== false]
          );
        }
      }

      console.log('[PostgreSQL] Seed check completed successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[PostgreSQL] Seed verification note (safe fallback active):', err);
    return false;
  }
}

// -------------------------------------------------------------
// POSTGRESQL ASYNC DATA SERVICE with memory fallback
// -------------------------------------------------------------

export async function dbGetAllCategories(): Promise<Category[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
      return (rows || []).map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        icon: r.icon || 'Folder',
        count: r.count || '0 itens',
        description: r.description || ''
      }));
    } catch (e) {
      console.warn('[Postgres DB] getCategories error:', e);
      return [];
    }
  }
  return [];
}

export async function dbCreateCategory(cat: { name: string; description?: string; icon?: string; count?: string }): Promise<Category> {
  const slug = cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  const newCat: Category = {
    id: createId(),
    name: cat.name,
    slug,
    icon: cat.icon || 'Folder',
    count: cat.count || '0 itens',
    description: cat.description || ''
  };

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO categories (id, name, slug, icon, "count", description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
        [newCat.id, newCat.name, newCat.slug, newCat.icon, newCat.count, newCat.description]
      );
    } catch (e) {
      console.error('[Postgres DB] createCategory error:', e);
    }
  }

  // Also maintain memory cache
  const idx = catalogState.categories.findIndex(c => c.slug === slug);
  if (idx >= 0) catalogState.categories[idx] = newCat;
  else catalogState.categories.push(newCat);

  return newCat;
}

export async function dbDeleteCategory(id: string): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM categories WHERE id = $1 OR slug = $1', [id]);
    } catch (e) {
      console.error('[Postgres DB] deleteCategory error:', e);
    }
  }
  catalogState.categories = catalogState.categories.filter(c => c.id !== id && c.slug !== id);
  return true;
}

export async function dbGetAllProducts(): Promise<Product[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM products ORDER BY popular DESC, name ASC');
      return (rows || []).map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        category: r.category,
        categorySlug: r.category_slug,
        shortDescription: r.short_description || '',
        description: r.description || '',
        basePrice: Number(r.base_price),
        image: r.image || '',
        badge: r.badge || '',
        popular: Boolean(r.popular),
        productionTimeHours: Number(r.production_time_hours) || 24,
        formats: typeof r.formats === 'string' ? JSON.parse(r.formats) : (r.formats || ['Padrão']),
        defaultFormat: r.default_format || 'Padrão',
        papers: typeof r.papers === 'string' ? JSON.parse(r.papers) : (r.papers || []),
        colorModes: typeof r.color_modes === 'string' ? JSON.parse(r.color_modes) : (r.color_modes || []),
        finishes: typeof r.finishes === 'string' ? JSON.parse(r.finishes) : (r.finishes || []),
        quantities: typeof r.quantities === 'string' ? JSON.parse(r.quantities) : (r.quantities || []),
        bleedSpecs: typeof r.bleed_specs === 'string' ? JSON.parse(r.bleed_specs) : (r.bleed_specs || { bleedMm: 2, safetyMarginMm: 3, dpi: 300, colorSpace: 'CMYK' }),
        gabaritos: typeof r.gabaritos === 'string' ? JSON.parse(r.gabaritos) : (r.gabaritos || [])
      }));
    } catch (e) {
      console.warn('[Postgres DB] getProducts error:', e);
      return [];
    }
  }
  return [];
}

export async function dbUpdateProduct(id: string, p: Partial<Product>): Promise<Product | null> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1 OR slug = $1', [id]);
      if (rows.length === 0) return null;
      const current = rows[0];
      const updatedSlug = p.slug || current.slug;
      const updatedName = p.name ?? current.name;
      const updatedCategory = p.category ?? current.category;
      const updatedCategorySlug = p.categorySlug ?? current.category_slug;
      const updatedBasePrice = p.basePrice !== undefined ? Number(p.basePrice) : Number(current.base_price);
      const updatedImage = p.image ?? current.image;
      const updatedDesc = p.description ?? current.description;
      const updatedShortDesc = p.shortDescription ?? current.short_description;
      const updatedPopular = p.popular !== undefined ? Boolean(p.popular) : Boolean(current.popular);
      const updatedTime = p.productionTimeHours !== undefined ? Number(p.productionTimeHours) : current.production_time_hours;
      const updatedFormats = p.formats ? JSON.stringify(p.formats) : (typeof current.formats === 'string' ? current.formats : JSON.stringify(current.formats || []));
      const updatedPapers = p.papers ? JSON.stringify(p.papers) : (typeof current.papers === 'string' ? current.papers : JSON.stringify(current.papers || []));
      const updatedFinishes = p.finishes ? JSON.stringify(p.finishes) : (typeof current.finishes === 'string' ? current.finishes : JSON.stringify(current.finishes || []));
      const updatedQuantities = p.quantities ? JSON.stringify(p.quantities) : (typeof current.quantities === 'string' ? current.quantities : JSON.stringify(current.quantities || []));

      await pool.query(
        `UPDATE products SET
          name = $1, slug = $2, category = $3, category_slug = $4, base_price = $5,
          image = $6, description = $7, short_description = $8, popular = $9,
          production_time_hours = $10, formats = $11, papers = $12, finishes = $13,
          quantities = $14, updated_at = NOW()
         WHERE id = $15 OR slug = $15`,
        [
          updatedName, updatedSlug, updatedCategory, updatedCategorySlug, updatedBasePrice,
          updatedImage, updatedDesc, updatedShortDesc, updatedPopular,
          updatedTime, updatedFormats, updatedPapers, updatedFinishes,
          updatedQuantities, id
        ]
      );

      const updatedProd: Product = {
        ...current,
        ...p,
        id: current.id,
        slug: updatedSlug,
        name: updatedName,
        category: updatedCategory,
        categorySlug: updatedCategorySlug,
        basePrice: updatedBasePrice,
        image: updatedImage,
        description: updatedDesc,
        shortDescription: updatedShortDesc,
        popular: updatedPopular,
        productionTimeHours: updatedTime
      };

      const idx = catalogState.products.findIndex(pr => pr.id === id || pr.slug === id);
      if (idx >= 0) catalogState.products[idx] = updatedProd;

      return updatedProd;
    } catch (e) {
      console.error('[Postgres DB] updateProduct error:', e);
    }
  }
  return null;
}

export async function dbCreateProduct(p: any): Promise<Product> {
  const slug = p.slug || p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
  const product: Product = {
    ...p,
    id: p.id || createId(),
    slug,
    basePrice: Number(p.basePrice) || 0,
    formats: p.formats || ['Padrão'],
    defaultFormat: p.defaultFormat || 'Padrão',
    papers: p.papers || [],
    colorModes: p.colorModes || [],
    finishes: p.finishes || [],
    quantities: p.quantities || [],
    bleedSpecs: p.bleedSpecs || { bleedMm: 1.5, safetyMarginMm: 3, dpi: 300, colorSpace: 'CMYK' },
    gabaritos: p.gabaritos || []
  };

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO products (
          id, slug, name, category, category_slug, short_description, description,
          base_price, image, badge, popular, production_time_hours, formats,
          default_format, papers, color_modes, finishes, quantities, bleed_specs, gabaritos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          base_price = EXCLUDED.base_price,
          image = EXCLUDED.image,
          description = EXCLUDED.description,
          updated_at = NOW()`,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          product.categorySlug,
          product.shortDescription || '',
          product.description || '',
          product.basePrice,
          product.image,
          product.badge || '',
          Boolean(product.popular),
          product.productionTimeHours || 24,
          JSON.stringify(product.formats),
          product.defaultFormat,
          JSON.stringify(product.papers),
          JSON.stringify(product.colorModes),
          JSON.stringify(product.finishes),
          JSON.stringify(product.quantities),
          JSON.stringify(product.bleedSpecs),
          JSON.stringify(product.gabaritos)
        ]
      );
    } catch (e) {
      console.error('[Postgres DB] createProduct error:', e);
    }
  }

  // Memory sync
  const idx = catalogState.products.findIndex(pr => pr.id === product.id || pr.slug === product.slug);
  if (idx >= 0) catalogState.products[idx] = product;
  else catalogState.products.push(product);

  return product;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM products WHERE id = $1 OR slug = $1', [id]);
    } catch (e) {
      console.error('[Postgres DB] deleteProduct error:', e);
    }
  }
  catalogState.products = catalogState.products.filter(p => p.id !== id && p.slug !== id);
  return true;
}

export async function dbDuplicateProduct(id: string): Promise<Product | null> {
  const products = await dbGetAllProducts();
  const existing = products.find(p => p.id === id || p.slug === id);
  if (!existing) return null;

  const newId = createId();
  const timestamp = Date.now().toString().slice(-4);
  const newSlug = `${existing.slug}-copia-${timestamp}`;
  const duplicated: Product = {
    ...existing,
    id: newId,
    slug: newSlug,
    name: `${existing.name} (Cópia)`,
    popular: false,
  };
  return await dbCreateProduct(duplicated);
}

export async function dbClearAllCatalog(): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM products');
      await pool.query('DELETE FROM categories');
    } catch (e) {
      console.error('[Postgres DB] clearAllCatalog error:', e);
    }
  }
  catalogState.products = [];
  catalogState.categories = [];
  return true;
}

export async function dbResetSeedCatalog(): Promise<boolean> {
  await dbClearAllCatalog();
  const pool = getDbPool();
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        for (const cat of (catalogJson as any).categories) {
          await client.query(
            `INSERT INTO categories (id, name, slug, icon, "count", description)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (slug) DO NOTHING`,
            [cat.id, cat.name, cat.slug, cat.icon || '', cat.count || '', cat.description || '']
          );
        }
        for (const prod of (catalogJson as any).products) {
          await client.query(
            `INSERT INTO products (
              id, slug, name, category, category_slug, short_description, description,
              base_price, image, badge, popular, production_time_hours, formats,
              default_format, papers, color_modes, finishes, quantities, bleed_specs, gabaritos
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            ) ON CONFLICT (slug) DO NOTHING`,
            [
              prod.id,
              prod.slug,
              prod.name,
              prod.category,
              prod.categorySlug,
              prod.shortDescription || '',
              prod.description || '',
              prod.basePrice,
              prod.image,
              prod.badge || '',
              Boolean(prod.popular),
              prod.productionTimeHours || 24,
              JSON.stringify(prod.formats || []),
              prod.defaultFormat || 'Padrão',
              JSON.stringify(prod.papers || []),
              JSON.stringify(prod.colorModes || []),
              JSON.stringify(prod.finishes || []),
              JSON.stringify(prod.quantities || []),
              JSON.stringify(prod.bleedSpecs || {}),
              JSON.stringify(prod.gabaritos || [])
            ]
          );
        }
      } finally {
        client.release();
      }
    } catch (e) {
      console.error('[Postgres DB] resetSeedCatalog error:', e);
    }
  }
  catalogState.products = [...(catalogJson as any).products];
  catalogState.categories = [...(catalogJson as any).categories];
  return true;
}

// -------------------------------------------------------------
// ORDERS DB REPOSITORY
// -------------------------------------------------------------

export async function dbGetAllOrders(): Promise<Order[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');
      return (rows || []).map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        status: r.status,
        customer: typeof r.customer === 'string' ? JSON.parse(r.customer) : r.customer,
        shipping: typeof r.shipping === 'string' ? JSON.parse(r.shipping) : r.shipping,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        payment: typeof r.payment === 'string' ? JSON.parse(r.payment) : r.payment,
        couponApplied: r.coupon_applied,
        timeline: typeof r.timeline === 'string' ? JSON.parse(r.timeline) : r.timeline,
        paymentId: r.payment_id,
        mercadoPagoStatus: r.mercado_pago_status,
        qrCodePix: r.qr_code_pix,
        qrCodePixBase64: r.qr_code_pix_base64
      }));
    } catch (e) {
      console.warn('[Postgres DB] getOrders error:', e);
    }
  }
  return ordersState;
}

export async function dbSaveOrder(order: Order): Promise<Order> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO orders (
          id, timestamp, status, customer, shipping, items, payment,
          coupon_applied, timeline, payment_id, mercado_pago_status, qr_code_pix, qr_code_pix_base64
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          timeline = EXCLUDED.timeline,
          updated_at = NOW()`,
        [
          order.id,
          order.timestamp,
          order.status,
          JSON.stringify(order.customer),
          JSON.stringify(order.shipping),
          JSON.stringify(order.items),
          JSON.stringify(order.payment),
          order.couponApplied || null,
          JSON.stringify(order.timeline),
          order.paymentId || null,
          order.mercadoPagoStatus || null,
          order.qrCodePix || null,
          order.qrCodePixBase64 || null
        ]
      );
    } catch (e) {
      console.error('[Postgres DB] saveOrder error:', e);
    }
  }

  // Memory sync
  const idx = ordersState.findIndex(o => o.id === order.id);
  if (idx >= 0) ordersState[idx] = order;
  else ordersState.unshift(order);

  return order;
}

export async function dbUpdateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT timeline FROM orders WHERE id = $1', [orderId]);
      let timeline = [];
      if (rows.length > 0 && rows[0].timeline) {
        timeline = typeof rows[0].timeline === 'string' ? JSON.parse(rows[0].timeline) : rows[0].timeline;
      }
      timeline.push({
        status,
        timestamp: new Date().toISOString(),
        description: `Status atualizado para ${status.replace('_', ' ')}`
      });

      await pool.query(
        'UPDATE orders SET status = $1, timeline = $2, updated_at = NOW() WHERE id = $3',
        [status, JSON.stringify(timeline), orderId]
      );
    } catch (e) {
      console.error('[Postgres DB] updateOrderStatus error:', e);
    }
  }

  // Memory sync
  const order = ordersState.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.timeline.push({
      step: `Atualização: ${status}`,
      description: `Status atualizado no ERP para ${status}`,
      done: true,
      timestamp: new Date().toISOString()
    });
    return order;
  }
  return null;
}


// -------------------------------------------------------------
// SUPPLIERS, COLLABORATORS, CUSTOMERS DB REPOSITORIES
// -------------------------------------------------------------

export async function dbGetSuppliers(): Promise<any[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
      return (rows || []).map(r => ({
        id: r.id,
        name: r.name,
        tradeName: r.trade_name,
        cnpj: r.cnpj,
        email: r.email,
        phone: r.phone,
        category: r.category,
        notes: r.notes,
        city: r.city,
        state: r.state
      }));
    } catch (e) {
      console.warn('[Postgres DB] getSuppliers error:', e);
    }
  }
  return suppliersState;
}

export async function dbCreateSupplier(sup: any): Promise<any> {
  const newSup = { ...sup, id: sup.id || createId() };
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO suppliers (id, name, trade_name, cnpj, email, phone, category, notes, city, state)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone`,
        [newSup.id, newSup.name, newSup.tradeName || '', newSup.cnpj || '', newSup.email, newSup.phone, newSup.category, newSup.notes || '', newSup.city || '', newSup.state || '']
      );
    } catch (e) {
      console.error('[Postgres DB] createSupplier error:', e);
    }
  }
  suppliersState.unshift(newSup);
  return newSup;
}

export async function dbDeleteSupplier(id: string): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    } catch (e) {
      console.error('[Postgres DB] deleteSupplier error:', e);
    }
  }
  const idx = suppliersState.findIndex(s => s.id === id);
  if (idx >= 0) suppliersState.splice(idx, 1);
  return true;
}

export async function dbGetCollaborators(): Promise<any[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM collaborators WHERE active = true ORDER BY name ASC');
      return (rows || []).map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        phone: r.phone,
        active: r.active
      }));
    } catch (e) {
      console.warn('[Postgres DB] getCollaborators error:', e);
    }
  }
  return collaboratorsState;
}

export async function dbCreateCollaborator(col: any): Promise<any> {
  const newCol = { ...col, id: col.id || createId(), active: true };
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO collaborators (id, name, email, role, phone, active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name, role = EXCLUDED.role, phone = EXCLUDED.phone, active = true`,
        [newCol.id, newCol.name, newCol.email, newCol.role, newCol.phone || '', true]
      );
    } catch (e) {
      console.error('[Postgres DB] createCollaborator error:', e);
    }
  }
  collaboratorsState.unshift(newCol);
  return newCol;
}

export async function dbDeleteCollaborator(id: string): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('UPDATE collaborators SET active = false WHERE id = $1', [id]);
    } catch (e) {
      console.error('[Postgres DB] deleteCollaborator error:', e);
    }
  }
  const idx = collaboratorsState.findIndex(c => c.id === id);
  if (idx >= 0) collaboratorsState.splice(idx, 1);
  return true;
}

export async function dbGetCustomers(): Promise<any[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM customers ORDER BY total_spent DESC');
      return (rows || []).map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        document: r.document,
        companyName: r.company_name,
        totalOrders: Number(r.total_orders),
        totalSpent: Number(r.total_spent),
        lastOrderAt: r.last_order_at
      }));
    } catch (e) {
      console.warn('[Postgres DB] getCustomers error:', e);
    }
  }
  return customersState;
}

export async function dbGetPickupPoints(): Promise<any[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM pickup_points ORDER BY state ASC, city ASC');
      if (Array.isArray(rows)) {
        return rows.map(r => ({
          id: r.id,
          name: r.name,
          state: r.state,
          city: r.city,
          neighborhood: r.neighborhood || '',
          address: r.address,
          cep: r.cep || '',
          openingHours: r.opening_hours || '',
          price: Number(r.price) || 0,
          phone: r.phone || '',
          contactName: r.contact_name || '',
          notes: r.notes || '',
          active: r.active !== false
        }));
      }
    } catch (e) {
      console.warn('[Postgres DB] getPickupPoints error:', e);
    }
  }
  return catalogState.pickupPoints || [];
}

export async function dbSavePickupPoint(p: any): Promise<any> {
  const newP = {
    id: p.id || createId(),
    name: p.name,
    state: p.state,
    city: p.city,
    neighborhood: p.neighborhood || '',
    address: p.address,
    cep: p.cep || '',
    openingHours: p.openingHours || '',
    price: Number(p.price) || 0,
    phone: p.phone || '',
    contactName: p.contactName || '',
    notes: p.notes || '',
    active: p.active !== false
  };
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO pickup_points (id, name, state, city, neighborhood, address, cep, opening_hours, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, state = EXCLUDED.state, city = EXCLUDED.city,
           neighborhood = EXCLUDED.neighborhood, address = EXCLUDED.address,
           cep = EXCLUDED.cep, opening_hours = EXCLUDED.opening_hours, price = EXCLUDED.price`,
        [newP.id, newP.name, newP.state, newP.city, newP.neighborhood, newP.address, newP.cep, newP.openingHours, newP.price]
      );
    } catch (e) {
      console.error('[Postgres DB] savePickupPoint error:', e);
    }
  }

  // Sync in-memory catalogState
  if (!catalogState.pickupPoints) {
    catalogState.pickupPoints = [];
  }
  const existingIdx = catalogState.pickupPoints.findIndex(pt => pt.id === newP.id);
  if (existingIdx >= 0) {
    catalogState.pickupPoints[existingIdx] = { ...catalogState.pickupPoints[existingIdx], ...newP };
  } else {
    catalogState.pickupPoints.push(newP);
  }

  return newP;
}

export async function dbDeletePickupPoint(id: string): Promise<boolean> {
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM pickup_points WHERE id = $1', [String(id)]);
    } catch (e) {
      console.error('[Postgres DB] deletePickupPoint error:', e);
    }
  }
  if (catalogState.pickupPoints) {
    catalogState.pickupPoints = catalogState.pickupPoints.filter(pt => String(pt.id) !== String(id));
  }
  return true;
}

export async function dbGetCoupons(): Promise<any[]> {
  const pool = getDbPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM coupons ORDER BY code ASC');
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          id: r.id,
          code: r.code,
          discountPercent: Number(r.discount_percent),
          freeShipping: Boolean(r.free_shipping),
          description: r.description,
          minSpend: Number(r.min_spend),
          active: Boolean(r.active)
        }));
      }
    } catch (e) {
      console.warn('[Postgres DB] getCoupons error:', e);
    }
  }
  return catalogState.coupons || [];
}

export async function dbSaveCoupon(c: any): Promise<any> {
  const newC = {
    id: c.id || createId(),
    code: c.code.toUpperCase().trim(),
    discountPercent: Number(c.discountPercent) || 0,
    freeShipping: Boolean(c.freeShipping),
    description: c.description || '',
    minSpend: Number(c.minSpend) || 0,
    active: c.active !== false
  };
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO coupons (id, code, discount_percent, free_shipping, description, min_spend, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (code) DO UPDATE SET
           discount_percent = EXCLUDED.discount_percent,
           free_shipping = EXCLUDED.free_shipping,
           description = EXCLUDED.description,
           min_spend = EXCLUDED.min_spend,
           active = EXCLUDED.active`,
        [newC.id, newC.code, newC.discountPercent, newC.freeShipping, newC.description, newC.minSpend, newC.active]
      );
    } catch (e) {
      console.error('[Postgres DB] saveCoupon error:', e);
    }
  }

  // Keep in-memory catalogState in sync
  if (!catalogState.coupons) {
    catalogState.coupons = [];
  }
  const existingIdx = catalogState.coupons.findIndex(item => item.id === newC.id || item.code === newC.code);
  if (existingIdx >= 0) {
    catalogState.coupons[existingIdx] = { ...catalogState.coupons[existingIdx], ...newC };
  } else {
    catalogState.coupons.push(newC);
  }

  return newC;
}

export async function dbDeleteCoupon(id: string): Promise<boolean> {
  const cleanId = decodeURIComponent(id).trim();
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM coupons WHERE id = $1 OR UPPER(code) = UPPER($1) OR code = $1', [cleanId]);
    } catch (e) {
      console.error('[Postgres DB] deleteCoupon error:', e);
    }
  }
  if (catalogState.coupons) {
    catalogState.coupons = catalogState.coupons.filter(
      c => c.id !== cleanId && c.code?.toUpperCase() !== cleanId.toUpperCase()
    );
  }
  return true;
}

export async function dbCreateOrUpdateCustomer(cust: any): Promise<any> {
  const pool = getDbPool();
  const id = createId();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO customers (id, name, email, phone, document, company_name, total_orders, total_spent, last_order_at)
         VALUES ($1, $2, $3, $4, $5, $6, 1, $7, NOW())
         ON CONFLICT (email) DO UPDATE SET
           total_orders = customers.total_orders + 1,
           total_spent = customers.total_spent + EXCLUDED.total_spent,
           last_order_at = NOW(),
           phone = EXCLUDED.phone`,
        [id, cust.name, cust.email, cust.phone, cust.document, cust.companyName || '', cust.orderTotal || 0]
      );
    } catch (e) {
      console.error('[Postgres DB] createOrUpdateCustomer error:', e);
    }
  }

  // Memory fallback
  const existing = customersState.find(c => c.email === cust.email);
  if (existing) {
    existing.totalOrders += 1;
    existing.totalSpent += (cust.orderTotal || 0);
    existing.lastOrderAt = new Date().toISOString();
    return existing;
  }
  const newC = {
    id,
    name: cust.name,
    email: cust.email,
    phone: cust.phone,
    document: cust.document,
    companyName: cust.companyName || '',
    totalOrders: 1,
    totalSpent: cust.orderTotal || 0,
    lastOrderAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  customersState.unshift(newC);
  return newC;
}

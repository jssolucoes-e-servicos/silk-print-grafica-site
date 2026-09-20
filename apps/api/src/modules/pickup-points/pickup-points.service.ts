import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class PickupPointsService {
  private readonly logger = new Logger(PickupPointsService.name);
  private memoryPoints: any[] = [
    {
      id: 'sp_se_centro',
      name: 'Balcão Sé - Centro SP',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Sé',
      address: 'Praça da Sé, 120 - Box 4',
      cep: '01001-000',
      openingHours: 'Seg a Sex: 08:30 às 18:00',
      price: 0,
      phone: '(11) 3105-0000',
      contactName: 'Carlos',
      active: true,
    },
    {
      id: 'sp_paulista',
      name: 'Balcão Paulista / Consolação',
      state: 'SP',
      city: 'São Paulo',
      neighborhood: 'Bela Vista',
      address: 'Av. Paulista, 1578 - Subsolo',
      cep: '01310-200',
      openingHours: 'Seg a Sex: 09:00 às 19:00',
      price: 0,
      phone: '(11) 3284-0000',
      contactName: 'Renata',
      active: true,
    },
    {
      id: 'rj_centro',
      name: 'Balcão Rio Branco - Centro RJ',
      state: 'RJ',
      city: 'Rio de Janeiro',
      neighborhood: 'Centro',
      address: 'Av. Rio Branco, 156 - Sobreloja',
      cep: '20040-006',
      openingHours: 'Seg a Sex: 09:00 às 18:00',
      price: 0,
      phone: '(21) 2220-0000',
      contactName: 'Marcos',
      active: true,
    },
  ];

  constructor(private db: DatabaseService) {}

  async getAll(filter?: { state?: string; search?: string }) {
    if (this.db.isDatabaseConnected()) {
      try {
        const res = await this.db.query('SELECT * FROM pickup_points ORDER BY state ASC, city ASC');
        if (res && Array.isArray(res.rows)) {
          let list = res.rows.map(r => ({
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
            active: r.active !== false,
          }));

          if (filter?.state && filter.state !== 'TODOS') {
            list = list.filter(b => b.state.toUpperCase() === filter.state?.toUpperCase());
          }
          if (filter?.search) {
            const q = filter.search.toLowerCase();
            list = list.filter(b => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q));
          }
          return list;
        }
      } catch (err: any) {
        this.logger.warn(`Erro listando pickup_points do PostgreSQL: ${err?.message}`);
      }
    }

    let list = [...this.memoryPoints];
    if (filter?.state && filter.state !== 'TODOS') {
      list = list.filter(b => b.state.toUpperCase() === filter.state?.toUpperCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.city.toLowerCase().includes(q));
    }
    return list;
  }

  async save(data: any) {
    const id = data.id || `pt_${Date.now()}`;
    const point = {
      id,
      name: data.name,
      state: data.state || 'SP',
      city: data.city,
      neighborhood: data.neighborhood || '',
      address: data.address,
      cep: data.cep || '',
      openingHours: data.openingHours || 'Seg a Sex: 09h às 18h',
      price: Number(data.price) || 0,
      phone: data.phone || '',
      contactName: data.contactName || '',
      notes: data.notes || '',
      active: data.active !== false,
    };

    if (this.db.isDatabaseConnected()) {
      try {
        await this.db.query(
          `INSERT INTO pickup_points (id, name, state, city, neighborhood, address, cep, opening_hours, price, phone, contact_name, notes, active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             state = EXCLUDED.state,
             city = EXCLUDED.city,
             neighborhood = EXCLUDED.neighborhood,
             address = EXCLUDED.address,
             cep = EXCLUDED.cep,
             opening_hours = EXCLUDED.opening_hours,
             price = EXCLUDED.price,
             phone = EXCLUDED.phone,
             contact_name = EXCLUDED.contact_name,
             notes = EXCLUDED.notes,
             active = EXCLUDED.active`,
          [
            point.id,
            point.name,
            point.state,
            point.city,
            point.neighborhood,
            point.address,
            point.cep,
            point.openingHours,
            point.price,
            point.phone,
            point.contactName,
            point.notes,
            point.active,
          ],
        );
      } catch (err: any) {
        this.logger.error(`Erro ao salvar balcão no PostgreSQL: ${err?.message}`);
      }
    }

    const idx = this.memoryPoints.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.memoryPoints[idx] = point;
    } else {
      this.memoryPoints.push(point);
    }
    return point;
  }

  async delete(id: string) {
    if (this.db.isDatabaseConnected()) {
      try {
        await this.db.query('DELETE FROM pickup_points WHERE id = $1', [String(id)]);
      } catch (err: any) {
        this.logger.error(`Erro ao excluir balcão no PostgreSQL: ${err?.message}`);
      }
    }
    this.memoryPoints = this.memoryPoints.filter(p => String(p.id) !== String(id));
    return { success: true };
  }
}

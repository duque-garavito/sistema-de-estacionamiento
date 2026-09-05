import { DashboardRepository } from '../repositories/dashboard.repository.js';
import { DashboardStatsDTO } from '../types/dashboard.types.js';

export class DashboardService {
  private repo = new DashboardRepository();

  async obtenerStats(): Promise<DashboardStatsDTO> {
    return await this.repo.obtenerStatsConsolidadas();
  }
}

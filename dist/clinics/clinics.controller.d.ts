import { ClinicsService } from './clinics.service';
export declare class ClinicsController {
    private readonly clinicsService;
    constructor(clinicsService: ClinicsService);
    findAll(): Promise<{
        id: any;
        name: any;
    }[]>;
}

import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    findAll(clinic_id?: string, service_id?: string): Promise<any[]>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let DoctorsService = class DoctorsService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findAll(clinic_id, service_id) {
        if (!clinic_id || !service_id) {
            return [];
        }
        const { data, error } = await this.supabaseService
            .getClient()
            .from('doctors')
            .select('*, users!inner(name), doctor_services!inner(service_id)')
            .eq('clinic_id', clinic_id)
            .eq('is_available', true)
            .eq('doctor_services.service_id', service_id);
        if (error) {
            throw new Error(error.message);
        }
        const doctors = data?.map((doc) => ({
            ...doc,
            name: doc.users?.name || 'Bác sĩ',
        }));
        return doctors ?? [];
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map
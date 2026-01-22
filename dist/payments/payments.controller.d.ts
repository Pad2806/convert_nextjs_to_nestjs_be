import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(query: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    handleSepayWebhook(payload: any): Promise<{
        ok: boolean;
        alreadyPaid?: undefined;
        success?: undefined;
    } | {
        ok: boolean;
        alreadyPaid: boolean;
        success?: undefined;
    } | {
        success: boolean;
        ok?: undefined;
        alreadyPaid?: undefined;
    }>;
}

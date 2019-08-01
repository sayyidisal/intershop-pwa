import { PriceItem } from '../price-item/price-item.interface';
import { PriceData } from '../price/price.interface';

/**
 * Payment data which are saved at basket and order
 */

export interface PaymentData {
  id: string;
  paymentInstrument: string;
  paymentMethod: string;
  paymentCosts?: PriceItem;
  redirectRequired: boolean;
  redirect: {
    redirectUrl: string;
  };
  totalAmount: { gross: PriceData };
  status?: string;
}

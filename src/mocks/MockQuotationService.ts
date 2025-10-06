import { FormData, ProductConfig } from '../types';
import { calculateCompleteTotalPrice } from '../utils/priceCalculator';
import templateHtml from './Quotation-SQTN25-00057.html?raw';

// Simple in-memory store of submitted quotations so we can render a detailed HTML/PDF
const quotationStore: Map<string, FormData> = new Map();

/** Replace all token occurrences without String.prototype.replaceAll (works on older libs) */
function applyTokens(src: string, tokens: Record<string, string>): string {
  let out = src;
  for (const [key, val] of Object.entries(tokens)) {
    // token keys are like {{TOKEN}}, no regex needed
    out = out.split(key).join(val);
  }
  return out;
}

export const MockQuotationService = {
  calculateProductTotal(config: ProductConfig): number {
    return calculateCompleteTotalPrice(config);
  },

  async submitQuotation(_formData: FormData): Promise<{ quotationId: string; customerId?: string }> {
    await new Promise(r => setTimeout(r, 300));
    const quotationId = `QTN-MOCK-${String(quotationStore.size + 1).padStart(4, '0')}`;
    quotationStore.set(quotationId, _formData);
    return { quotationId, customerId: _formData.customerInfo.customerId || undefined };
  },

  async getQuotationPDF(quotationId: string): Promise<Blob> {
    // Return filled HTML so browser can print to PDF
    const stored = quotationStore.get(quotationId);
    const c = stored?.customerInfo;
    const cfg = stored?.productConfigs?.[0];

    const productName = cfg?.product?.name || '—';
    const qty = cfg ? (Number(cfg.requirements?.lifts || '1') || 1) : 1;
    const subtotal = cfg ? calculateCompleteTotalPrice(cfg) : 0;
    const stops = cfg ? (Number(cfg.requirements?.stops || '0') || 0) : 0;
    const passengers = cfg?.requirements?.passengers || (cfg?.product?.capacity != null ? String(cfg.product.capacity) : '—');
    const buildingType = cfg?.requirements?.buildingType || '—';
    const ratedSpeed = (cfg?.product as any)?.maxSpeed ?? '—';
    const floorDesignation = stops > 0 ? `G+${Math.max(0, stops - 1)}` : '—';
    const doorFinish = cfg?.interiorOptions?.elevatorDoorFinish?.name || '—';
    const cabinFinish = cfg?.interiorOptions?.cabInteriorFinish?.name || '—';
    const doorOpeningStyle = cfg?.requirements?.custom_door_opening_style || 'Side Opening';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + 1);
    const validTillStr = `${pad(validUntil.getDate())}-${pad(validUntil.getMonth() + 1)}-${validUntil.getFullYear()}`;

    const formatAmt = (n: number) =>
      `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const discountPct = stored?.additional_discount_percentage ? Number(stored.additional_discount_percentage) : 0;
    const discountAmt = subtotal * (discountPct / 100);
    const taxableAmt = subtotal - discountAmt;

    const companyAddress = c
      ? [
          c.address || '',
          c.address2 || '',
          c.city || '',
          c.state || '',
          c.zipCode ? `PIN Code: ${c.zipCode}` : '',
          c.country || ''
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const siteAddress = c
      ? [
          (c.customerName || `${c.firstName} ${c.lastName}`).trim(),
          c.siteAddress || c.address || '',
          c.siteAddress2 || c.address2 || '',
          [c.siteCity || c.city || '', c.siteState || c.state || '', c.siteZipCode || c.zipCode || '']
            .filter(Boolean)
            .join(', '),
          c.siteCountry || c.country || ''
        ]
          .filter(Boolean)
          .join('\n')
      : '';

    const tokens: Record<string, string> = {
      '{{QUOTATION_NO}}': quotationId,
      '{{OFFER_DATE}}': dateStr,
      '{{OFFER_FOR}}': (c ? (c.customerName || `${c.firstName} ${c.lastName}`) : '—').trim(),
      '{{MODEL_NAME}}': productName,
      '{{CONTACT_NAME}}': (c ? (`${c.firstName} ${c.lastName}`) : '—').trim(),
      '{{CONTACT_PHONE}}': c?.phoneNumber || '—',
      '{{CONTACT_EMAIL}}': c?.email || '—',
      '{{GSTIN}}': c?.gstin || '—',
      '{{SALES_PERSON}}': 'Evanam Sales',
      '{{REQUESTED_DELIVERY_DATE}}': cfg?.requirements?.custom_requested_delivery_date || '—',
      '{{BUILDING_TYPE}}': buildingType,
      '{{NUM_UNITS}}': String(qty),
      '{{RATED_CAPACITY}}': String(passengers),
      '{{RATED_SPEED}}': String(ratedSpeed),
      '{{FLOOR_DESIGNATION}}': floorDesignation,
      '{{STOPS}}': String(stops || '—'),
      '{{ACCESS_SIDES}}': doorOpeningStyle,
      '{{DOOR_FINISH}}': doorFinish,
      '{{CABIN_FINISH}}': cabinFinish,
      '{{CEILING_FINISH}}': cfg?.requirements?.custom_ceiling_finish || '—',
      '{{CEILING_TYPE}}': cfg?.requirements?.custom_ceiling_type || '—',
      '{{ADDRESS_LINE1}}': c?.address || '',
      '{{VALID_TILL}}': validTillStr,
      '{{COMPANY_ADDRESS_BLOCK}}': companyAddress,
      '{{SITE_ADDRESS_BLOCK}}': siteAddress,
      '{{PRODUCT_CODE}}': cfg?.product?.id || '—',
      '{{QTY_NOS}}': `${qty} Nos`,
      '{{LINE_ITEM_DESC}}': `${productName} Package: ${cfg?.package?.name || '—'} Requirements: ${qty} lift(s), ${stops || '—'} stops`,
      '{{LINE_ITEM_AMOUNT}}': formatAmt(subtotal),
      '{{TAXABLE_AMOUNT}}': formatAmt(taxableAmt),
      '{{CGST_RATE}}': '0.0%',
      '{{SGST_RATE}}': '0.0%',
      '{{CGST_AMOUNT}}': formatAmt(0),
      '{{SGST_AMOUNT}}': formatAmt(0),
      '{{DISCOUNT_AMOUNT}}': formatAmt(discountAmt),
      '{{AMOUNT_IN_WORDS}}': '', // fill if you have a number-to-words helper
      '{{GRAND_TOTAL}}': formatAmt(taxableAmt)
    };

    const filled = applyTokens(templateHtml, tokens);
    return new Blob([filled], { type: 'text/html;charset=utf-8' });
  },

  async getQuotationHTML(quotationId: string): Promise<Blob> {
    return this.getQuotationPDF(quotationId);
  }
};

export default MockQuotationService;

import { FormData, ProductConfig } from '../types';
import { calculateCompleteTotalPrice } from '../utils/priceCalculator';
import templateHtml from './Quotation-SQTN25-00057.html?raw';

function generateMockPdf(content: string): Blob {
  const pdf = `%PDF-1.4\n1 0 obj<<>>endobj\n2 0 obj<< /Length 3 0 R >>stream\nBT /F1 12 Tf 72 720 Td (${content.replace(/\(/g, '[').replace(/\)/g, ']')}) Tj ET\nendstream\nendobj\n3 0 obj  ${content.length + 50} endobj\n4 0 obj<< /Type /Catalog /Pages 5 0 R >>endobj\n5 0 obj<< /Type /Pages /Kids [6 0 R] /Count 1 >>endobj\n6 0 obj<< /Type /Page /Parent 5 0 R /MediaBox [0 0 612 792] /Resources<< /Font<< /F1 7 0 R>>>> /Contents 2 0 R >>endobj\n7 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 8\n0000000000 65535 f \n0000000010 00000 n \n0000000051 00000 n \n0000000240 00000 n \n0000000270 00000 n \n0000000325 00000 n \n0000000389 00000 n \n0000000534 00000 n \ntrailer<< /Size 8 /Root 4 0 R >>\nstartxref\n600\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

// Simple in-memory store of submitted quotations so we can render a detailed PDF
const quotationStore: Map<string, FormData> = new Map();

function buildQuotationSummary(formData: FormData, quotationId: string): string {
  const c = formData.customerInfo;
  const lines: string[] = [];
  lines.push(`Quotation: ${quotationId}`);
  lines.push(`Customer: ${c.customerName || `${c.firstName} ${c.lastName}`}`);
  lines.push(`Type: ${c.customerType}`);
  lines.push(`GSTIN: ${c.gstin || '-'}`);
  lines.push(`Email: ${c.email || '-'}`);
  lines.push(`Phone: ${c.phoneNumber || '-'}`);
  lines.push(`Address: ${c.address}${c.address2 ? ', ' + c.address2 : ''}, ${c.city}, ${c.state} ${c.zipCode}`);
  lines.push(`Site Address: ${c.siteAddress || c.address}${c.siteAddress2 ? ', ' + c.siteAddress2 : ''}`);
  lines.push('');

  let grandTotal = 0;
  formData.productConfigs.forEach((cfg, idx) => {
    const subtotal = calculateCompleteTotalPrice(cfg);
    grandTotal += subtotal;
    lines.push(`Item ${idx + 1}: ${cfg.product.name}`);
    lines.push(`  Base Price: ₹${cfg.product.price}`);
    lines.push(`  Package: ${cfg.package.name} (₹${cfg.package.price})`);
    lines.push(`  Interior: Cab(${cfg.interiorOptions.cabInteriorFinish.name}) Door(${cfg.interiorOptions.elevatorDoorFinish.name})`);
    if (cfg.addons.length > 0) {
      lines.push('  Addons:');
      cfg.addons.forEach(a => lines.push(`    - ${a.name} (₹${a.price})`));
    }
    const r = cfg.requirements;
    lines.push(`  Requirements: ${r.passengers}P, ${r.stops} stops, building: ${r.buildingType}`);
    lines.push(`  Subtotal: ₹${subtotal}`);
    lines.push('');
  });

  if (formData.additional_discount_percentage) {
    lines.push(`Discount: ${formData.additional_discount_percentage}%`);
  }
  if (formData.taxes_and_charges) {
    lines.push(`Taxes: ${formData.taxes_and_charges}${formData.tax_category ? ' (' + formData.tax_category + ')' : ''}`);
  }

  lines.push(`Grand Total (approx): ₹${grandTotal}`);

  // PDF single-line text content: replace newlines with separators to keep the simple generator working
  return lines.join(' | ');
}

export const MockQuotationService = {
  calculateProductTotal(config: ProductConfig): number {
    return calculateCompleteTotalPrice(config);
  },

  async submitQuotation(_formData: FormData): Promise<{ quotationId: string; customerId?: string; }> {
    await new Promise(r => setTimeout(r, 300));
    const quotationId = `QTN-MOCK-${String(quotationStore.size + 1).padStart(4, '0')}`;
    quotationStore.set(quotationId, _formData);
    return { quotationId, customerId: _formData.customerInfo.customerId || undefined };
  },

  async getQuotationPDF(quotationId: string): Promise<Blob> {
    // For now, return the filled HTML so it can be printed to PDF by the browser
    const stored = quotationStore.get(quotationId);
    const c = stored?.customerInfo;
    const cfg = stored?.productConfigs?.[0];
    const productName = cfg?.product?.name || '—';
    const qty = cfg ? (Number(cfg.requirements?.lifts || '1') || 1) : 1;
    const subtotal = cfg ? calculateCompleteTotalPrice(cfg) : 0;
    const stops = cfg ? (Number(cfg.requirements?.stops || '0') || 0) : 0;
    const passengers = cfg?.requirements?.passengers || (cfg?.product?.capacity != null ? String(cfg.product.capacity) : '—');
    const buildingType = cfg?.requirements?.buildingType || '—';
    const ratedSpeed = cfg?.product?.maxSpeed || '—';
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

    const formatAmt = (n: number) => `₹ ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const discountPct = stored?.additional_discount_percentage ? Number(stored.additional_discount_percentage) : 0;
    const discountAmt = subtotal * (discountPct / 100);
    const taxableAmt = subtotal - discountAmt;

    const companyAddress = c ? [
      c.address || '',
      c.address2 || '',
      c.city || '',
      c.state || '',
      c.zipCode ? `PIN Code: ${c.zipCode}` : '',
      c.country || ''
    ].filter(Boolean).join('\n') : '';
    const siteAddress = c ? [
      (c.customerName || `${c.firstName} ${c.lastName}`).trim(),
      c.siteAddress || c.address || '',
      c.siteAddress2 || c.address2 || '',
      [c.siteCity || c.city || '', c.siteState || c.state || '', c.siteZipCode || c.zipCode || ''].filter(Boolean).join(', '),
      c.siteCountry || c.country || ''
    ].filter(Boolean).join('\n') : '';

    const html = templateHtml
      .replaceAll('{{QUOTATION_NO}}', quotationId)
      .replaceAll('{{OFFER_DATE}}', dateStr)
      .replaceAll('{{OFFER_FOR}}', (c ? (c.customerName || `${c.firstName} ${c.lastName}`) : '—').trim())
      .replaceAll('{{MODEL_NAME}}', productName)
      .replaceAll('{{CONTACT_NAME}}', (c ? (`${c.firstName} ${c.lastName}`) : '—').trim())
      .replaceAll('{{CONTACT_PHONE}}', c?.phoneNumber || '—')
      .replaceAll('{{CONTACT_EMAIL}}', c?.email || '—')
      .replaceAll('{{GSTIN}}', c?.gstin || '—')
      .replaceAll('{{SALES_PERSON}}', 'Evanam Sales')
      .replaceAll('{{REQUESTED_DELIVERY_DATE}}', cfg?.requirements?.custom_requested_delivery_date || '—')
      .replaceAll('{{BUILDING_TYPE}}', buildingType)
      .replaceAll('{{NUM_UNITS}}', String(qty))
      .replaceAll('{{RATED_CAPACITY}}', String(passengers))
      .replaceAll('{{RATED_SPEED}}', ratedSpeed)
      .replaceAll('{{FLOOR_DESIGNATION}}', floorDesignation)
      .replaceAll('{{STOPS}}', String(stops || '—'))
      .replaceAll('{{ACCESS_SIDES}}', doorOpeningStyle)
      .replaceAll('{{DOOR_FINISH}}', doorFinish)
      .replaceAll('{{CABIN_FINISH}}', cabinFinish)
      .replaceAll('{{CEILING_FINISH}}', cfg?.requirements?.custom_ceiling_finish || '—')
      .replaceAll('{{CEILING_TYPE}}', cfg?.requirements?.custom_ceiling_type || '—')
      .replaceAll('{{ADDRESS_LINE1}}', c?.address || '')
      .replaceAll('{{VALID_TILL}}', validTillStr)
      .replaceAll('{{COMPANY_ADDRESS_BLOCK}}', companyAddress)
      .replaceAll('{{SITE_ADDRESS_BLOCK}}', siteAddress)
      .replaceAll('{{PRODUCT_CODE}}', cfg?.product?.id || '—')
      .replaceAll('{{QTY_NOS}}', `${qty} Nos`)
      .replaceAll('{{LINE_ITEM_DESC}}', `${productName} Package: ${cfg?.package?.name || '—'} Requirements: ${qty} lift(s), ${stops || '—'} stops`)
      .replaceAll('{{LINE_ITEM_AMOUNT}}', formatAmt(subtotal))
      .replaceAll('{{TAXABLE_AMOUNT}}', formatAmt(taxableAmt))
      .replaceAll('{{CGST_RATE}}', '0.0%')
      .replaceAll('{{SGST_RATE}}', '0.0%')
      .replaceAll('{{CGST_AMOUNT}}', formatAmt(0))
      .replaceAll('{{SGST_AMOUNT}}', formatAmt(0))
      .replaceAll('{{DISCOUNT_AMOUNT}}', formatAmt(discountAmt))
      .replaceAll('{{AMOUNT_IN_WORDS}}', '')
      .replaceAll('{{GRAND_TOTAL}}', formatAmt(taxableAmt));

    return new Blob([html], { type: 'text/html;charset=utf-8' });
  },

  async getQuotationHTML(quotationId: string): Promise<Blob> {
    // Alias of getQuotationPDF for clarity in callers needing preview
    return this.getQuotationPDF(quotationId);
  }
};

export default MockQuotationService;



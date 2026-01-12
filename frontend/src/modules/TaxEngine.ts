export const TAX_RATES = {
    // Standard Ghana Statutory Levies (2025)
    NHIL: 0.025,   // 2.5% National Health Insurance Levy
    GETFund: 0.025, // 2.5% GETFund Levy
    COVID: 0.01,   // 1% COVID-19 Health Recovery Levy
    VAT: 0.15,     // 15% Value Added Tax (Calculated on [Base + Levies])
};

export interface TaxBreakdown {
    baseAmount: number;
    nhil: number;
    getfund: number;
    covid: number;
    vatableAmount: number;
    vat: number;
    totalTax: number;
    grandTotal: number;
}

/**
 * Calculates Ghana taxes based on the standard scheme.
 * Base Amount -> Add Levies (NHIL, GETFund, COVID) -> Vatable Amount -> Add VAT.
 */
export function calculateGhanaTax(baseAmount: number): TaxBreakdown {
    const nhil = baseAmount * TAX_RATES.NHIL;
    const getfund = baseAmount * TAX_RATES.GETFund;
    const covid = baseAmount * TAX_RATES.COVID;

    const levies = nhil + getfund + covid;
    const vatableAmount = baseAmount + levies;

    const vat = vatableAmount * TAX_RATES.VAT;

    return {
        baseAmount,
        nhil,
        getfund,
        covid,
        vatableAmount,
        vat,
        totalTax: levies + vat,
        grandTotal: baseAmount + levies + vat,
    };
}

'use strict';

/**
 * TransGlobe Insurance 示範入口網站的確定性報價引擎。
 *
 * 公式刻意保持簡單且完全確定（無隨機性，除了呼叫端提供的
 * `startDate` 外不依賴系統時鐘），以便 Playwright 測試能斷言精確數字。
 */

const BASE_MONTHLY_RATE = {
  auto: 45,
  home: 60,
  life: 80,
  travel: 25,
  health: 95,
};

const COVERAGE_LOADING_RATE = 0.0008; // 每單位保額、每月的加成
const ANNUAL_DISCOUNT = 0.95; // 年繳折扣 5%

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * 計算在指定基準日期的年齡（整數年）。
 * @param {string} dob - ISO 日期字串 (YYYY-MM-DD)
 * @param {string} referenceDate - ISO 日期字串 (YYYY-MM-DD)
 */
function calculateAge(dob, referenceDate) {
  const birth = new Date(`${dob}T00:00:00Z`);
  const reference = new Date(`${referenceDate}T00:00:00Z`);
  let age = reference.getUTCFullYear() - birth.getUTCFullYear();
  const hasHadBirthdayThisYear =
    reference.getUTCMonth() > birth.getUTCMonth() ||
    (reference.getUTCMonth() === birth.getUTCMonth() && reference.getUTCDate() >= birth.getUTCDate());
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }
  return age;
}

function ageFactorFor(age) {
  if (age < 25) return 0.15;
  if (age <= 40) return 0;
  if (age <= 60) return 0.1;
  return 0.25;
}

/**
 * 用來以送出的輸入建立穩定、類似人類可讀的報價編號的
 * 小型確定性字串雜湊（djb2）。
 */
function djb2Hex(input) {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // 強制轉為無號 32 位元並以大寫十六進位呈現。
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

const PRODUCT_CODE = {
  auto: 'AUT',
  home: 'HOM',
  life: 'LIF',
  travel: 'TRV',
  health: 'HLT',
};

/**
 * 驗證報價請求的 payload。
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
function validateQuoteInput(input) {
  const errors = {};
  const fullName = (input.fullName || '').trim();
  const email = (input.email || '').trim();
  const dob = input.dob || '';
  const product = (input.product || '').toLowerCase();
  const coverageAmount = Number(input.coverageAmount);
  const startDate = input.startDate || '';

  if (!fullName) errors.fullName = 'Full name is required.';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'A valid email address is required.';
  }
  if (!dob || Number.isNaN(new Date(`${dob}T00:00:00Z`).getTime())) {
    errors.dob = 'A valid date of birth is required.';
  }
  if (!product || !BASE_MONTHLY_RATE[product]) {
    errors.product = 'Please choose a valid product.';
  }
  if (!coverageAmount || coverageAmount <= 0) {
    errors.coverageAmount = 'Coverage amount must be a positive number.';
  }
  if (!startDate || Number.isNaN(new Date(`${startDate}T00:00:00Z`).getTime())) {
    errors.startDate = 'A valid policy start date is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * 為已驗證的報價請求計算確定性報價。
 */
function computeQuote(input) {
  const fullName = input.fullName.trim();
  const email = input.email.trim();
  const dob = input.dob;
  const product = input.product.toLowerCase();
  const coverageAmount = Number(input.coverageAmount);
  const startDate = input.startDate;

  const age = calculateAge(dob, startDate);
  const baseRate = BASE_MONTHLY_RATE[product];
  const coverageLoading = round2(coverageAmount * COVERAGE_LOADING_RATE);
  const ageFactor = ageFactorFor(age);
  const preSurcharge = baseRate + coverageLoading;
  const monthlyPremium = round2(preSurcharge * (1 + ageFactor));
  const annualPremium = round2(monthlyPremium * 12 * ANNUAL_DISCOUNT);

  const hash = djb2Hex(`${fullName}|${email}|${dob}|${product}|${coverageAmount}|${startDate}`);
  const quoteId = `Q-${PRODUCT_CODE[product]}-${hash.slice(0, 6)}`;

  return {
    quoteId,
    product,
    age,
    baseRate,
    coverageLoading,
    ageSurchargePercent: Math.round(ageFactor * 100),
    monthlyPremium,
    annualPremium,
    currency: 'USD',
  };
}

module.exports = { validateQuoteInput, computeQuote, calculateAge, BASE_MONTHLY_RATE };

'use strict';

/**
 * 「線上報價」頁面的前端行為。
 * 所有計算都在伺服器端進行（server/quote.js），因此 UI 只是
 * 包在單一 JSON API 呼叫之上、輕量且確定性的呈現層。
 */
(function () {
  const form = document.getElementById('quote-form');
  const submitButton = document.getElementById('get-quote-btn');
  const formAlert = document.getElementById('form-alert');
  const resultPanel = document.getElementById('quote-result');

  const FIELDS = ['fullName', 'email', 'dob', 'product', 'coverageAmount', 'startDate'];

  function fieldElement(name) {
    return form.elements.namedItem(name);
  }

  function errorElementFor(name) {
    const kebab = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    return document.getElementById(`${kebab}-error`);
  }

  function clearErrors() {
    formAlert.classList.remove('is-visible');
    formAlert.textContent = '';
    FIELDS.forEach((name) => {
      const el = errorElementFor(name);
      if (el) el.textContent = '';
    });
  }

  function showErrors(errors) {
    const fieldErrors = Object.keys(errors).filter((key) => key !== 'form');
    fieldErrors.forEach((name) => {
      const el = errorElementFor(name);
      if (el) el.textContent = errors[name];
    });

    formAlert.textContent =
      errors.form || `請修正 ${fieldErrors.length} 個標示的欄位後再試一次。`;
    formAlert.classList.add('is-visible');
  }

  function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
  }

  function renderQuote(quote) {
    document.getElementById('quote-id').textContent = quote.quoteId;
    document.getElementById('quote-monthly').textContent = formatCurrency(quote.monthlyPremium);
    document.getElementById('quote-annual').textContent = formatCurrency(quote.annualPremium);
    document.getElementById('quote-base-rate').textContent = formatCurrency(quote.baseRate);
    document.getElementById('quote-coverage-loading').textContent = formatCurrency(quote.coverageLoading);
    document.getElementById('quote-age-surcharge').textContent = `${quote.ageSurchargePercent}%`;
    resultPanel.classList.add('is-visible');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors();
    resultPanel.classList.remove('is-visible');

    const payload = {
      fullName: fieldElement('fullName').value,
      email: fieldElement('email').value,
      dob: fieldElement('dob').value,
      product: fieldElement('product').value,
      coverageAmount: fieldElement('coverageAmount').value,
      startDate: fieldElement('startDate').value,
    };

    submitButton.disabled = true;
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        showErrors(data.errors || { form: '無法計算報價。' });
        return;
      }

      renderQuote(data.quote);
    } catch (err) {
      showErrors({ form: '計算報價時發生網路錯誤，請再試一次。' });
    } finally {
      submitButton.disabled = false;
    }
  });
})();
